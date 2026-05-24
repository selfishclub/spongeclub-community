import generatedDiscussions from "./discussions.generated.json";
import type { Discussion } from "@/lib/types";

/**
 * 미션 관련 질문/노하우/사이트 — Slack에서 수집된 메시지 (Graphify 관련도 ≥ 70%).
 * 실제 운영 시 Supabase 쿼리로 교체.
 */
export const fallbackDiscussions: Discussion[] = [
  {
    id: "d-1",
    status: "unresolved",
    type: "question",
    title:
      "Claude Code 훅이 자꾸 무한루프 도는데 원인이 뭘까요? PostToolUse에서 또 Edit 호출하면 안 되는 거였나…",
    author: "조유리",
    team: 3,
    topicTags: ["에이전트"],
    relevance: 92,
    timeAgo: "2시간 전",
    reactions: [{ emoji: "💬", count: 3 }],
    hot: true,
  },
  {
    id: "d-2",
    status: "shared",
    type: "tip",
    title:
      "CLAUDE.md 4단 템플릿 — 역할·도구·메모리·금지사항으로 쪼개니까 톤이 안 흔들려요 (예제 첨부)",
    author: "방경은",
    team: 1,
    topicTags: ["AI-OS"],
    relevance: 88,
    timeAgo: "어제",
    reactions: [{ emoji: "👍", count: 12 }],
    linkToSkill: true,
  },
  {
    id: "d-3",
    status: "resolved",
    type: "question",
    title: "내 일에서 자동화 첫 타깃 어디부터? 마케터 입장에서 우선순위 잡는 법",
    author: "김민서",
    team: 2,
    topicTags: ["AI-OS"],
    relevance: 90,
    timeAgo: "어제",
    reactions: [
      { emoji: "💬", count: 7 },
      { emoji: "👍", count: 4 },
    ],
  },
  {
    id: "d-4",
    status: "unresolved",
    type: "question",
    title:
      "CLAUDE.md에 메모리 너무 많이 박으니까 응답이 느려져요. 토큰 관리 팁 있나요?",
    author: "CH H",
    team: 3,
    topicTags: ["에이전트"],
    relevance: 85,
    timeAgo: "5시간 전",
    reactions: [{ emoji: "💬", count: 1 }],
  },
  {
    id: "d-5",
    status: "shared",
    type: "tip",
    title: "에이전트에 '내 톤' 학습시키기 — 카피라이팅 system prompt 3패턴",
    author: "조유리",
    team: 3,
    topicTags: ["카피"],
    relevance: 78,
    timeAgo: "3일 전",
    reactions: [
      { emoji: "👏", count: 9 },
      { emoji: "❤️", count: 3 },
    ],
    linkToSkill: true,
  },
  {
    id: "d-6",
    status: "shared",
    type: "site",
    title:
      "Slack ↔ Notion 자동화, n8n vs Make vs 직접 짜기 어떤 게 나을까요? — 비교표 첨부",
    author: "투모스트",
    team: 2,
    topicTags: ["자동화"],
    relevance: 81,
    timeAgo: "3일 전",
    reactions: [
      { emoji: "💬", count: 12 },
      { emoji: "👍", count: 8 },
    ],
  },
];

const realDiscussions = generatedDiscussions as Discussion[];

export const discussions: Discussion[] =
  realDiscussions.length > 0 ? realDiscussions : fallbackDiscussions;

// ─── Helpers ──────────────────────────────────────────────
export function discussionCountByType(type?: "question" | "tip" | "site") {
  if (!type) return discussions.length;
  return discussions.filter((d) => d.type === type).length;
}

export const RELEVANCE_THRESHOLD = 70;
