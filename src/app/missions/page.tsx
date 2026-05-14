import Link from "next/link";
import type { Metadata } from "next";
import { getAllTeamsProgress } from "@/lib/missions/vault-fetcher";
import {
  getAllWeeks,
  getCurrentWeek,
  daysUntilDeadline,
  type WeekInfo,
} from "@/lib/missions/schedule-parser";
import {
  getWeek,
  type MissionTitle as Mission,
} from "@/lib/missions/weeks-repo";
import type {
  TeamProgress,
  MissionSubmission,
} from "@/lib/missions/types";

export const metadata: Metadata = {
  title: "주차별 미션 — 스폰지클럽 1기",
  description: "스폰지클럽 1기 멤버 전용 주차별 과제·공지·질문 게시판",
};

// Next.js ISR — 5분 캐시 (Supabase read + 외부 vault fetch 둘 다)
export const revalidate = 300;

// ─── 데이터 소스 현황 ────────────────────────────────────────────────────────
//   1번 타임라인        ← vault 99_meta/주차일정.md (OG 날짜만)
//   2번 공지            ← (TODO) 어드민이 작성 → Supabase
//   3번 이번주 미션      ← Supabase missions_weeks (어드민 /admin/missions)
//   4번 일정 (시간들)    ← (TODO) 어드민이 작성 → Supabase
//   5번 진척 매트릭스    ← vault submit.md frontmatter (멤버 push)
//   6번 질문 & 공유      ← (TODO) 멤버가 사이트에서 직접 작성 → Supabase
// ──────────────────────────────────────────────────────────────────────────

