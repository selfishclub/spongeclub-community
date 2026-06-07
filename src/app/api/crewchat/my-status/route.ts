import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

// GET /api/crewchat/my-status — 내 크루챗 상태 (진행 중 + 완료 횟수)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ statuses: {} });
  }

  const supabase = createAdminClient();

  const { data: chats } = await supabase
    .from("coffee_chats")
    .select("member_id, partner_id, status")
    .or(`member_id.eq.${session.memberId},partner_id.eq.${session.memberId}`);

  // key: 상대방 ID, value: { pending: boolean, completedCount: number }
  const map: Record<string, { pending: boolean; completedCount: number }> = {};

  for (const chat of chats || []) {
    const otherId = chat.member_id === session.memberId ? chat.partner_id : chat.member_id;
    if (!map[otherId]) {
      map[otherId] = { pending: false, completedCount: 0 };
    }
    if (chat.status === "requested") {
      map[otherId].pending = true;
    } else if (chat.status === "completed") {
      map[otherId].completedCount += 1;
    }
  }

  return NextResponse.json({ statuses: map });
}
