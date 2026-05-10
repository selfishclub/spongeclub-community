import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { session_id, member_id } = await request.json();

  if (!session_id || !member_id) {
    return NextResponse.json({ error: "session_id, member_id 필수" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 세션 확인
  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, entry_cost, host_id")
    .eq("id", session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "공유회를 찾을 수 없어요." }, { status: 404 });
  }

  // 중복 신청 확인
  const { data: existing } = await supabase
    .from("session_attendees")
    .select("id")
    .eq("session_id", session_id)
    .eq("member_id", member_id)
    .in("status", ["REGISTERED", "ATTENDED"])
    .single();

  if (existing) {
    return NextResponse.json({ error: "이미 신청된 멤버예요." }, { status: 400 });
  }

  // 셸 차감 트랜잭션
  const { data: tx } = await supabase
    .from("shell_transactions")
    .insert({
      member_id,
      amount: -session.entry_cost,
      reason: "SESSION_ATTEND",
      reason_detail: `[어드민 강제 신청] 공유회 참여: ${session.title}`,
      related_session_id: session_id,
    })
    .select()
    .single();

  // 잔고 업데이트
  await supabase.rpc("increment_shell_balance", {
    p_member_id: member_id,
    p_amount: -session.entry_cost,
  });

  // 참석자 등록
  await supabase.from("session_attendees").insert({
    session_id,
    member_id,
    status: "REGISTERED",
    transaction_id: tx?.id,
  });

  return NextResponse.json({ success: true });
}
