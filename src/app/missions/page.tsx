import type { Metadata } from "next";
import "./missions.css";
import { getAllTeamsProgress } from "@/lib/missions/vault-fetcher";
import {
  getAllWeeks,
  getCurrentWeek,
  daysUntilDeadline,
} from "@/lib/missions/schedule-parser";
import { listWeeks } from "@/lib/missions/weeks-repo";
import { getMissionsFromVault } from "@/lib/missions/vault-missions-md";
import type { TeamProgress } from "@/lib/missions/types";
import { Header } from "./_components/Header";
import { MissionWeekView, type WeekView } from "./_components/MissionWeekView";
import { ScheduleStrip } from "./_components/ScheduleStrip";
import { AnnouncementBanner } from "./_components/AnnouncementBanner";
import { MissionDiscussion } from "./_components/MissionDiscussion";
import { CommunityCTA } from "./_components/CommunityCTA";
import { ProgressBoardSection } from "./_components/ProgressBoardSection";
import { NoteViewProvider } from "./_components/NoteViewProvider";

export const metadata: Metadata = {
  title: "주차별 미션 — 스폰지클럽 1기",
  description: "스폰지클럽 1기 멤버 전용 주차별 과제·공지·질문 게시판",
};

// Next.js ISR — 5분 캐시 (Supabase read + 외부 vault fetch 둘 다)
export const revalidate = 300;

// ─── 데이터 소스 현황 ────────────────────────────────────────────────────────
//   타임라인        ← vault 99_meta/주차일정.md (getAllWeeks).
//                     pill 클릭 시 모달이 아니라 아래 Hero 를 그 주차로 전환.
//   이번주 미션      ← Supabase missions_weeks (어드민 입력) 우선,
//                     비면 vault 02_mission/{folder}/_missions.md 폴백 (주차별).
//   다시보기 / 속기본 ← Supabase missions_weeks (replay_url / transcript_url).
//                     과거 주차는 그 주차 값, 현재 주차만 비면 직전 주차 값 승계.
//   일정            ← WeekInfo 마감일 + 정적값 (항상 현재 주차 기준)
//   현황판          ← vault submit.md frontmatter (getAllTeamsProgress, 전 주차)
//   공지 / 질문      ← Supabase(CONTENT) — 주차 구분 없는 글로벌 피드
// ──────────────────────────────────────────────────────────────────────────

