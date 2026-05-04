import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendShellGift } from "@/lib/shell-service";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { receiver_id, reason } = await request.json();

  if (!receiver_id) {
    return NextResponse.json({ error: "받는 사람을 선택해주세요." }, { status: 400 });
  }

  const result = await sendShellGift(session.memberId, receiver_id, reason || "");

  if (!result.success) {
    const msgs: Record<string, string> = {
      SELF_SEND: "자기 자신에게는 셸을 보낼 수 없어요!",
      DAILY_LIMIT: "오늘의 셸은 이미 보냈어요! 내일 다시 보내주세요.",
      TX_FAILED: "셸 송신 중 오류가 발생했어요.",
    };
    return NextResponse.json(
      { error: msgs[result.error!] || "알 수 없는 오류" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
