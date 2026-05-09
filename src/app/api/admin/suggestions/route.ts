import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/suggestions — 추천 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  const supabase = createAdminClient();

  let query = supabase
    .from("session_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data });
}

// PATCH /api/admin/suggestions — 상태 업데이트
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: "id, status 필수" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("session_suggestions")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
