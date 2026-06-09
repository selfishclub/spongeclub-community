import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createAdminClient();

  // 오늘 한국시간 00:00 UTC 계산
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const todayKST = new Date(kstNow);
  todayKST.setUTCHours(0, 0, 0, 0);
  const todayStartUTC = new Date(todayKST.getTime() - kstOffset);

  // 이번 주 월요일 00:00 KST
  const dayOfWeek = kstNow.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayKST = new Date(kstNow);
  mondayKST.setUTCDate(kstNow.getUTCDate() - diffToMonday);
  mondayKST.setUTCHours(0, 0, 0, 0);
  const weekStartUTC = new Date(mondayKST.getTime() - kstOffset);

  // 오늘 트랜잭션
  const { data: todayTx } = await supabase
    .from("shell_transactions")
    .select("amount, reason, reason_detail, member_id, members!shell_transactions_member_id_fkey(name, profile_image)")
    .gte("created_at", todayStartUTC.toISOString())
    .order("created_at", { ascending: false });

  // 이번 주 트랜잭션 (팀 통계용)
  const { data: weekTx } = await supabase
    .from("shell_transactions")
    .select("amount, reason")
    .gte("created_at", weekStartUTC.toISOString());

  // 이번 주 일요일 끝
  const sundayKST = new Date(mondayKST);
  sundayKST.setUTCDate(mondayKST.getUTCDate() + 7);
  const weekEndUTC = new Date(sundayKST.getTime() - kstOffset);

  // 이번 주 공유회 수 (scheduled_at이 이번 주 안에 있는 것만)
  const { count: weekSessions } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .gte("scheduled_at", weekStartUTC.toISOString())
    .lt("scheduled_at", weekEndUTC.toISOString())
    .in("status", ["COMPLETED", "APPROVED"]);

  // 전체 활성 멤버 수
  const { count: totalMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("is_admin", false);

  const today = todayTx || [];
  const week = weekTx || [];

  // ─── 팀 단위 메시지 (히어로용) ───
  const team: string[] = [];

  const todayShells = today.reduce((sum, r) => sum + Math.abs(r.amount), 0);
  const weekShells = week.reduce((sum, r) => sum + Math.abs(r.amount), 0);
  const todayGifts = today.filter((r) => r.reason === "MEMBER_GIFT").length;
  const todaySns = today.filter((r) => r.reason === "SNS_VERIFY").length;
  const todayAttend = today.filter((r) => r.reason === "SESSION_ATTEND").length;
  const weekGifts = week.filter((r) => r.reason === "MEMBER_GIFT").length;

  if (todayGifts > 0) team.push(`오늘 ${todayGifts}번의 응원이 오갔어요`);
  if (todaySns > 0) team.push(`오늘 SNS 인증 ${todaySns}건 — 이기적 공유 진행 중`);
  if (todayAttend > 0) team.push(`오늘 ${todayAttend}명이 공유회에 참여 신청했어요`);
  if (weekSessions && weekSessions > 0) team.push(`이번 주 ${weekSessions}개의 공유회가 열리고 있어요`);
  if (weekGifts > 5) team.push(`이번 주 ${weekGifts}번의 응원 — 서로 인정하는 스폰지들`);
  if (totalMembers && totalMembers > 0) team.push(`${totalMembers}명의 스폰지가 함께하고 있어요`);

  if (team.length === 0) {
    team.push("오늘의 첫 활동을 시작해보세요!");
  }

  // ─── 개인 활동 메시지 (라이브 티커용) ───
  const individual: { name: string; profile_image: string | null; message: string; created_at?: string }[] = [];

  for (const row of today.slice(0, 15)) {
    const member = row.members as unknown as { name: string; profile_image: string | null } | null;
    if (!member) continue;
    const name = member.name;
    const img = member.profile_image;

    switch (row.reason) {
      case "SNS_VERIFY":
        individual.push({ name, profile_image: img, message: "SNS 인증을 올렸어요" });
        break;
      case "SESSION_ATTEND":
        individual.push({ name, profile_image: img, message: "공유회에 참여 신청했어요" });
        break;
      case "SESSION_HOST":
        individual.push({ name, profile_image: img, message: "공유회를 열었어요" });
        break;
    }
  }

  // 중복 제거 (같은 이름+메시지)
  const seen = new Set<string>();
  const uniqueIndividual = individual.filter((item) => {
    const key = `${item.name}-${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({
    team: [...new Set(team)],
    individual: uniqueIndividual,
  });
}
