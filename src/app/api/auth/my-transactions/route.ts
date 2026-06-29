import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "로그인이 필요해요." },
      { status: 401, headers: NO_STORE }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  const supabase = createAdminClient();

  if (type === "gift") {
    // 받은 선물 (내가 member_id이고 MEMBER_GIFT)
    const { data: received } = await supabase
      .from("shell_transactions")
      .select("id, amount, reason, reason_detail, created_at, related_member_id, related_member:members!shell_transactions_related_member_id_fkey(name)")
      .eq("member_id", session.memberId)
      .eq("reason", "MEMBER_GIFT")
      .order("created_at", { ascending: false })
      .limit(50);

    // 보낸 선물 (내가 related_member_id이고 MEMBER_GIFT)
    const { data: sent } = await supabase
      .from("shell_transactions")
      .select("id, amount, reason, reason_detail, created_at, member_id, member:members!shell_transactions_member_id_fkey(name)")
      .eq("related_member_id", session.memberId)
      .eq("reason", "MEMBER_GIFT")
      .order("created_at", { ascending: false })
      .limit(50);

    const gifts = [
      ...(received || []).map((t) => ({
        id: t.id,
        amount: t.amount,
        reason: "GIFT_RECEIVED",
        reason_detail: `${(t.related_member as unknown as { name: string } | null)?.name ?? ""}에게 받음${t.reason_detail && t.reason_detail !== "셸 선물 받음" ? ` — ${t.reason_detail}` : ""}`,
        created_at: t.created_at,
      })),
      ...(sent || []).map((t) => ({
        id: t.id + "-sent",
        amount: 0,
        reason: "GIFT_SENT",
        reason_detail: `${(t.member as unknown as { name: string } | null)?.name ?? ""}에게 보냄${t.reason_detail && t.reason_detail !== "셸 선물 받음" ? ` — ${t.reason_detail}` : ""}`,
        created_at: t.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ transactions: gifts }, { headers: NO_STORE });
  }

  let query = supabase
    .from("shell_transactions")
    .select("id, amount, reason, reason_detail, created_at")
    .eq("member_id", session.memberId)
    .order("created_at", { ascending: false });

  if (type === "earned") {
    query = query.gt("amount", 0);
  } else if (type === "spent") {
    query = query.lt("amount", 0);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: NO_STORE }
    );
  }

  return NextResponse.json(
    { transactions: data || [] },
    { headers: NO_STORE }
  );
}
