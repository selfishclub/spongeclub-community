import type { Metadata } from "next";
import "./missions.css";
import { getAllTeamsProgress } from "@/lib/missions/vault-fetcher";
import {
  getAllWeeks,
  getCurrentWeek,
  daysUntilDeadline,
} from "@/lib/missions/schedule-parser";
import { getWeek } from "@/lib/missions/weeks-repo";
import type { TeamProgress } from "@/lib/missions/types";
import { Header } from "./_components/Header";
import { WeekTimeline } from "./_components/WeekTimeline";
import { MissionHero } from "./_components/MissionHero";
import { ScheduleStrip } from "./_components/ScheduleStrip";
import { AnnouncementBanner } from "./_components/AnnouncementBanner";
import { MissionDiscussion } from "./_components/MissionDiscussion";
import { CommunityCTA } from "./_components/CommunityCTA";
import { ProgressBoardProvider } from "./_components/ProgressBoardProvider";
import { ProgressBoardSection } from "./_components/ProgressBoardSection";
import { NoteViewProvider } from "./_components/NoteViewProvider";

export const metadata: Metadata = {
  title: "주차별 미션 — 스폰지클럽 1기",
  description: "스폰지클럽 1기 멤버 전용 주차별 과제·공지·질문 게시판",
};

// Next.js ISR — 5분 캐시 (Supabase read + 외부 vault fetch 둘 다)
export const revalidate = 300;

// ─── 데이터 소스 현황 ────────────────────────────────────────────────────────
//   타임라인        ← vault 99_meta/주차일정.md (getAllWeeks)
//   이번주 미션      ← Supabase missions_weeks (getWeek)
//   일정            ← WeekInfo 마감일 + 정적값
//   현황판          ← vault submit.md frontmatter (getAllTeamsProgress, 전 주차)
//   공지 / 질문      ← (준비 중) Slack 연동 후속 PR
// ──────────────────────────────────────────────────────────────────────────

export default async function MissionsPage() {
  // 1단계: 주차일정 fetch (vault) + 오늘 기준 현재 주차 결정
  const weeks = await getAllWeeks();
  const currentWeek = getCurrentWeek(weeks);
  const currentWeekFolder = currentWeek?.folder ?? "1주차_0510";
  const currentWeekNumber = currentWeek?.week ?? 0;

  // 2단계: 어드민 입력 미션(현재 주차) + 모든 주차의 6개 조 진척을 병렬 fetch.
  //        폴더가 없는 미래 주차는 getAllTeamsProgress 가 빈 결과를 반환한다.
  const [dbWeek, allWeeksProgress] = await Promise.all([
    getWeek(currentWeekFolder),
    Promise.all(weeks.map((w) => getAllTeamsProgress(w.folder))),
  ]);

  // 주차번호 → TeamProgress[] 맵
  const progressByWeek: Record<number, TeamProgress[]> = {};
  weeks.forEach((w, i) => {
    progressByWeek[w.week] = allWeeksProgress[i];
  });

  const missions = dbWeek?.missions ?? [];
  const replayUrl = dbWeek?.replayUrl ?? null;
  const transcriptUrl = dbWeek?.transcriptUrl ?? null;
  const dDay = currentWeek ? daysUntilDeadline(currentWeek) : null;

  return (
    <NoteViewProvider>
      <ProgressBoardProvider
        progressByWeek={progressByWeek}
        weeks={weeks}
        currentWeekNumber={currentWeekNumber}
      >
        <Header />

        <main className="max-w-6xl mx-auto px-5 py-6 space-y-6 flex-1 w-full">
          <WeekTimeline weeks={weeks} />

          <MissionHero
            week={currentWeek}
            missions={missions}
            dDay={dDay}
            replayUrl={replayUrl}
            transcriptUrl={transcriptUrl}
          />

          <ScheduleStrip week={currentWeek} dDay={dDay} />

          {/* 공지사항 · 미션 질문 — 2열 (모바일은 1열) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <AnnouncementBanner />
            <MissionDiscussion />
          </div>

          {/* 과제 현황판 — 인라인 섹션 (멤버 카드 클릭 시 노트 모달) */}
          <ProgressBoardSection
            progressByWeek={progressByWeek}
            weeks={weeks}
            currentWeekNumber={currentWeekNumber}
          />

          <CommunityCTA />

          <footer className="text-center text-xs text-[#A7ADBA] pt-6 pb-12">
            스폰지클럽 1기 · 주차별 미션
          </footer>
        </main>
      </ProgressBoardProvider>
    </NoteViewProvider>
  );
}
