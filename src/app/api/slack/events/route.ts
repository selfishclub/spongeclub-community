import { NextRequest, NextResponse } from "next/server";
import { getSlackClient } from "@/lib/slack";
import {
  getMemberBySlackId,
  sendShellGift,
  getShellBalance,
} from "@/lib/shell-service";

// 셸 송신 패턴: @멤버 +1🐚 (메시지는 선택)
const SHELL_GIFT_PATTERN = /<@(\w+)>\s*\+1\s*🐚/;
// 잔고 확인 패턴: !셸 또는 !잔고
const BALANCE_CHECK_PATTERN = /^!(셸|잔고|shell|balance)$/i;

export async function POST(request: NextRequest) {
  const body = await request.text();

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Slack URL 검증은 서명 검증 전에 처리 (초기 설정용)
  if (parsed.type === "url_verification") {
    return NextResponse.json({ challenge: parsed.challenge });
  }

  // 서명 검증 (TODO: 디버깅 완료 후 재활성화)
  // const timestamp = request.headers.get("x-slack-request-timestamp") || "";
  // const signature = request.headers.get("x-slack-signature") || "";
  // const signingSecret = process.env.SLACK_SIGNING_SECRET!;
  // if (!verifySlackSignature(signingSecret, signature, timestamp, body)) {
  //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  // }

  const payload = parsed;

  // 이벤트 처리
  if (payload.type === "event_callback") {
    const event = payload.event;

    // 봇 메시지 무시
    if (event.bot_id || event.subtype === "bot_message") {
      return NextResponse.json({ ok: true });
    }

    if (event.type === "message" && event.text) {
      // 셸 송신 처리
      const giftMatch = event.text.match(SHELL_GIFT_PATTERN);
      if (giftMatch) {
        await handleShellGift(event.user, giftMatch[1], event.channel);
        return NextResponse.json({ ok: true });
      }

      // 잔고 확인 처리
      const balanceMatch = event.text.match(BALANCE_CHECK_PATTERN);
      if (balanceMatch) {
        await handleBalanceCheck(event.user, event.channel);
        return NextResponse.json({ ok: true });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleShellGift(
  senderSlackId: string,
  receiverSlackId: string,
  channel: string
) {
  const sender = await getMemberBySlackId(senderSlackId);
  if (!sender) {
    await getSlackClient().chat.postMessage({
      channel,
      text: "스폰지클럽에 등록되지 않은 멤버예요. 어드민에게 문의해주세요!",
    });
    return;
  }

  const receiver = await getMemberBySlackId(receiverSlackId);
  if (!receiver) {
    await getSlackClient().chat.postMessage({
      channel,
      text: "받는 분이 스폰지클럽에 등록되지 않은 멤버예요.",
    });
    return;
  }

  const result = await sendShellGift(sender.id, receiver.id);

  if (!result.success) {
    const errorMessages: Record<string, string> = {
      SELF_SEND: "자기 자신에게는 셸을 보낼 수 없어요! 🐚",
      DAILY_LIMIT: "오늘의 셸은 이미 보냈어요! 내일 다시 보내주세요 🐚",
      TX_FAILED: "셸 송신 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
    await getSlackClient().chat.postMessage({
      channel,
      text: errorMessages[result.error!] || "알 수 없는 오류가 발생했어요.",
    });
    return;
  }

  await getSlackClient().chat.postMessage({
    channel,
    text: `🐚 <@${senderSlackId}>님이 <@${receiverSlackId}>님에게 오늘의 셸을 보냈어요!`,
  });
}

async function handleBalanceCheck(slackUserId: string, channel: string) {
  const member = await getMemberBySlackId(slackUserId);
  if (!member) {
    await getSlackClient().chat.postMessage({
      channel,
      text: "스폰지클럽에 등록되지 않은 멤버예요. 어드민에게 문의해주세요!",
    });
    return;
  }

  const balance = await getShellBalance(member.id);
  await getSlackClient().chat.postMessage({
    channel,
    text: `🐚 ${member.name}님의 셸 잔고: *${balance}개*`,
  });
}
