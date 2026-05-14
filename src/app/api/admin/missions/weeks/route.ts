import { NextResponse } from "next/server";
import { adminListWeeks } from "@/lib/missions/weeks-repo";

// GET /api/admin/missions/weeks — 전체 주차 목록 (published 무시)
export async function GET() {
  try {
    const weeks = await adminListWeeks();
    return NextResponse.json({ weeks });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
