import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all"; // all, earned, spent

  const supabase = createAdminClient();

  let query = supabase
    .from("shell_transactions")
    .select("id, amount, reason, reason_detail, created_at")
    .eq("member_id", session.memberId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (type === "earned") {
    query = query.gt("amount", 0);
  } else if (type === "spent") {
    query = query.lt("amount", 0);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transactions: data || [] });
}
