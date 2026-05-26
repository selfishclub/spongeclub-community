/**
 * 미션 관련 질문 & 공유 — /missions 인라인 위젯.
 *
 * Supabase `yulia_site_questions` 에서 미션 관련도 ≥ 70 인 항목만 게이팅해서
 * 상위 5건을 표시. 데이터 소스는 /discussions 전체보기 페이지와 동일.
 *
 * env(CONTENT_SUPABASE_*) 미설정 또는 fetch 실패 시 supabase-content lib 가
 * fallback 데이터로 graceful degrade.
 */
import Link from "next/link";
import { getSiteDiscussions } from "@/lib/supabase-content";
import type { Discussion } from "@/lib/types";

const RELEVANCE_GATE = 70;
const DISPLAY_LIMIT = 5;

function statusBadge(d: Discussion) {
  if (d.status === "resolved") return { tag: "✅", label: "해결" };
  if (d.status === "shared") return { tag: "💡", label: "공유" };
  return { tag: d.hot ? "🔥" : "❓", label: d.hot ? "답 필요" : "질문" };
}

export async function MissionDiscussion() {
  const all = await getSiteDiscussions();
  const relevant = all
    .filter((d) => (d.relevance ?? 0) >= RELEVANCE_GATE)
    .slice(0, DISPLAY_LIMIT);

  if (relevant.length === 0) {
    return (
      <section className="rounded-2xl bg-white border border-[#E7E9EE]">
        <header className="p-5 pb-3">
          <h3 className="font-bold text-lg">💬 미션 관련 질문 &amp; 공유</h3>
          <p className="text-xs text-[#5B6271] mt-0.5">
            Slack 자동 수집 · 미션 관련도 ≥ {RELEVANCE_GATE}% 자동 게이팅
          </p>
        </header>
        <div className="px-5 pb-5">
          <p className="text-sm text-[#5B6271] py-6 text-center">
            아직 미션 관련 질문이 없습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white border border-[#E7E9EE]">
      <header className="p-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg">💬 미션 관련 질문 &amp; 공유</h3>
          <p className="text-xs text-[#5B6271] mt-0.5">
            Slack 자동 수집 · 미션 관련도 ≥ {RELEVANCE_GATE}% 자동 게이팅 · 최근{" "}
            {relevant.length}건
          </p>
        </div>
        <Link
          href="/discussions"
          className="text-[11px] font-bold text-[#5B6271] hover:text-[#2A2E35] transition shrink-0 mt-1"
        >
          전체보기 →
        </Link>
      </header>
      <ul className="divide-y divide-[#F1F2F5] px-5 pb-4">
        {relevant.map((d) => {
          const badge = statusBadge(d);
          const Wrapper = d.href ? "a" : "div";
          const wrapperProps = d.href
            ? {
                href: d.href,
                target: "_blank" as const,
                rel: "noopener noreferrer" as const,
              }
            : {};
          return (
            <li key={d.id}>
              <Wrapper
                {...wrapperProps}
                className="flex items-start justify-between gap-3 py-3 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#2A2E35] line-clamp-2 group-hover:text-[#5B6271] transition">
                    <span className="mr-1">{badge.tag}</span>
                    {d.title}
                  </p>
                  <p className="text-[11px] text-[#A7ADBA] mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>
                      {d.author} · {d.team}조
                    </span>
                    {d.topicTags.slice(0, 2).map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                    <span>{d.timeAgo}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#A7ADBA] shrink-0 mt-0.5">
                  {Math.round(d.relevance)}%
                </span>
              </Wrapper>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
