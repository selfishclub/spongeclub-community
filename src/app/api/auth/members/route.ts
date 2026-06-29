import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 로그인 자동완성용 — 활성 멤버의 이름과 id만 노출
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, name, cohort")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ members: data });
}
