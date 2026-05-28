import { NextRequest, NextResponse } from "next/server";
import {
  adminGetWeek,
  adminUpdateWeek,
  type MissionWeekUpdate,
  type MissionTitle,
} from "@/lib/missions/weeks-repo";

type RouteContext = {
  params: Promise<{ weekFolder: string }>;
};

// GET /api/admin/missions/weeks/[weekFolder]
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { weekFolder } = await ctx.params;

  try {
    const week = await adminGetWeek(weekFolder);
    if (!week) {
      return NextResponse.json({ error: "주차를 찾지 못했어요" }, { status: 404 });
    }
    return NextResponse.json({ week });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/admin/missions/weeks/[weekFolder]
//   body: { heroTitle?: string|null, heroSubtitle?: string|null,
//           missions?: [{index, title}, ...], replayUrl?: string|null,
//           transcriptUrl?: string|null, published?: boolean }
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { weekFolder } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요해요" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "잘못된 본문" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const patch: MissionWeekUpdate = {};

  if (input.heroTitle !== undefined) {
    if (input.heroTitle === null) {
      patch.heroTitle = null;
    } else if (typeof input.heroTitle === "string") {
      patch.heroTitle = input.heroTitle.trim() || null;
    }
  }

  if (input.heroSubtitle !== undefined) {
    if (input.heroSubtitle === null) {
      patch.heroSubtitle = null;
    } else if (typeof input.heroSubtitle === "string") {
      patch.heroSubtitle = input.heroSubtitle.trim() || null;
    }
  }

  if (input.missions !== undefined) {
    if (!Array.isArray(input.missions)) {
      return NextResponse.json(
        { error: "missions는 배열이어야 합니다" },
        { status: 400 },
      );
    }
    const cleaned: MissionTitle[] = [];
    for (const item of input.missions) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const idx =
        typeof obj.index === "number" ? obj.index : Number(obj.index);
      const title = typeof obj.title === "string" ? obj.title : "";
      if (!Number.isFinite(idx) || !title.trim()) continue;
      cleaned.push({ index: idx, title: title.trim() });
    }
    patch.missions = cleaned;
  }

  if (input.replayUrl !== undefined) {
    if (input.replayUrl === null) {
      patch.replayUrl = null;
    } else if (typeof input.replayUrl === "string") {
      const trimmed = input.replayUrl.trim();
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return NextResponse.json(
          { error: "replayUrl은 http(s)://로 시작해야 합니다" },
          { status: 400 },
        );
      }
      patch.replayUrl = trimmed || null;
    }
  }

  if (input.transcriptUrl !== undefined) {
    if (input.transcriptUrl === null) {
      patch.transcriptUrl = null;
    } else if (typeof input.transcriptUrl === "string") {
      const trimmed = input.transcriptUrl.trim();
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return NextResponse.json(
          { error: "transcriptUrl은 http(s)://로 시작해야 합니다" },
          { status: 400 },
        );
      }
      patch.transcriptUrl = trimmed || null;
    }
  }

  if (input.published !== undefined && typeof input.published === "boolean") {
    patch.published = input.published;
  }

  try {
    const week = await adminUpdateWeek(weekFolder, patch);
    if (!week) {
      return NextResponse.json({ error: "주차를 찾지 못했어요" }, { status: 404 });
    }
    return NextResponse.json({ week });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
