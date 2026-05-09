import { NextRequest, NextResponse } from "next/server";
import { getMemberAchievements } from "@/lib/achievement-service";

// GET /api/achievements?member_id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("member_id");

  if (!memberId) {
    return NextResponse.json({ error: "member_id 필요" }, { status: 400 });
  }

  const badges = await getMemberAchievements(memberId);
  return NextResponse.json({ badges });
}
