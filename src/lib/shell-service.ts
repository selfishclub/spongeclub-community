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

  const { error: rpcError } = await supabase.rpc("increment_shell_balance", {
    p_member_id: receiverId,
    p_amount: 1,
  });

  if (rpcError) {
    console.error("[sendShellGift] increment_shell_balance RPC 실패:", rpcError);
  }

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

// SNS 인증 신청 (대기 상태로 저장)
export async function submitSnsVerification(
  memberId: string,
  url: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // 오늘 SNS 인증 횟수 체크
  const { data: limitRows } = await supabase
    .from("daily_limits")
    .select("sns_verifies,gifts_sent")
    .eq("member_id", memberId)
    .eq("date", today);

  const limit = limitRows && limitRows.length > 0 ? limitRows[0] : null;

  if (limit && limit.sns_verifies >= 1) {
    return { success: false, error: "DAILY_LIMIT" };
  }

  const { error } = await supabase.from("shell_requests").insert({
    member_id: memberId,
    type: "SNS_VERIFY",
    url,
    status: "PENDING",
  });

  if (error) return { success: false, error: "TX_FAILED" };

  // 일일 한도 업데이트
  await supabase.from("daily_limits").upsert(
    {
      member_id: memberId,
      date: today,
      gifts_sent: limit?.gifts_sent ?? 0,
      sns_verifies: (limit?.sns_verifies ?? 0) + 1,
    },
    { onConflict: "member_id,date" }
  );

  return { success: true };
}

// 스킬 공유 신청 (대기 상태로 저장)
export async function submitSkillShare(
  memberId: string,
  url: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("shell_requests").insert({
    member_id: memberId,
    type: "SKILL_SHARE",
    url,
    status: "PENDING",
  });

  if (error) return { success: false, error: "TX_FAILED" };
  return { success: true };
}

// 어드민: 신청 승인 (셸 지급)
export async function approveShellRequest(requestId: string, adminId: string | null) {
  const supabase = createAdminClient();

  const { data: req, error: reqError } = await supabase
    .from("shell_requests")
    .select("*")
    .eq("id", requestId)
    .eq("status", "PENDING")
    .single();

  if (reqError || !req) return { success: false, error: "NOT_FOUND" };

  const amount = req.type === "SNS_VERIFY" ? 2 : 1;
  const reasonDetail = req.type === "SNS_VERIFY" ? "SNS 인증" : "스킬 공유";

  // 트랜잭션 기록
  await supabase.from("shell_transactions").insert({
    member_id: req.member_id,
    amount,
    reason: req.type,
    reason_detail: `${reasonDetail}: ${req.url}`,
    created_by: adminId,
  });

  // 잔고 업데이트
  await supabase.rpc("increment_shell_balance", {
    p_member_id: req.member_id,
    p_amount: amount,
  });

  // 신청 상태 업데이트
  await supabase
    .from("shell_requests")
    .update({ status: "APPROVED", reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  return { success: true };
}

// 어드민: 신청 거부
export async function rejectShellRequest(requestId: string, adminId: string | null) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("shell_requests")
    .update({ status: "REJECTED", reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "PENDING");

  if (error) return { success: false, error: error.message };
  return { success: true };
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
