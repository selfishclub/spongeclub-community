import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reason = searchParams.get("reason");

  const supabase = createAdminClient();

  let query = supabase
    .from("shell_transactions")
    .select(
      `
      id,
      member_id,
      amount,
      reason,
      reason_detail,
      related_member_id,
      created_at,
      member:members!shell_transactions_member_id_fkey(name),
      related_member:members!shell_transactions_related_member_id_fkey(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (reason) {
    query = query.eq("reason", reason);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = (data || []).map((tx) => ({
    id: tx.id,
    member_id: tx.member_id,
    member_name:
      (tx.member as unknown as { name: string } | null)?.name ?? "알 수 없음",
    amount: tx.amount,
    reason: tx.reason,
    reason_detail: tx.reason_detail,
    related_member_name:
      (tx.related_member as unknown as { name: string } | null)?.name ?? null,
    created_at: tx.created_at,
  }));

  return NextResponse.json({ transactions });
}

export async function POST(request: NextRequest) {
  const { id, action } = await request.json();

  if (!id || action !== "cancel") {
    return NextResponse.json({ error: "id, action=cancel 필수" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 원래 트랜잭션 조회
  const { data: tx, error: txError } = await supabase
    .from("shell_transactions")
    .select("id, member_id, amount, reason, reason_detail")
    .eq("id", id)
    .single();

  if (txError || !tx) {
    return NextResponse.json({ error: "트랜잭션을 찾을 수 없어요." }, { status: 404 });
  }

  // 이미 취소된 건인지 확인
  if (tx.reason_detail?.startsWith("[취소됨]")) {
    return NextResponse.json({ error: "이미 취소된 트랜잭션이에요." }, { status: 400 });
  }

  // 반대 금액 트랜잭션 생성
  await supabase.from("shell_transactions").insert({
    member_id: tx.member_id,
    amount: -tx.amount,
    reason: "ADMIN_ADJUSTMENT",
    reason_detail: `[취소] ${tx.reason_detail || tx.reason}`,
  });

  // 잔고 복구
  await supabase.rpc("increment_shell_balance", {
    p_member_id: tx.member_id,
    p_amount: -tx.amount,
  });

  // 원래 트랜잭션에 취소 표시
  await supabase
    .from("shell_transactions")
    .update({ reason_detail: `[취소됨] ${tx.reason_detail || ""}` })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
