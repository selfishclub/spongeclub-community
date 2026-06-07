import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/crewchat — 전체 크루챗 로그
export async function GET() {
  const supabase = createAdminClient();

  const { data: chats } = await supabase
    .from("coffee_chats")
    .select("id, member_id, partner_id, status, memo, created_at")
    .order("created_at", { ascending: false });

  if (!chats || chats.length === 0) {
    return NextResponse.json({ chats: [] });
  }

  // 관련 멤버 이름 조회
  const memberIds = [...new Set(chats.flatMap((c) => [c.member_id, c.partner_id]))];
  const { data: members } = await supabase
    .from("members")
    .select("id, name, profile_image")
    .in("id", memberIds);

  const memberMap = new Map(
    (members || []).map((m) => [m.id, m])
  );

  const result = chats.map((c) => ({
    id: c.id,
    requester_name: memberMap.get(c.member_id)?.name || "알 수 없음",
    requester_image: memberMap.get(c.member_id)?.profile_image || null,
    partner_name: memberMap.get(c.partner_id)?.name || "알 수 없음",
    partner_image: memberMap.get(c.partner_id)?.profile_image || null,
    status: c.status,
    memo: c.memo,
    created_at: c.created_at,
  }));

  return NextResponse.json({ chats: result });
}