export default async function MissionsPage() {
  // 1단계: 주차일정 fetch (vault) + 오늘 날짜 기반 현재 주차 결정
  const weeks = await getAllWeeks();
  const currentWeek = getCurrentWeek(weeks);
  const currentWeekFolder = currentWeek?.folder ?? "1주차_0510";

  // 2단계: 어드민 입력 미션 + 6개 조 진척을 병렬 fetch
  const [dbWeek, teamsProgress] = await Promise.all([
    getWeek(currentWeekFolder),
    getAllTeamsProgress(currentWeekFolder),
  ]);

  const missions = dbWeek?.missions ?? [];
  const replayUrl = dbWeek?.replayUrl ?? null;
  const dDay = currentWeek ? daysUntilDeadline(currentWeek) : null;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <PageHeader />

      <main className="mx-auto px-4 sm:px-5 pt-8 pb-20 max-w-lg md:max-w-6xl">
        {/* mobile: 단일 컬럼. desktop: 12-col 그리드로 정보 밀도 ↑ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 space-y-6 md:space-y-0">
          {/* 1 · 7주 타임라인 */}
          <section className="md:col-span-12">
            <TimelineSection weeks={weeks} />
          </section>

          {/* 3 · 이번주 미션 Hero (메인) */}
          <section className="md:col-span-8">
            <MissionHero
              week={currentWeek}
              missions={missions}
              dDay={dDay}
              replayUrl={replayUrl}
            />
          </section>

          {/* 4 · 일정 + 5 · 진척 (우측 사이드) */}
          <div className="md:col-span-4 space-y-6">
            <ScheduleSection week={currentWeek} dDay={dDay} />
            <ProgressSection teams={teamsProgress} />
          </div>

          {/* 2 · 공지 */}
          <section className="md:col-span-6">
            <NoticeSection />
          </section>

          {/* 6 · 질문 & 공유 */}
          <section className="md:col-span-6">
            <QuestionSection />
          </section>

          {/* CTA */}
          <section className="md:col-span-12">
            <CtaSection />
          </section>
        </div>
      </main>
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-2 border-[var(--ink)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 text-sm font-extrabold tracking-tight min-w-0">
          <Link
            href="/"
            className="text-[var(--ink)] shrink-0 hover:opacity-70 transition-opacity"
          >
            🧽 스폰지클럽
          </Link>
          <span className="text-[var(--ink-30)] hidden sm:inline">/</span>
          <span className="text-[var(--ink)] truncate hidden sm:inline">
            주차별 미션
          </span>
        </div>

        <nav className="flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-extrabold shrink-0">
          <span className="text-[var(--ink)] border-b-2 border-[var(--ink)] pb-0.5 hidden sm:inline">
            주차별 미션
          </span>
          <span
            className="text-[var(--ink-30)] cursor-not-allowed hidden md:inline"
            title="준비 중 — 추후 PR에서 추가"
          >
            스킬 & 인사이트
          </span>
          <Link
            href="/"
            className="text-[var(--ink-50)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
          >
            <span className="sm:hidden">홈</span>
            <span className="hidden sm:inline">이기적인 스폰지들</span>
            <span aria-hidden>↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─── 1. Timeline ────────────────────────────────────────────────────────────

function TimelineSection({ weeks }: { weeks: WeekInfo[] }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <SectionHeading>1 · 7주 커리큘럼</SectionHeading>
        <p className="text-[10px] text-[var(--ink-30)] font-medium">
          현재 주차는 노란색으로 강조됩니다
        </p>
      </div>
      {/* 모바일: 7-col 작은 칸 · 데스크탑: 가로로 펼친 큰 칸 */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weeks.map((w) => (
          <WeekPill key={w.week} week={w} />
        ))}
      </div>
    </div>
  );
}

function WeekPill({ week }: { week: WeekInfo }) {
  const isCurrent = week.status === "current";
  const isPast = week.status === "past";

  const classes = isCurrent
    ? "border-[var(--ink)] bg-[var(--yellow)] text-[var(--ink)]"
    : isPast
      ? "border-[var(--ink-10)] bg-[var(--paper)] text-[var(--ink-30)]"
      : "border-[var(--ink-10)] bg-[var(--paper)] text-[var(--ink-50)]";

  // "2026-05-10" → "5/10"
  const shortDate = formatShortDate(week.startDate);

  return (
    <div
      className={`border-2 ${classes} aspect-square md:aspect-auto md:py-3 flex flex-col items-center justify-center gap-0.5 md:gap-1`}
    >
      <span className="text-xs md:text-sm font-extrabold">
        {week.shortLabel}
      </span>
      <span className="text-[9px] md:text-[10px] font-medium opacity-80 hidden md:block">
        {shortDate}
      </span>
    </div>
  );
}

function formatShortDate(iso: string): string {
  // "2026-05-10" → "5/10"
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${parseInt(m[1], 10)}/${parseInt(m[2], 10)}`;
}

// ─── 2. Notices (placeholder, Slack 연동 후 채워짐) ───────────────────────────

function NoticeSection() {
  return (
    <div>
      <SectionHeading>2 · 📢 공지사항</SectionHeading>
      <PlaceholderCard label="Slack #0-공지사항 자동 수집 (최근 3–5건) — 후속 PR" />
    </div>
  );
}

// ─── 3. Mission Hero ────────────────────────────────────────────────────────

function MissionHero({
  week,
  missions,
  dDay,
  replayUrl,
}: {
  week: WeekInfo | null;
  missions: Mission[];
  dDay: number | null;
  replayUrl: string | null;
}) {
  const weekLabel = week?.label ?? "이번주";
  const dDayLabel = formatDday(dDay);

  return (
    <div>
      <SectionHeading>3 · 이번주 미션</SectionHeading>
      <div className="border-2 border-[var(--ink)] p-5 md:p-6 space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs font-extrabold text-[var(--ink-50)] tracking-wider">
              {weekLabel}
            </div>
            <div className="text-lg md:text-xl font-extrabold text-[var(--ink)] mt-1 leading-tight">
              스폰지클럽 1기 · 미션
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {dDayLabel && (
              <span className="text-xs font-extrabold border-2 border-[var(--ink)] bg-[var(--yellow)] px-2.5 py-1">
                {dDayLabel}
              </span>
            )}
            {replayUrl && (
              <a
                href={replayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors px-2.5 py-1"
              >
                <span aria-hidden>📺</span>
                <span>다시보기</span>
                <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        </div>

        {missions.length === 0 ? (
          <PlaceholderCard
            label={`${weekLabel} 미션 정보가 아직 없어요 (vault _missions.md 미작성)`}
          />
        ) : (
          <ol className="space-y-2.5">
            {missions.map((m) => (
              <li
                key={m.index}
                className="flex gap-3 items-start border-2 border-[var(--ink-10)] p-3 md:p-4"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-xs md:text-sm font-extrabold">
                  {m.index}
                </span>
                <div className="text-sm md:text-base text-[var(--ink)] font-medium leading-relaxed">
                  {m.title}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function formatDday(d: number | null): string | null {
  if (d === null) return null;
  if (d > 0) return `D-${d}`;
  if (d === 0) return "오늘 마감";
  return `D+${Math.abs(d)} (마감 지남)`;
}

// ─── 4. Schedule ────────────────────────────────────────────────────────────

function ScheduleSection({
  week,
  dDay,
}: {
  week: WeekInfo | null;
  dDay: number | null;
}) {
  const submitSub = formatDday(dDay) ?? "—";
  const endDateShort = week ? formatShortDate(week.endDate) : null;

  return (
    <div>
      <SectionHeading>4 · 이번주 일정</SectionHeading>
      <div className="grid grid-cols-3 gap-2">
        <ScheduleCard label="목 · Q&A" sub="시간 미정" />
        <ScheduleCard
          label="제출 마감"
          sub={`${submitSub}${endDateShort ? ` (${endDateShort})` : ""}`}
          highlight
        />
        <ScheduleCard label="공유회" sub="일 20시" />
      </div>
    </div>
  );
}

// ─── 5. Progress Matrix ─────────────────────────────────────────────────────

function ProgressSection({ teams }: { teams: TeamProgress[] }) {
  return (
    <div>
      <SectionHeading>5 · 6개 조 진척</SectionHeading>
      <ProgressMatrix teams={teams} />
    </div>
  );
}

// ─── 6. Questions (placeholder) ─────────────────────────────────────────────

function QuestionSection() {
  return (
    <div>
      <SectionHeading>6 · 미션 관련 질문 & 공유</SectionHeading>
      <PlaceholderCard label="Slack 자동 수집 + 미션 관련도 ≥70 게이팅 — 후속 PR" />
    </div>
  );
}

// ─── CTA ────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <Link
      href="/"
      className="block border-2 border-[var(--ink)] bg-[var(--paper)] px-5 py-4 text-center text-sm font-extrabold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
    >
      🧽 이기적인 스폰지들로 이동 →
    </Link>
  );
}

// ─── Shared subcomponents ───────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-extrabold text-[var(--ink-50)] mb-3 tracking-wider uppercase">
      {children}
    </h2>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-[var(--ink-10)] px-4 py-8 text-center text-xs text-[var(--ink-50)] font-medium leading-relaxed">
      {label}
    </div>
  );
}

function ScheduleCard({
  label,
  sub,
  highlight = false,
}: {
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 text-xs ${
        highlight
          ? "border-2 border-[var(--ink)] bg-[var(--yellow)]"
          : "border-2 border-[var(--ink-10)] bg-[var(--paper)]"
      }`}
    >
      <div className="font-extrabold text-[var(--ink)] leading-tight">
        {label}
      </div>
      <div className="text-[var(--ink-50)] mt-1">{sub}</div>
    </div>
  );
}

