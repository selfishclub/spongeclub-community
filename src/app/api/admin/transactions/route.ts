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
