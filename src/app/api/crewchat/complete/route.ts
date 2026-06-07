import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

// POST /api/crewchat/complete — 크루챗 완료 처리
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { partner_id } = await request.json();

  if (!partner_id) {
    return NextResponse.json({ error: "상대를 선택해주세요." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 내가 신청했거나 상대가 나에게 신청한 requested 건 찾기
  const { data: chat } = await supabase
    .from("coffee_chats")
    .select("id")
    .eq("status", "requested")
    .or(
      `and(member_id.eq.${session.memberId},partner_id.eq.${partner_id}),and(member_id.eq.${partner_id},partner_id.eq.${session.memberId})`
    )
    .limit(1)
    .single();

  if (!chat) {
    return NextResponse.json({ error: "신청된 크루챗을 찾을 수 없어요." }, { status: 404 });
  }

  const { error } = await supabase
    .from("coffee_chats")
    .update({ status: "completed" })
    .eq("id", chat.id);

  if (error) {
    console.error("Coffee chat complete error:", error);
    return NextResponse.json({ error: "완료 처리에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
