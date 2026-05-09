import { createAdminClient } from "./supabase";
import { checkAndNotifyRankingChanges } from "./ranking-notify";
import { checkAchievements } from "./achievement-service";

export const CATEGORIES = {
  AI: { label: "AI", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  CAREER: { label: "커리어/성장", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  FINANCE: { label: "재테크", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  LIFESTYLE: { label: "일상/취미", bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

interface CreateSessionData {
  title: string;
  description: string;
  category: CategoryKey;
  scheduled_at: string;
  duration_minutes: number;
  entry_cost: number;
  capacity?: number;
}

// 공유회 개최 신청
export async function createSession(hostId: string, data: CreateSessionData) {
  const supabase = createAdminClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      host_id: hostId,
      title: data.title,
      description: data.description,
      category: data.category,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      entry_cost: data.entry_cost,
      capacity: data.capacity || null,
      status: "PENDING",
      is_free: false,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, session };
}

// 월별 승인된 공유회 목록
export async function getApprovedSessions(year: number, month: number) {
  const supabase = createAdminClient();

  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id, title, description, category, scheduled_at, duration_minutes,
      entry_cost, capacity, status, zoom_link,
      host:members!sessions_host_id_fkey(id, name)
    `)
    .eq("status", "APPROVED")
    .gte("scheduled_at", startDate)
    .lte("scheduled_at", endDate)
    .order("scheduled_at", { ascending: true });

  if (error) return [];
  return data || [];
}

// 공유회 상세
export async function getSessionDetail(sessionId: string) {
  const supabase = createAdminClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select(`
      id, title, description, category, scheduled_at, duration_minutes,
      entry_cost, capacity, status, zoom_link,
      host:members!sessions_host_id_fkey(id, name)
    `)
    .eq("id", sessionId)
    .single();

  if (error) return null;

  // 참석자 수
  const { count } = await supabase
    .from("session_attendees")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("status", "REGISTERED");

  // 참석자 목록
  const { data: attendees } = await supabase
    .from("session_attendees")
    .select("member:members!session_attendees_member_id_fkey(id, name)")
    .eq("session_id", sessionId)
    .eq("status", "REGISTERED");

  return {
    ...session,
    attendee_count: count || 0,
    attendees: (attendees || []).map((a) => (a.member as unknown as { id: string; name: string })),
  };
}

// 참여 신청
export async function registerForSession(memberId: string, sessionId: string) {
  const supabase = createAdminClient();

  // 세션 조회
  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, entry_cost, capacity, status, host_id")
    .eq("id", sessionId)
    .eq("status", "APPROVED")
    .single();

  if (!session) return { success: false, error: "NOT_FOUND" };

  // 본인 공유회 신청 방지
  if (session.host_id === memberId) {
    return { success: false, error: "OWN_SESSION" };
  }

  // 중복 신청 확인
  const { data: existing } = await supabase
    .from("session_attendees")
    .select("id")
    .eq("session_id", sessionId)
    .eq("member_id", memberId)
    .eq("status", "REGISTERED")
    .single();

  if (existing) return { success: false, error: "ALREADY_REGISTERED" };

  // 정원 확인
  if (session.capacity) {
    const { count } = await supabase
      .from("session_attendees")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("status", "REGISTERED");

    if ((count || 0) >= session.capacity) {
      return { success: false, error: "FULL" };
    }
  }

  // 잔고 확인
  const { data: member } = await supabase
    .from("members")
    .select("shell_balance")
    .eq("id", memberId)
    .single();

  if (!member || member.shell_balance < session.entry_cost) {
    return { success: false, error: "INSUFFICIENT_BALANCE" };
  }

  // 셸 차감 트랜잭션
  const { data: tx } = await supabase
    .from("shell_transactions")
    .insert({
      member_id: memberId,
      amount: -session.entry_cost,
      reason: "SESSION_ATTEND",
      reason_detail: `공유회 참여: ${session.title}`,
      related_session_id: sessionId,
    })
    .select()
    .single();

  // 잔고 업데이트
  await supabase.rpc("increment_shell_balance", {
    p_member_id: memberId,
    p_amount: -session.entry_cost,
  });

  // 참석자 등록
  await supabase.from("session_attendees").insert({
    session_id: sessionId,
    member_id: memberId,
    status: "REGISTERED",
    transaction_id: tx?.id,
  });

  checkAndNotifyRankingChanges().catch(() => {});
  checkAchievements(memberId).catch(() => {});
  return { success: true };
}

// 어드민: 승인
export async function approveSession(sessionId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sessions")
    .update({ status: "APPROVED" })
    .eq("id", sessionId)
    .eq("status", "PENDING");

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 어드민: 거부
export async function rejectSession(sessionId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sessions")
    .update({ status: "REJECTED" })
    .eq("id", sessionId)
    .eq("status", "PENDING");

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 어드민: 완료 + 개최자 보상
export async function completeSession(sessionId: string, adminId: string) {
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, host_id, entry_cost")
    .eq("id", sessionId)
    .eq("status", "APPROVED")
    .single();

  if (!session) return { success: false, error: "NOT_FOUND" };

  // 상태 업데이트
  await supabase
    .from("sessions")
    .update({ status: "COMPLETED" })
    .eq("id", sessionId);

  // 개최자에게 보상 (entry_cost 금액)
  await supabase.from("shell_transactions").insert({
    member_id: session.host_id,
    amount: session.entry_cost,
    reason: "SESSION_HOST",
    reason_detail: `공유회 개최 보상`,
    related_session_id: sessionId,
    created_by: adminId,
  });

  await supabase.rpc("increment_shell_balance", {
    p_member_id: session.host_id,
    p_amount: session.entry_cost,
  });

  checkAndNotifyRankingChanges().catch(() => {});
  checkAchievements(session.host_id).catch(() => {});
  return { success: true };
}
