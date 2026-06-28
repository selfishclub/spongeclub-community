import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 매주 월요일 실행: 지난주(월~일) SNS 인증 3건 이상인 멤버에게 +3셸 보너스
export async function GET(request: NextRequest) {
  // Vercel Cron 인증
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // KST 기준 지난주 월~일 계산
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // KST
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 오늘이 월요일이어야 함 (0=일, 1=월)
  const dayOfWeek = today.getDay();
  if (dayOfWeek !== 1) {
    return NextResponse.json({ message: "Not Monday, skipping", day: dayOfWeek });
  }

  // 지난주 월요일 ~ 일요일 (KST)
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - 7);
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - 1);
  lastSunday.setHours(23, 59, 59, 999);

  const startISO = new Date(lastMonday.getTime() - 9 * 60 * 60 * 1000).toISOString();
  const endISO = new Date(lastSunday.getTime() - 9 * 60 * 60 * 1000).toISOString();

  // 지난주 APPROVED된 SNS_VERIFY 건수를 멤버별로 집계
  const { data: requests } = await supabase
    .from("shell_requests")
    .select("member_id")
    .eq("type", "SNS_VERIFY")
    .eq("status", "APPROVED")
    .gte("reviewed_at", startISO)
    .lte("reviewed_at", endISO);

  if (!requests || requests.length === 0) {
    return NextResponse.json({ message: "No SNS verifications last week", bonusGiven: 0 });
  }

  // 멤버별 카운트
  const countMap = new Map<string, number>();
  for (const r of requests) {
    countMap.set(r.member_id, (countMap.get(r.member_id) || 0) + 1);
  }

  // 3건 이상인 멤버에게 보너스 지급
  const bonusAmount = 3;
  let bonusGiven = 0;
  const weekLabel = `${lastMonday.getMonth() + 1}/${lastMonday.getDate()}~${lastSunday.getMonth() + 1}/${lastSunday.getDate()}`;

  for (const [memberId, count] of countMap.entries()) {
    if (count >= 3) {
      // 이미 이번 주차 보너스를 받았는지 체크 (중복 방지)
      const { data: existing } = await supabase
        .from("shell_transactions")
        .select("id")
        .eq("member_id", memberId)
        .eq("reason", "SNS_WEEKLY_BONUS")
        .like("reason_detail", `%${weekLabel}%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      await supabase.from("shell_transactions").insert({
        member_id: memberId,
        amount: bonusAmount,
        reason: "SNS_WEEKLY_BONUS",
        reason_detail: `SNS 주간 보너스 (${weekLabel}, ${count}건)`,
      });

      await supabase.rpc("increment_shell_balance", {
        p_member_id: memberId,
        p_amount: bonusAmount,
      });

      bonusGiven++;
    }
  }

  return NextResponse.json({
    message: `Weekly SNS bonus processed`,
    week: weekLabel,
    totalMembers: countMap.size,
    qualifiedMembers: bonusGiven,
    bonusAmount,
  });
}
