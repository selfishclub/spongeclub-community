import { createClient } from "@supabase/supabase-js";
import { fallbackAnnouncements } from "@/data/announcements";
import { discussions as fallbackDiscussions } from "@/data/discussions";
import type {
  Announcement,
  AnnouncementLabel,
  Discussion,
  DiscussionStatus,
  DiscussionType,
} from "@/lib/types";

type JsonRecord = Record<string, unknown>;

interface AnnouncementRow {
  id: string;
  label: string | null;
  title: string | null;
  text: string;
  time_ago: string | null;
  updated_at: string;
  href: string | null;
  pinned: boolean | null;
}

interface QuestionRow {
  id: string;
  status: string | null;
  type: string | null;
  title: string;
  text: string | null;
  author: string | null;
  team: number | null;
  topic_tags: unknown;
  relevance: number | null;
  time_ago: string | null;
  href: string | null;
  reactions: unknown;
  replies: unknown;
  hot: boolean | null;
  link_to_skill: boolean | null;
}

const ANNOUNCEMENT_LABELS = new Set<AnnouncementLabel>([
  "urgent",
  "schedule",
  "material",
  "guide",
  "tool",
]);
const DISCUSSION_STATUSES = new Set<DiscussionStatus>([
  "unresolved",
  "resolved",
  "shared",
]);
const DISCUSSION_TYPES = new Set<DiscussionType>(["question", "tip", "site"]);

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function contentSupabaseConfig() {
  return {
    url: env("CONTENT_SUPABASE_URL") ?? env("NEXT_PUBLIC_CONTENT_SUPABASE_URL"),
    key:
      env("CONTENT_SUPABASE_SERVICE_ROLE_KEY") ??
      env("CONTENT_SUPABASE_ANON_KEY") ??
      env("NEXT_PUBLIC_CONTENT_SUPABASE_ANON_KEY"),
  };
}

function createContentClient() {
  const { url, key } = contentSupabaseConfig();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function labelOrDefault(value: string | null): AnnouncementLabel {
  return value && ANNOUNCEMENT_LABELS.has(value as AnnouncementLabel)
    ? (value as AnnouncementLabel)
    : "guide";
}

function statusOrDefault(value: string | null): DiscussionStatus {
  return value && DISCUSSION_STATUSES.has(value as DiscussionStatus)
    ? (value as DiscussionStatus)
    : "unresolved";
}

function typeOrDefault(value: string | null): DiscussionType {
  return value && DISCUSSION_TYPES.has(value as DiscussionType)
    ? (value as DiscussionType)
    : "question";
}

function timeAgoFromIso(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function reactionsArray(value: unknown): Discussion["reactions"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === "object" ? (item as JsonRecord) : null))
    .filter((item): item is JsonRecord => item !== null)
    .map((item) => ({
      emoji: typeof item.emoji === "string" ? item.emoji : "💬",
      count: typeof item.count === "number" ? item.count : 0,
    }));
}

function repliesArray(value: unknown): Discussion["replies"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === "object" ? (item as JsonRecord) : null))
    .filter((item): item is JsonRecord => item !== null)
    .map((item) => ({
      author: typeof item.author === "string" ? item.author : "익명",
      text: typeof item.text === "string" ? item.text : "",
      timeAgo: typeof item.timeAgo === "string" ? item.timeAgo : "",
    }))
    .filter((item) => item.text.trim().length > 0);
}

function toAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    label: labelOrDefault(row.label),
    title: row.title ?? undefined,
    text: row.text,
    timeAgo: row.pinned ? "고정" : row.time_ago || timeAgoFromIso(row.updated_at),
    updatedAt: row.updated_at,
    href: row.href ?? undefined,
    pinned: Boolean(row.pinned),
  };
}

function toDiscussion(row: QuestionRow): Discussion {
  return {
    id: row.id,
    status: statusOrDefault(row.status),
    type: typeOrDefault(row.type),
    title: row.title,
    text: row.text ?? undefined,
    author: row.author || "익명",
    team: row.team ?? 0,
    topicTags: stringArray(row.topic_tags),
    relevance: row.relevance ?? 70,
    timeAgo: row.time_ago || "",
    href: row.href ?? undefined,
    reactions: reactionsArray(row.reactions),
    replies: repliesArray(row.replies),
    hot: Boolean(row.hot),
    linkToSkill: Boolean(row.link_to_skill),
  };
}

function sortedFallbackAnnouncements(): Announcement[] {
  return [...fallbackAnnouncements].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSiteAnnouncements(limit?: number): Promise<Announcement[]> {
  const supabase = createContentClient();
  if (!supabase) return sortedFallbackAnnouncements().slice(0, limit);

  const query = supabase
    .from("yulia_site_announcements")
    .select("id,label,title,text,time_ago,updated_at,href,pinned")
    .eq("is_published", true)
    .order("pinned", { ascending: false })
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  const { data, error } = limit ? await query.limit(limit) : await query;
  if (error) {
    console.warn("Supabase announcements fallback:", error.message);
    return sortedFallbackAnnouncements().slice(0, limit);
  }

  const announcements = ((data ?? []) as AnnouncementRow[]).map(toAnnouncement);
  return announcements.length > 0 ? announcements : sortedFallbackAnnouncements().slice(0, limit);
}

export async function getSiteDiscussions(limit?: number): Promise<Discussion[]> {
  const supabase = createContentClient();
  if (!supabase) return fallbackDiscussions.slice(0, limit);

  const query = supabase
    .from("yulia_site_questions")
    .select("id,status,type,title,text,author,team,topic_tags,relevance,time_ago,href,reactions,replies,hot,link_to_skill")
    .eq("is_published", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  const { data, error } = limit ? await query.limit(limit) : await query;
  if (error) {
    console.warn("Supabase questions fallback:", error.message);
    return fallbackDiscussions.slice(0, limit);
  }

  const discussions = ((data ?? []) as QuestionRow[]).map(toDiscussion);
  return discussions.length > 0 ? discussions : fallbackDiscussions.slice(0, limit);
}