/**
 * 6개 조 진척 매트릭스 — vault에서 fetch한 실데이터 렌더링.
 */
function ProgressMatrix({ teams }: { teams: TeamProgress[] }) {
  const totalSubmitted = teams.reduce((sum, t) => sum + t.submittedCount, 0);
  const totalAll = teams.reduce((sum, t) => sum + t.totalCount, 0);

  if (totalAll === 0) {
    return (
      <div className="border-2 border-dashed border-[var(--ink-10)] px-4 py-6 text-center text-xs text-[var(--ink-50)] font-medium leading-relaxed">
        vault에서 미션 노트를 가져오지 못했어요.
        <br />
        (rate limit·일시 오류일 수 있어요. 5분 뒤 자동 재시도)
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-extrabold text-[var(--ink)]">
        <span>전체 진척</span>
        <span>
          <span className="text-[var(--ink)]">{totalSubmitted}</span>
          <span className="text-[var(--ink-30)]"> / {totalAll}</span>
        </span>
      </div>

      <div className="space-y-2">
        {teams.map((t) => (
          <TeamRow key={t.team} team={t} />
        ))}
      </div>

      <p className="text-[10px] text-[var(--ink-30)] mt-2 font-medium leading-relaxed">
        ✓ 제출 · ○ 미제출 — vault frontmatter `submitted: true` 기준.
        <br />
        vault push 후 최대 5분 안에 자동 반영.
      </p>
    </div>
  );
}

function TeamRow({ team }: { team: TeamProgress }) {
  if (team.totalCount === 0) {
    return (
      <div className="border-2 border-[var(--ink-10)] p-3">
        <div className="flex items-center justify-between mb-1 text-xs font-extrabold">
          <span className="text-[var(--ink)]">{team.team}</span>
          <span className="text-[var(--ink-30)]">— · 노트 없음</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-[var(--ink-10)] p-3">
      <div className="flex items-center justify-between mb-2 text-xs font-extrabold">
        <span className="text-[var(--ink)]">{team.team}</span>
        <span className="text-[var(--ink-50)]">
          <span className="text-[var(--ink)]">{team.submittedCount}</span>
          {" / "}
          {team.totalCount}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {team.members.map((m) => (
          <MemberChip key={m.filePath} member={m} />
        ))}
      </div>
    </div>
  );
}

function MemberChip({ member }: { member: MissionSubmission }) {
  return (
    <span
      title={member.member}
      className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold border-2 ${
        member.submitted
          ? "border-[var(--ink)] bg-[var(--yellow)] text-[var(--ink)]"
          : "border-[var(--ink-10)] bg-[var(--paper)] text-[var(--ink-30)]"
      }`}
    >
      <span aria-hidden>{member.submitted ? "✓" : "○"}</span>
      <span>{member.displayName}</span>
    </span>
  );
}
