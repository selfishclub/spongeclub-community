import { createAdminClient } from "./supabase";

// 멤버 조회 (slack_user_id로)
export async function getMemberBySlackId(slackUserId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("slack_user_id", slackUserId)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

// 멤버 조회 (id로)
export async function getMemberById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// 셸 잔고 조회
export async function getShellBalance(memberId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("shell_balance")
    .eq("id", memberId)
    .single();

  if (error) return 0;
  return data.shell_balance;
}

// 오늘 셸 송신 횟수 조회
export async function getTodayGiftCount(memberId: string): Promise<number> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_limits")
    .select("gifts_sent")
    .eq("member_id", memberId)
    .eq("date", today)
    .single();

  if (error || !data) return 0;
  return data.gifts_sent;
}

// 셸 송신 (시스템 발행 — 송신자 차감 없음, 수신자 +1)
export async function sendShellGift(
  senderId: string,
  receiverId: string,
  reason?: string
): Promise<{ success: boolean; error?: string; giftCount?: number }> {
  if (senderId === receiverId) {
    return { success: false, error: "SELF_SEND" };
  }

  const todayCount = await getTodayGiftCount(senderId);
  if (todayCount >= 1) {
    return { success: false, error: "DAILY_LIMIT" };
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { error: txError } = await supabase.from("shell_transactions").insert({
    member_id: receiverId,
    amount: 1,
    reason: "MEMBER_GIFT",
    reason_detail: reason || "셸 선물 받음",
    related_member_id: senderId,
  });

  if (txError) {
    return { success: false, error: "TX_FAILED" };
  }

  await supabase.rpc("increment_shell_balance", {
    p_member_id: receiverId,
    p_amount: 1,
  });

  await supabase.from("daily_limits").upsert(
    {
      member_id: senderId,
      date: today,
      gifts_sent: todayCount + 1,
      sns_verifies: 0,
    },
    { onConflict: "member_id,date" }
  );

  return { success: true, giftCount: todayCount + 1 };
}

// 어드민 수동 셸 조정
export async function adminAdjustShell(
  memberId: string,
  amount: number,
  reason: string,
  adminId: string
) {
  const supabase = createAdminClient();

  const { error: txError } = await supabase.from("shell_transactions").insert({
    member_id: memberId,
    amount,
    reason: "ADMIN_ADJUSTMENT",
    reason_detail: reason,
    created_by: adminId,
  });

  if (txError) return { success: false, error: txError.message };

  await supabase.rpc("increment_shell_balance", {
    p_member_id: memberId,
    p_amount: amount,
  });

  return { success: true };
}
