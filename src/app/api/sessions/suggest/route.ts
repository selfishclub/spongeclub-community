import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// POST /api/sessions/suggest — 공유회 추천 제출
export async function POST(request: NextRequest) {
  const { suggester_name, target_name, topic } = await request.json();

  if (!suggester_name?.trim() || !target_name?.trim() || !topic?.trim()) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("session_suggestions").insert({
    suggester_name: suggester_name.trim(),
    target_name: target_name.trim(),
    topic: topic.trim(),
    status: "PENDING",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
