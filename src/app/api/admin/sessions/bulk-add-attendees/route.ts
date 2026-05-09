import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// POST /api/admin/sessions/bulk-add-attendees
// 셸 차감 없이 참석자 일괄 등록 (이미 수동으로 셸 차감된 경우)
export async function POST(request: NextRequest) {
  const { session_id, member_names } = await request.json();

  if (!session_id || !member_names || !Array.isArray(member_names)) {
    return NextResponse.json(
      { error: "session_id, member_names(배열) 필수" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 세션 확인
  const { data: session } = await supabase
    .from("sessions")
    .select("id, title")
    .eq("id", session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "공유회를 찾을 수 없어요." }, { status: 404 });
  }

  const results: { name: string; status: string; error?: string }[] = [];

  for (const name of member_names) {
    // 멤버 이름으로 조회
    const { data: members } = await supabase
      .from("members")
      .select("id, name")
      .ilike("name", `%${name.trim()}%`)
      .eq("is_active", true);

    if (!members || members.length === 0) {
      results.push({ name, status: "failed", error: "멤버를 찾을 수 없음" });
      continue;
    }

    if (members.length > 1) {
      results.push({
        name,
        status: "failed",
        error: `여러 멤버 매칭: ${members.map((m) => m.name).join(", ")}`,
      });
      continue;
    }

    const member = members[0];

    // 중복 신청 확인
    const { data: existing } = await supabase
      .from("session_attendees")
      .select("id")
      .eq("session_id", session_id)
      .eq("member_id", member.id)
      .eq("status", "REGISTERED")
      .single();

    if (existing) {
      results.push({ name: member.name, status: "skipped", error: "이미 등록됨" });
      continue;
    }

    // 참석자 등록 (셸 차감 없음)
    const { error } = await supabase.from("session_attendees").insert({
      session_id,
      member_id: member.id,
      status: "REGISTERED",
    });

    if (error) {
      results.push({ name: member.name, status: "failed", error: error.message });
    } else {
      results.push({ name: member.name, status: "success" });
    }
  }

  return NextResponse.json({
    session_title: session.title,
    results,
    summary: {
      success: results.filter((r) => r.status === "success").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      failed: results.filter((r) => r.status === "failed").length,
    },
  });
}
