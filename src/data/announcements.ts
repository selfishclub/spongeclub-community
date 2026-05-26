import type { Announcement } from "@/lib/types";

/**
 * 공지사항 — 통합 리스트.
 *  - Slack #0-공지사항 자동 수집 + 고정 자료(가이드·툴·사전 안내)
 *  - 정렬은 updatedAt desc
 *  - 홈 페이지: top 3 노출 / /announcements: 전체
 */
export const fallbackAnnouncements: Announcement[] = [
  // ─── 최근 (Slack 자동 수집) ────────────────────────────
  {
    id: "ann-1",
    label: "urgent",
    text: "5/15(목) 21:00 중간 Q&A Zoom 링크 변경됐어요 — 새 링크 확인 ↗",
    timeAgo: "방금",
    updatedAt: "2026-05-13T11:55:00+09:00",
  },
  {
    id: "ann-2",
    label: "schedule",
    text: "5/17(일) 이기적공유 사회는 6조 Alie님이 진행합니다 · 사전 자료 첨부",
    timeAgo: "2h 전",
    updatedAt: "2026-05-13T09:30:00+09:00",
  },
  {
    id: "ann-3",
    label: "material",
    text: "CLAUDE.md 예제 4종(마케터·1인대표·직장인·콘텐츠) Notion에 업로드됨",
    timeAgo: "어제",
    updatedAt: "2026-05-12T14:00:00+09:00",
  },

  // ─── 고정 (학습자료에서 이동) ──────────────────────────
  {
    id: "ann-pinned-1",
    label: "material",
    text: "스폰지클럽 사전 안내 노션 — 1기 OT 자료 모음",
    href: "https://sepia-quartz-81f.notion.site/1-3525c0a0464680d0a091e1c0d9321d1f?source=copy_link",
    timeAgo: "고정",
    updatedAt: "2026-05-03T10:00:00+09:00",
    pinned: true,
  },
  {
    id: "ann-pinned-2",
    label: "tool",
    text: "타입리스 무료로 1달 사용 가능한 링크",
    href: "https://www.typeless.com/?via=selfishclub",
    timeAgo: "고정",
    updatedAt: "2026-05-03T10:00:00+09:00",
    pinned: true,
  },
  {
    id: "ann-pinned-3",
    label: "guide",
    text: "옵시디언 깃헙 연동 가이드",
    href: "https://sepia-quartz-81f.notion.site/GitHub-3535c0a0464680f8b85ce171a978a230?source=copy_link",
    timeAgo: "고정",
    updatedAt: "2026-05-03T10:00:00+09:00",
    pinned: true,
  },
  {
    id: "ann-pinned-4",
    label: "guide",
    text: "스폰지클럽 옵시디언 × GitHub 연동 가이드",
    href: "https://sepia-quartz-81f.notion.site/GitHub-3535c0a0464680f8b85ce171a978a230?source=copy_link",
    timeAgo: "고정",
    updatedAt: "2026-05-03T10:00:00+09:00",
    pinned: true,
  },
];

/** 업데이트 일자 desc 정렬된 전체 공지사항. */
export const announcements: Announcement[] = [...fallbackAnnouncements].sort((a, b) =>
  b.updatedAt.localeCompare(a.updatedAt),
);

/** 홈 배너용 — 최신 3건만. */
export function recentAnnouncements(n = 3): Announcement[] {
  return announcements.slice(0, n);
}
