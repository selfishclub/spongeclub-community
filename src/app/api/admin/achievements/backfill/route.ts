import { NextResponse } from "next/server";
import { backfillAllAchievements } from "@/lib/achievement-service";

// POST /api/admin/achievements/backfill
// 전체 멤버 배지 일괄 체크 + 발급 (Slack 알림 스킵)
export async function POST() {
  const result = await backfillAllAchievements();
  return NextResponse.json(result);
}
