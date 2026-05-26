/**
 * 공지사항 배너 — /missions 인라인 위젯.
 *
 * Supabase `yulia_site_announcements` 에서 최근 공지 3건을 가져와 표시.
 * 데이터 소스는 /announcements 전체보기 페이지와 동일.
 *
 * env(CONTENT_SUPABASE_*) 미설정 또는 fetch 실패 시 supabase-content lib 가
 * fallback 데이터로 graceful degrade.
 */
import Link from "next/link";
import { getSiteAnnouncements } from "@/lib/supabase-content";
import type { Announcement } from "@/lib/types";

const BANNER_LIMIT = 3;

function displayTitle(a: Announcement): string {
  return a.title?.trim() || a.text;
}

export async function AnnouncementBanner() {
  const announcements = await getSiteAnnouncements(BANNER_LIMIT);

  if (announcements.length === 0) {
    return (
      <section className="rounded-2xl bg-white border border-[#FFD84D] px-5 py-4">
        <header className="flex items-center gap-2 mb-2">
          <span className="text-base">📢</span>
          <h3 className="font-bold text-sm">공지사항</h3>
        </header>
        <p className="text-xs text-[#5B6271] py-3 text-center">
          최근 공지가 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white border border-[#FFD84D] px-5 py-4">
      <header className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📢</span>
          <h3 className="font-bold text-sm">공지사항</h3>
          <span className="text-[11px] text-[#A7ADBA]">
            최근 {announcements.length}건
          </span>
        </div>
        <Link
          href="/announcements"
          className="text-[11px] font-bold text-[#5B6271] hover:text-[#2A2E35] transition"
        >
          전체보기 →
        </Link>
      </header>
      <ul className="divide-y divide-[#F1F2F5]">
        {announcements.map((a) => {
          const title = displayTitle(a);
          const Wrapper = a.href ? "a" : "div";
          const wrapperProps = a.href
            ? {
                href: a.href,
                target: "_blank" as const,
                rel: "noopener noreferrer" as const,
              }
            : {};
          return (
            <li key={a.id}>
              <Wrapper
                {...wrapperProps}
                className="flex items-center justify-between gap-3 py-2 group"
              >
                <span className="text-[13px] text-[#2A2E35] truncate group-hover:text-[#5B6271] transition">
                  {a.pinned ? "📌 " : ""}
                  {title}
                </span>
                <span className="text-[11px] text-[#A7ADBA] shrink-0">
                  {a.timeAgo}
                </span>
              </Wrapper>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
