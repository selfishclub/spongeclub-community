// ─── Week timeline ────────────────────────────────────────
export type WeekStatus = "done" | "active" | "locked";

export interface WeekTimelineItem {
  /** 0–6 (스폰지클럽 1기 convention) */
  number: number;
  /** e.g. "5/3" */
  startDate: string;
  status: WeekStatus;
  /** "셋업" · "진행중" · "오프" · "발표" 같은 부가 라벨 */
  label?: string;
}

// ─── Announcement ─────────────────────────────────────────
export type AnnouncementLabel =
  | "urgent"
  | "schedule"
  | "material"
  | "guide"
  | "tool";

export interface Announcement {
  id: string;
  label: AnnouncementLabel;
  /** 접힌 상태에서 보이는 제목. 없으면 text에서 자동 생성 */
  title?: string;
  /** 펼쳤을 때 보이는 본문 */
  text: string;
  /** "방금" · "2h 전" · "어제" — pinned=true 인 경우 "고정" 사용 */
  timeAgo: string;
  /** 정렬용 ISO 날짜 (desc 정렬) */
  updatedAt: string;
  /** Slack 원본 메시지 또는 외부 자료 링크 */
  href?: string;
  /** 시간 무관 항상 노출 (가이드·툴·상시 안내) */
  pinned?: boolean;
}

// ─── Mission Hero ─────────────────────────────────────────
export interface Mission {
  /** 1부터 시작 (0주차는 셋업) */
  weekNumber: number;
  /** 1–6 (총 6주차) */
  totalWeeks: number;
  title: string;
  subtitle: string;
  /** ISO 날짜 (정렬·D-day 계산용) — 예: "2026-05-17T20:00:00+09:00" */
  deadline: string;
  deadlineDate: string;
  deadlineTime: string;
  replayUrl?: string;
  transcriptUrl?: string;
  goals: string[];
  deliverables: string[];
}

// ─── Team & Member ────────────────────────────────────────
export type MemberStatus = "submitted" | "writing" | "todo";
export type MemberRole = "leader" | "vice" | "selfish_crew" | "crew";

export interface Member {
  nickname: string;
  role: MemberRole;
  /** 제출 완료한 주차 번호들 (0~6) */
  submittedWeeks?: number[];
  /** 현재 작성 중인 주차 (있을 경우) */
  writingWeek?: number;
}

export interface Team {
  /** 1–6 */
  number: number;
  /** 색상 hex */
  color: string;
  /** 짧은 라벨 (예: "AX PM") */
  shortName: string;
  /** 풀 주제 (예: "AX PM · 프로덕트 구조 설계") */
  subject: string;
  members: Member[];
}

// ─── Learning Material ────────────────────────────────────
export type MaterialContentType = "url" | "text";

export interface LearningMaterial {
  id: string;
  /** "고정" · "0회차" · "1회차" 같은 라벨 */
  weekLabel: string;
  /** -1: 고정 · 0~6: 회차 */
  weekOrder: number;
  /** 시트의 NO 컬럼 — 고정 그룹은 null */
  no: number | null;
  category: string;
  title: string;
  /** URL 또는 텍스트 (프롬프트·명령어 등) */
  content: string;
  contentType: MaterialContentType;
  note?: string;
}

// ─── Discussion (질문 / 노하우 / 사이트) ─────────────────────
export type DiscussionStatus = "unresolved" | "resolved" | "shared";
export type DiscussionType = "question" | "tip" | "site";

export interface Discussion {
  id: string;
  status: DiscussionStatus;
  type: DiscussionType;
  title: string;
  /** 펼쳤을 때 보이는 Slack 원문 전체. 없으면 title 사용 */
  text?: string;
  author: string;
  team: number;
  /** 토픽 태그 (without leading #): ["에이전트"] etc. */
  topicTags: string[];
  /** 0–100, Graphify가 측정한 미션 관련도 */
  relevance: number;
  timeAgo: string;
  /** Slack 원본 메시지/스레드 링크 */
  href?: string;
  reactions: { emoji: string; count: number }[];
  /** Slack 스레드 답변 요약 */
  replies?: { author: string; text: string; timeAgo: string }[];
  /** "🔥 답 필요" 강조 */
  hot?: boolean;
  /** 스킬 페이지로 가는 링크 표시 여부 */
  linkToSkill?: boolean;
}

// ─── Site config ──────────────────────────────────────────
export interface SiteConfig {
  weekNumberSubtitle: string;
  slackWorkspaceUrl: string;
  communityUrl: string;
  homepageUrl: string;
}
