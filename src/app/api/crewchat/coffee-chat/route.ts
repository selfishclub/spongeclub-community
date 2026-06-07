import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

// GET /api/crewchat/coffee-chat — 내 크루챗 기록 조회
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ chats: [] });
  }

  const supabase = createAdminClient();

  const { data: chats } = await supabase
    .from("coffee_chats")
    .select("id, partner_id, memo, created_at")
    .eq("member_id", session.memberId)
    .order("created_at", { ascending: false });

  if (!chats || chats.length === 0) {
    return NextResponse.json({ chats: [] });
  }

  // 파트너 이름 조회
  const partnerIds = [...new Set(chats.map((c) => c.partner_id))];
  const { data: partners } = await supabase
    .from("members")
    .select("id, name, profile_image")
    .in("id", partnerIds);

  const partnerMap = new Map(
    (partners || []).map((p) => [p.id, p])
  );

  const result = chats.map((c) => ({
    id: c.id,
    partner_name: partnerMap.get(c.partner_id)?.name || "알 수 없음",
    partner_image: partnerMap.get(c.partner_id)?.profile_image || null,
    memo: c.memo,
    created_at: c.created_at,
  }));

  return NextResponse.json({ chats: result });
}

// POST /api/crewchat/coffee-chat — 크루챗 기록 등록 + 슬랙 알림
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { partner_id, memo } = await request.json();

  if (!partner_id) {
    return NextResponse.json({ error: "상대를 선택해주세요." }, { status: 400 });
  }

  if (partner_id === session.memberId) {
    return NextResponse.json({ error: "자기 자신과는 크루챗을 할 수 없어요!" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 멤버 이름 조회
  const { data: me } = await supabase
    .from("members")
    .select("name")
    .eq("id", session.memberId)
    .single();

  const { data: partner } = await supabase
    .from("members")
    .select("name")
    .eq("id", partner_id)
    .single();

  if (!me || !partner) {
    return NextResponse.json({ error: "멤버 정보를 찾을 수 없어요." }, { status: 404 });
  }

  // 크루챗 기록 저장
  const { error } = await supabase
    .from("coffee_chats")
    .insert({
      member_id: session.memberId,
      partner_id,
      memo: (memo || "").trim(),
    });

  if (error) {
    console.error("Coffee chat save error:", error);
    return NextResponse.json({ error: "저장에 실패했어요." }, { status: 500 });
  }


  return NextResponse.json({ success: true });
}
