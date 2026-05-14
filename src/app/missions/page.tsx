import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "주차별 미션 — 스폰지클럽 1기",
  description: "스폰지클럽 1기 멤버 전용 주차별 과제·공지·질문 게시판",
};

// ─── PR 1: 스켈레톤 ─────────────────────────────────────────────────────────
// 이 페이지는 라우트 + 화면 골격만 잡습니다.
// 데이터는 후속 PR에서 연결됩니다:
//   PR2 — Supabase 마이그레이션 (missions_* 신규 테이블)
//   PR3 — Slack Events 수집 + 운영진 CMS API
//   PR4 — 4꼭지 UI를 실데이터로 교체
//   PR5 — Graphify 분류 + 미션 관련도 ≥70 게이팅
//
// 절대 건드리지 않는 영역:
//   src/app/page.tsx(이 PR에서 배너 1개만 추가) · src/app/{admin,admin-login,mypage,sessions}
//   src/app/api/{achievements,admin,auth,me,ranking,sessions,shell,slack}
//   src/lib/{achievement,auth,ranking,session,shell,slack}-service.ts (재사용은 OK)
//   middleware.ts · supabase/schema.sql 기존 테이블
// ──────────────────────────────────────────────────────────────────────────

export default function MissionsPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* ── Header: breadcrumb + 3-tab nav ── */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-2 border-[var(--ink)]">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-extrabold tracking-tight min-w-0">
            <span className="text-[var(--ink)]">🧽 스폰지클럽</span>
            <span className="text-[var(--ink-30)]">/</span>
            <span className="text-[var(--ink)] truncate">주차별 미션</span>
          </div>

          {/* nav tabs */}
          <nav className="flex items-center gap-5 text-xs font-extrabold">
            <span className="text-[var(--ink)] border-b-2 border-[var(--ink)] pb-0.5">
              주차별 미션
            </span>
            <span
              className="text-[var(--ink-30)] cursor-not-allowed"
              title="준비 중 — 추후 PR에서 추가"
            >
              스킬 & 인사이트
            </span>
            <Link
              href="/"
              className="text-[var(--ink-50)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
            >
              이기적인 스폰지들 <span aria-hidden>↗</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-8 pb-20 space-y-10">
        {/* ── WIP 안내 (PR1에서만 표시) ── */}
        <div className="border-2 border-[var(--ink)] bg-[var(--yellow-dim)] px-4 py-3 text-xs font-extrabold text-[var(--ink)] leading-relaxed">
          🚧 스켈레톤 화면입니다. 데이터 연결 작업은 후속 PR에서 진행됩니다.
          <br />
          화면 구조와 위치를 먼저 합의하기 위한 PR입니다.
        </div>

        {/* ── 1. 7주 타임라인 ── */}
        <section>
          <SectionHeading>1 · 7주 타임라인</SectionHeading>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square border-2 border-[var(--ink)] flex flex-col items-center justify-center text-xs font-extrabold ${
                  i === 1
                    ? "bg-[var(--yellow)] text-[var(--ink)]"
                    : "bg-[var(--paper)] text-[var(--ink-50)]"
                }`}
              >
                <span>{i === 0 ? "OT" : `${i}W`}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--ink-30)] mt-2 font-medium">
            현재 주차(노란색) — 운영진 입력값으로 표시 예정
          </p>
        </section>

        {/* ── 2. 공지 배너 ── */}
        <section>
          <SectionHeading>2 · 📢 공지사항</SectionHeading>
          <PlaceholderCard label="Slack #0-공지사항 자동 수집 (최근 3–5건)" />
        </section>

        {/* ── 3. 이번주 미션 Hero ── */}
        <section>
          <SectionHeading>3 · 이번주 미션</SectionHeading>
          <div className="border-2 border-[var(--ink)] p-5 space-y-4">
            <div>
              <div className="text-xs font-extrabold text-[var(--ink-50)] tracking-wider">
                1주차 · D-N
              </div>
              <div className="text-lg font-extrabold text-[var(--ink)] mt-1 leading-tight">
                미션 제목 자리 (운영진 CMS 입력)
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniCard icon="🎯" title="학습 목표" />
              <MiniCard icon="📦" title="결과물" />
              <MiniCard icon="📚" title="학습 자료" />
            </div>
          </div>
        </section>

        {/* ── 4. 이번주 일정 ── */}
        <section>
          <SectionHeading>4 · 이번주 일정</SectionHeading>
          <div className="grid grid-cols-3 gap-2">
            <ScheduleCard label="목 · Q&A" sub="시간 미정" />
            <ScheduleCard label="일 19시 · 제출 마감" sub="D-N" highlight />
            <ScheduleCard label="일 20시 · 공유" sub="3단" />
          </div>
        </section>

        {/* ── 5. 6개 조 진척 매트릭스 ── */}
        <section>
          <SectionHeading>5 · 6개 조 진척</SectionHeading>
          <PlaceholderCard label="spongeclub-homepage 진척 데이터 연동 예정 (조 × 멤버 칩)" />
        </section>

        {/* ── 6. 질문 & 공유 ── */}
        <section>
          <SectionHeading>6 · 미션 관련 질문 & 공유</SectionHeading>
          <PlaceholderCard label="Slack 자동 수집 + Graphify 미션 관련도 ≥70 게이팅 예정" />
        </section>

        {/* ── 7. 이기적인 스폰지들 CTA ── */}
        <section>
          <Link
            href="/"
            className="block border-2 border-[var(--ink)] bg-[var(--paper)] px-5 py-4 text-center text-sm font-extrabold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            🧽 이기적인 스폰지들로 이동 →
          </Link>
        </section>

        {/* ── footer hint ── */}
        <div className="pt-4 text-center text-xs text-[var(--ink-30)] font-medium leading-relaxed">
          ✏️ 질문·공유는 Slack에 작성하면 자동으로 여기 모입니다 (예정)
        </div>
      </main>
    </div>
  );
}

// ─── Local subcomponents (이 파일 안에만 존재) ──────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-extrabold text-[var(--ink-50)] mb-3 tracking-wider uppercase">
      {children}
    </h2>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-[var(--ink-10)] px-4 py-8 text-center text-xs text-[var(--ink-50)] font-medium">
      {label}
    </div>
  );
}

function MiniCard({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="border-2 border-[var(--ink-10)] p-3 text-xs">
      <div className="font-extrabold text-[var(--ink)]">
        {icon} {title}
      </div>
      <div className="text-[var(--ink-30)] mt-1">(데이터)</div>
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
