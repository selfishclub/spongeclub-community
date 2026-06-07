import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { getSlackClient } from "@/lib/slack";

const COFFEE_CHAT_CHANNEL = process.env.SLACK_COFFEE_CHAT_CHANNEL || "";

// POST /api/crewchat/request — 크루챗 신청 + DB 저장 + 슬랙 알림
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { partner_id, message } = await request.json();

  if (!partner_id) {
    return NextResponse.json({ error: "상대를 선택해주세요." }, { status: 400 });
  }

  if (partner_id === session.memberId) {
    return NextResponse.json({ error: "자기 자신에게는 신청할 수 없어요!" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 진행 중인 신청이 있는지 확인 (완료된 건은 다시 신청 가능)
  const { data: existing } = await supabase
    .from("coffee_chats")
    .select("id")
    .eq("status", "requested")
    .or(
      `and(member_id.eq.${session.memberId},partner_id.eq.${partner_id}),and(member_id.eq.${partner_id},partner_id.eq.${session.memberId})`
    )
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ error: "이미 진행 중인 크루챗 신청이 있어요." }, { status: 400 });
  }

  // 신청자 + 상대방 이름 & 슬랙 ID 조회
  const { data: me } = await supabase
    .from("members")
    .select("name, slack_user_id")
    .eq("id", session.memberId)
    .single();

  const { data: partner } = await supabase
    .from("members")
    .select("name, slack_user_id")
    .eq("id", partner_id)
    .single();

  if (!me || !partner) {
    return NextResponse.json({ error: "멤버 정보를 찾을 수 없어요." }, { status: 404 });
  }

  // DB에 신청 기록 저장
  const { error: insertError } = await supabase
    .from("coffee_chats")
    .insert({
      member_id: session.memberId,
      partner_id,
      memo: (message || "").trim(),
      status: "requested",
    });

  if (insertError) {
    console.error("Coffee chat request save error:", insertError);
    return NextResponse.json({ error: "저장에 실패했어요." }, { status: 500 });
  }

  // 슬랙 알림 전송
  if (COFFEE_CHAT_CHANNEL) {
    try {
      const slack = getSlackClient();
      const meName = me.slack_user_id ? `<@${me.slack_user_id}>` : `*${me.name}*`;
      const partnerName = partner.slack_user_id ? `<@${partner.slack_user_id}>` : `*${partner.name}*`;
      const msgText = (message || "").trim();
      const bodyText = msgText ? `\n> ${msgText}` : "";
      await slack.chat.postMessage({
        channel: COFFEE_CHAT_CHANNEL,
        text: `☕ ${meName} 님이 ${partnerName} 님에게 크루챗을 신청했어요!${bodyText}`,
        unfurl_links: false,
      });
    } catch (slackError) {
      console.error("Slack notification error:", slackError);
      // 슬랙 실패해도 신청 기록은 저장됨
    }
  }

  return NextResponse.json({ success: true });
}
