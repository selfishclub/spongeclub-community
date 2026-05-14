/**
 * 미션 게시판 — Slack 메시지 캐시 (Supabase) 접근 레이어.
 *
 * - 읽기는 anon client 사용 (RLS가 approved=true·hidden=false만 노출)
 * - 쓰기는 service-role admin client 사용 (Slack webhook 라우트에서만)
 *
 * 이 파일은 데이터 모양 + 쿼리 형태만 정의한다.
 * 실제 Slack webhook 수신·적재 로직은 별도 PR에서 추가.
 */

import {
  createAdminClient,
  createBrowserClient,
} from "@/lib/supabase";

export type MessageCategory = "notice" | "question" | "share";
export type MessageUrgency = "urgent" | "schedule" | "resource";

export type MissionMessage = {
  id: string;
  slackTs: string;
  slackChannel: string;
  channelName: string | null;
  authorName: string | null;
  authorAvatar: string | null;
  text: string;
  permalink: string | null;
  category: MessageCategory;
  urgency: MessageUrgency | null;
  weekFolder: string | null;
  relevanceScore: number | null;
  reactions: Record<string, number>;
  replyCount: number;
  postedAt: string; // ISO
};

type DbRow = {
  id: string;
  slack_ts: string;
  slack_channel: string;
  channel_name: string | null;
  author_name: string | null;
  author_avatar: string | null;
  text: string;
  permalink: string | null;
  category: string;
  urgency: string | null;
  week_folder: string | null;
  relevance_score: number | null;
  reactions: Record<string, number> | null;
  reply_count: number;
  posted_at: string;
};

function rowToMessage(row: DbRow): MissionMessage {
  return {
    id: row.id,
    slackTs: row.slack_ts,
    slackChannel: row.slack_channel,
    channelName: row.channel_name,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    text: row.text,
    permalink: row.permalink,
    category: row.category as MessageCategory,
    urgency: row.urgency as MessageUrgency | null,
    weekFolder: row.week_folder,
    relevanceScore: row.relevance_score,
    reactions: row.reactions ?? {},
    replyCount: row.reply_count,
    postedAt: row.posted_at,
  };
}

// ─── READ (anon, RLS 적용) ──────────────────────────────────────────────────

/**
 * 2번 섹션용 — 최근 공지 N개.
 * approved=true, hidden=false 만 자동 필터링 (RLS).
 */
export async function getRecentNotices(limit = 5): Promise<MissionMessage[]> {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from("missions_messages")
    .select(
      "id, slack_ts, slack_channel, channel_name, author_name, author_avatar, text, permalink, category, urgency, week_folder, relevance_score, reactions, reply_count, posted_at",
    )
    .eq("category", "notice")
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(rowToMessage);
}

/**
 * 6번 섹션용 — 특정 주차의 질문·공유 메시지.
 * weekFolder 지정 시 해당 주차만, 미지정 시 전체.
 */
export async function getWeekQuestions(
  weekFolder: string | null,
  limit = 20,
): Promise<MissionMessage[]> {
  const sb = createBrowserClient();
  let q = sb
    .from("missions_messages")
    .select(
      "id, slack_ts, slack_channel, channel_name, author_name, author_avatar, text, permalink, category, urgency, week_folder, relevance_score, reactions, reply_count, posted_at",
    )
    .in("category", ["question", "share"])
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (weekFolder) q = q.eq("week_folder", weekFolder);

  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(rowToMessage);
}

// ─── WRITE (service-role, RLS 우회 — webhook 전용) ───────────────────────────

export type UpsertMessageInput = {
  slackTs: string;
  slackChannel: string;
  slackThreadTs?: string | null;
  channelName?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  text: string;
  permalink?: string | null;
  category: MessageCategory;
  urgency?: MessageUrgency | null;
  weekFolder?: string | null;
  reactions?: Record<string, number>;
  replyCount?: number;
  postedAt: string; // ISO
};

/**
 * Slack webhook 라우트에서 호출. 이미 있으면 reactions·replyCount 갱신.
 * v1 초반엔 approved=false 기본 → 운영진 승인 후 노출.
 */
export async function upsertMessage(input: UpsertMessageInput): Promise<void> {
  const sb = createAdminClient();
  const { error } = await sb
    .from("missions_messages")
    .upsert(
      {
        slack_ts: input.slackTs,
        slack_channel: input.slackChannel,
        slack_thread_ts: input.slackThreadTs ?? null,
        channel_name: input.channelName ?? null,
        author_id: input.authorId ?? null,
        author_name: input.authorName ?? null,
        author_avatar: input.authorAvatar ?? null,
        text: input.text,
        permalink: input.permalink ?? null,
        category: input.category,
        urgency: input.urgency ?? null,
        week_folder: input.weekFolder ?? null,
        reactions: input.reactions ?? {},
        reply_count: input.replyCount ?? 0,
        posted_at: input.postedAt,
      },
      { onConflict: "slack_ts,slack_channel" },
    );

  if (error) {
    // webhook 호출자가 5xx로 응답하도록 throw
    throw new Error(`upsertMessage failed: ${error.message}`);
  }
}

/**
 * 메시지 삭제 (Slack에서 삭제 이벤트 받았을 때).
 */
export async function deleteMessage(
  slackTs: string,
  slackChannel: string,
): Promise<void> {
  const sb = createAdminClient();
  await sb
    .from("missions_messages")
    .delete()
    .eq("slack_ts", slackTs)
    .eq("slack_channel", slackChannel);
}