export default async function MissionsPage() {
  // 1단계: 주차일정 fetch (vault) + 오늘 기준 현재 주차 결정
  const weeks = await getAllWeeks();
  const currentWeek = getCurrentWeek(weeks);
  const currentWeekNumber = currentWeek?.week ?? 0;

  // 2단계: 모든 주차의 vault 미션 + Supabase 주차 데이터 + 6개 조 진척을 병렬 fetch.
  //        폴더가 없는 미래 주차는 빈 결과를 반환한다(둘 다 graceful).
  const [vaultMissionsByWeek, dbWeeks, allWeeksProgress] = await Promise.all([
    Promise.all(weeks.map((w) => getMissionsFromVault(w.folder))),
    listWeeks(),
    Promise.all(weeks.map((w) => getAllTeamsProgress(w.folder))),
  ]);

  // 주차번호 → TeamProgress[] 맵 (pill 라벨과 폴더 1:1 매핑).
  const progressByWeek: Record<number, TeamProgress[]> = {};
  weeks.forEach((w, i) => {
    progressByWeek[w.week] = allWeeksProgress[i];
  });

  // 폴더 → Supabase missions_weeks 행.
  const dbByFolder = new Map(dbWeeks.map((w) => [w.weekFolder, w]));

  // 다시보기/속기본 승계 후보 — 현재 주차 이하에서 가장 최근(주차 내림차순) 값.
  // 주차가 넘어가 현재 주차 행이 비어도 직전 세션 링크가 사라지지 않게 한다.
  const carryCandidates = dbWeeks
    .filter((w) => w.weekNumber <= currentWeekNumber)
    .sort((a, b) => b.weekNumber - a.weekNumber);
  const carryReplay =
    carryCandidates.find((w) => w.replayUrl)?.replayUrl ?? null;
  const carryTranscript =
    carryCandidates.find((w) => w.transcriptUrl)?.transcriptUrl ?? null;

  // 주차별 뷰 데이터 — 타임라인 pill 클릭 시 MissionWeekView 가 여기서 골라
  // 그 주차의 Hero(미션·다시보기·속기본·참고자료)로 전환한다.
  const views: Record<number, WeekView> = {};
  weeks.forEach((w, i) => {
    const db = dbByFolder.get(w.folder) ?? null;
    // 어드민(Supabase) 우선, 비면 vault _missions.md 폴백
    const adminMissions = db?.missions ?? [];
    const missions =
      adminMissions.length > 0 ? adminMissions : vaultMissionsByWeek[i];
    const isCurrent = w.week === currentWeekNumber;
    views[w.week] = {
      week: w,
      heroTitle: db?.heroTitle ?? null,
      heroSubtitle: db?.heroSubtitle ?? null,
      missions,
      references: db?.references ?? [],
      // 과거 주차는 그 주차 행 값 그대로, 현재 주차만 비면 직전 주차 값 승계.
      replayUrl: db?.replayUrl ?? (isCurrent ? carryReplay : null),
      transcriptUrl: db?.transcriptUrl ?? (isCurrent ? carryTranscript : null),
      dDay: daysUntilDeadline(w),
    };
  });

  // 기본 표시 주차 — 현재 주차에 자체 콘텐츠(미션/공지/다시보기/참고자료)가
  // 있으면 현재 주차, 없으면 콘텐츠가 있는 가장 최근 과거 주차를 보여준다.
  // (현재 주차가 아직 미발행이라 비어 있을 때 빈 '곧 공개' 대신 실제 내용을 노출.
  //  현재 주차를 채워 발행하면 자동으로 현재 주차로 되돌아간다.)
  const hasOwnContent = (w: (typeof weeks)[number], i: number): boolean => {
    const db = dbByFolder.get(w.folder);
    const missions =
      db?.missions && db.missions.length > 0
        ? db.missions
        : vaultMissionsByWeek[i];
    return (
      missions.length > 0 ||
      !!db?.heroTitle ||
      !!db?.replayUrl ||
      !!db?.transcriptUrl ||
      (db?.references?.length ?? 0) > 0
    );
  };
  let defaultWeek = currentWeekNumber;
  if (!weeks.some((w, i) => w.week === currentWeekNumber && hasOwnContent(w, i))) {
    const prior = weeks
      .filter((w, i) => w.week <= currentWeekNumber && hasOwnContent(w, i))
      .sort((a, b) => b.week - a.week)[0];
    if (prior) defaultWeek = prior.week;
  }

  const currentDDay = views[currentWeekNumber]?.dDay ?? null;

  return (
    <NoteViewProvider>
      <Header />

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-6 flex-1 w-full">
        {/* 타임라인 + 선택 주차 Hero(미션·다시보기·속기본·참고자료) 인라인 전환 */}
        <MissionWeekView
          weeks={weeks}
          views={views}
          currentWeekNumber={currentWeekNumber}
          defaultWeek={defaultWeek}
        />

        {/* 스폰지 빌리지 현황 — 자체 주차 선택 pill 보유 (인라인 섹션) */}
        <ProgressBoardSection
          progressByWeek={progressByWeek}
          weeks={weeks}
          currentWeekNumber={currentWeekNumber}
        />

        <ScheduleStrip week={currentWeek} dDay={currentDDay} />

        {/* 공지사항 · 미션 질문 — 2열 (모바일은 1열) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <AnnouncementBanner />
          <MissionDiscussion />
        </div>

        <CommunityCTA />

        <footer className="text-center text-xs text-[#A7ADBA] pt-6 pb-12">
          스폰지클럽 1기 · 주차별 미션
        </footer>
      </main>
    </NoteViewProvider>
  );
}
