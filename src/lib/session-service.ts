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

// 시작일 지난 PENDING 공유회를 CANCELLED로 일괄 정리 (5명 미달 자동 취소)
async function sweepExpiredPendingSessions() {
  const supabase = createAdminClient();
  await supabase
    .from("sessions")
    .update({ status: "CANCELLED" })
    .eq("status", "PENDING")
    .lt("scheduled_at", new Date().toISOString());
}

// host 중첩 객체를 host_name으로 평탄화
function flattenHost<T extends { host?: { name?: string } | null }>(row: T) {
  return { ...row, host_name: row.host?.name ?? "" };
}

// 월별 캘린더에 표시할 공유회 목록 (신청 진행 중 + 확정 + 완료)
export async function getApprovedSessions(year: number, month: number) {
  const supabase = createAdminClient();

  await sweepExpiredPendingSessions();

  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id, title, description, category, scheduled_at, duration_minutes,
      entry_cost, capacity, status, zoom_link,
      host:members!sessions_host_id_fkey(id, name)
    `)
    .in("status", ["PENDING", "APPROVED", "COMPLETED"])
    .gte("scheduled_at", startDate)
    .lte("scheduled_at", endDate)
    .order("scheduled_at", { ascending: true });

  if (error) return [];

  // 참석자(유료) + 알림 신청자 카운트 매핑
  const ids = (data || []).map((s) => s.id);
  const paid: Record<string, number> = {};
  const notify: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: rows } = await supabase
      .from("session_attendees")
      .select("session_id, status")
      .in("session_id", ids)
      .in("status", ["REGISTERED", "ATTENDED", "NOTIFY_REQUESTED"]);
    for (const r of rows || []) {
      if (r.status === "NOTIFY_REQUESTED") notify[r.session_id] = (notify[r.session_id] || 0) + 1;
      else paid[r.session_id] = (paid[r.session_id] || 0) + 1;
    }
  }

  return (data || []).map((s) => ({
    ...flattenHost(s as unknown as { host?: { name?: string } | null }),
    attendee_count: paid[s.id] || 0,
    notify_count: (paid[s.id] || 0) + (notify[s.id] || 0),
  }));
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
    .in("status", ["REGISTERED", "ATTENDED"]);

  // 참석자 목록
  const { data: attendees } = await supabase
    .from("session_attendees")
    .select("member:members!session_attendees_member_id_fkey(id, name)")
    .eq("session_id", sessionId)
    .in("status", ["REGISTERED", "ATTENDED"]);

  // 알림 신청자 수 (확정 threshold 표시용) — 기존 REGISTERED + NOTIFY_REQUESTED 합산
  // (마이그레이션된 세션에 이미 등록된 참석자가 있을 수 있어 둘 다 포함)
  const { count: notifyCount } = await supabase
    .from("session_attendees")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .in("status", ["REGISTERED", "ATTENDED", "NOTIFY_REQUESTED"]);

  return {
    ...flattenHost(session as unknown as { host?: { name?: string } | null }),
    attendee_count: count || 0,
    notify_count: notifyCount || 0,
    attendees: (attendees || []).map((a) => (a.member as unknown as { id: string; name: string })),
  };
}

const CONFIRM_THRESHOLD = 5;

// 5명 도달 시 자동 확정: NOTIFY_REQUESTED 일괄 REGISTERED 전환 + 셸 차감 + status APPROVED
async function confirmSessionIfReady(sessionId: string) {
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, entry_cost, status")
    .eq("id", sessionId)
    .single();

  if (!session || session.status !== "PENDING") return;

  // 확정 threshold = 기존 REGISTERED + 신규 NOTIFY_REQUESTED 합산
  // (마이그레이션된 세션의 기존 참석자도 카운트에 포함)
  const { count: totalCount } = await supabase
    .from("session_attendees")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .in("status", ["REGISTERED", "ATTENDED", "NOTIFY_REQUESTED"]);

  if ((totalCount || 0) < CONFIRM_THRESHOLD) return;

  // 셸 차감 대상은 NOTIFY_REQUESTED인 사람들만 (REGISTERED는 이미 지급됨)
  const { data: notifyRows } = await supabase
    .from("session_attendees")
    .select("id, member_id")
    .eq("session_id", sessionId)
    .eq("status", "NOTIFY_REQUESTED")
    .order("registered_at", { ascending: true });

  if (!notifyRows) return;

  // 각 신청자 셸 차감 + REGISTERED 전환
  for (const row of notifyRows) {
    const { data: tx } = await supabase
      .from("shell_transactions")
      .insert({
        member_id: row.member_id,
        amount: -session.entry_cost,
        reason: "SESSION_ATTEND",
        reason_detail: `공유회 참여(자동 확정): ${session.title}`,
        related_session_id: sessionId,
      })
      .select()
      .single();

    await supabase.rpc("increment_shell_balance", {
      p_member_id: row.member_id,
      p_amount: -session.entry_cost,
    });

    await supabase
      .from("session_attendees")
      .update({ status: "REGISTERED", transaction_id: tx?.id })
      .eq("id", row.id);

    checkAchievements(row.member_id).catch(() => {});
  }

  // 공유회 확정
  await supabase
    .from("sessions")
    .update({ status: "APPROVED" })
    .eq("id", sessionId);

  checkAndNotifyRankingChanges().catch(() => {});
}

// 알림 신청 (셸 차감 없음)
export async function requestSessionNotify(memberId: string, sessionId: string) {
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, host_id, status")
    .eq("id", sessionId)
    .single();

  if (!session) return { success: false, error: "NOT_FOUND" };
  if (session.status !== "PENDING") return { success: false, error: "NOT_PENDING" };
  if (session.host_id === memberId) return { success: false, error: "OWN_SESSION" };

  const { data: existing } = await supabase
    .from("session_attendees")
    .select("id, status")
    .eq("session_id", sessionId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing) return { success: false, error: "ALREADY_REQUESTED" };

  const { error: insertError } = await supabase
    .from("session_attendees")
    .insert({
      session_id: sessionId,
      member_id: memberId,
      status: "NOTIFY_REQUESTED",
    });

  if (insertError) return { success: false, error: insertError.message };

  await confirmSessionIfReady(sessionId);
  return { success: true };
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
    .in("status", ["REGISTERED", "ATTENDED"])
    .single();

  if (existing) return { success: false, error: "ALREADY_REGISTERED" };

  // 정원 확인
  if (session.capacity) {
    const { count } = await supabase
      .from("session_attendees")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .in("status", ["REGISTERED", "ATTENDED"]);

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
