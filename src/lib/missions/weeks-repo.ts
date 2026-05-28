/**
 * 미션 게시판 — `missions_weeks` 테이블 접근 레이어.
 *
 * - 읽기는 anon client (RLS가 published=true 만 노출)
 * - 쓰기는 service-role admin client (어드민 API 라우트에서만)
 */

import {
  createAdminClient,
  createBrowserClient,
} from "@/lib/supabase";

export type MissionTitle = {
  index: number; // 1, 2, 3
  title: string;
};

export type MissionReference = {
  index: number;
  title: string;
  url: string;
  note: string | null;
};

export type MissionWeek = {
  id: string;
  weekFolder: string;
  weekNumber: number;
  label: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  missions: MissionTitle[];
  references: MissionReference[];
  replayUrl: string | null;
  transcriptUrl: string | null;
  published: boolean;
};

export type MissionWeekUpdate = {
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  missions?: MissionTitle[];
  references?: MissionReference[];
  replayUrl?: string | null;
  transcriptUrl?: string | null;
  published?: boolean;
};

type DbRow = {
  id: string;
  week_folder: string;
  week_number: number;
  label: string;
  start_date: string;
  end_date: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  missions: unknown;
  reference_links: unknown;
  replay_url: string | null;
  transcript_url: string | null;
  published: boolean;
};

function normalizeMissions(raw: unknown): MissionTitle[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const obj = m as { index?: unknown; title?: unknown };
      const idx = typeof obj.index === "number" ? obj.index : NaN;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      if (!Number.isFinite(idx) || !title) return null;
      return { index: idx, title };
    })
    .filter((m): m is MissionTitle => m !== null)
    .sort((a, b) => a.index - b.index);
}

function normalizeReferences(raw: unknown): MissionReference[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const obj = r as {
        index?: unknown;
        title?: unknown;
        url?: unknown;
        note?: unknown;
      };
      const idx = typeof obj.index === "number" ? obj.index : NaN;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      const url = typeof obj.url === "string" ? obj.url.trim() : "";
      const noteRaw = typeof obj.note === "string" ? obj.note.trim() : "";
      if (!Number.isFinite(idx) || !title || !url) return null;
      return { index: idx, title, url, note: noteRaw || null };
    })
    .filter((r): r is MissionReference => r !== null)
    .sort((a, b) => a.index - b.index);
}

function rowToWeek(row: DbRow): MissionWeek {
  return {
    id: row.id,
    weekFolder: row.week_folder,
    weekNumber: row.week_number,
    label: row.label,
    startDate: row.start_date,
    endDate: row.end_date,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    missions: normalizeMissions(row.missions),
    references: normalizeReferences(row.reference_links),
    replayUrl: row.replay_url,
    transcriptUrl: row.transcript_url,
    published: row.published,
  };
}

const COLUMNS =
  "id, week_folder, week_number, label, start_date, end_date, hero_title, hero_subtitle, missions, reference_links, replay_url, transcript_url, published";

// ─── READ (anon — public route 용) ──────────────────────────────────────────

/**
 * 단일 주차. RLS로 published=true 만 노출됨.
 */
export async function getWeek(weekFolder: string): Promise<MissionWeek | null> {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from("missions_weeks")
    .select(COLUMNS)
    .eq("week_folder", weekFolder)
    .maybeSingle();

  if (error || !data) return null;
  return rowToWeek(data as DbRow);
}

/**
 * 전체 주차 (week_number 오름차순). RLS로 published=true 만.
 */
export async function listWeeks(): Promise<MissionWeek[]> {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from("missions_weeks")
    .select(COLUMNS)
    .order("week_number", { ascending: true });

  if (error || !data) return [];
  return (data as DbRow[]).map(rowToWeek);
}

// ─── ADMIN READ/WRITE (service-role — admin API 전용) ────────────────────────

/**
 * Admin이 전체 주차 조회 (published 무시).
 */
export async function adminListWeeks(): Promise<MissionWeek[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("missions_weeks")
    .select(COLUMNS)
    .order("week_number", { ascending: true });

  if (error || !data) return [];
  return (data as DbRow[]).map(rowToWeek);
}

export async function adminGetWeek(
  weekFolder: string,
): Promise<MissionWeek | null> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("missions_weeks")
    .select(COLUMNS)
    .eq("week_folder", weekFolder)
    .maybeSingle();

  if (error || !data) return null;
  return rowToWeek(data as DbRow);
}

/**
 * 주차 데이터 일부만 갱신 (admin).
 */
export async function adminUpdateWeek(
  weekFolder: string,
  patch: MissionWeekUpdate,
): Promise<MissionWeek | null> {
  const sb = createAdminClient();

  const update: Record<string, unknown> = {};
  if (patch.heroTitle !== undefined) {
    update.hero_title = patch.heroTitle?.trim() || null;
  }
  if (patch.heroSubtitle !== undefined) {
    update.hero_subtitle = patch.heroSubtitle?.trim() || null;
  }
  if (patch.missions !== undefined) {
    // 정상 형식만 저장
    update.missions = patch.missions
      .filter((m) => m && typeof m.title === "string" && m.title.trim())
      .map((m) => ({ index: m.index, title: m.title.trim() }));
  }
  if (patch.references !== undefined) {
    update.reference_links = patch.references
      .filter(
        (r) =>
          r &&
          typeof r.title === "string" &&
          r.title.trim() &&
          typeof r.url === "string" &&
          r.url.trim(),
      )
      .map((r) => ({
        index: r.index,
        title: r.title.trim(),
        url: r.url.trim(),
        note: r.note?.trim() || null,
      }));
  }
  if (patch.replayUrl !== undefined) {
    update.replay_url = patch.replayUrl?.trim() || null;
  }
  if (patch.transcriptUrl !== undefined) {
    update.transcript_url = patch.transcriptUrl?.trim() || null;
  }
  if (patch.published !== undefined) {
    update.published = patch.published;
  }

  if (Object.keys(update).length === 0) {
    return adminGetWeek(weekFolder);
  }

  const { data, error } = await sb
    .from("missions_weeks")
    .update(update)
    .eq("week_folder", weekFolder)
    .select(COLUMNS)
    .maybeSingle();

  if (error || !data) return null;
  return rowToWeek(data as DbRow);
}
