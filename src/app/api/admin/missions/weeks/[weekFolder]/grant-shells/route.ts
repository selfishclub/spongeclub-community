/**
 * 미션 제출자 일괄 셸 지급 — admin 전용.
 *
 *   GET  /api/admin/missions/weeks/[weekFolder]/grant-shells
 *        → 지급 미리보기 (제출자 ↔ members 매칭 결과)
 *   POST /api/admin/missions/weeks/[weekFolder]/grant-shells
 *        → 일괄 지급 실행 (멱등 — 이미 지급된 멤버는 건너뜀)
 */
import { NextRequest, NextResponse } from "next/server";
import { buildGrantPreview, executeGrant } from "@/lib/missions/shell-grant";

type RouteContext = {
  params: Promise<{ weekFolder: string }>;
};

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { weekFolder } = await ctx.params;
  try {
    const preview = await buildGrantPreview(weekFolder);
    return NextResponse.json({ preview });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(_req: NextRequest, ctx: RouteContext) {
  const { weekFolder } = await ctx.params;
  try {
    const result = await executeGrant(weekFolder);
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
