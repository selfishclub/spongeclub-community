import { NextRequest, NextResponse } from "next/server";
import { getSlackClient } from "@/lib/slack";
import {
  getMemberBySlackId,
  sendShellGift,
  getShellBalance,
  submitSnsVerification,
  submitSkillShare,
} from "@/lib/shell-service";

// 셸 송신 패턴: !보내기 @멤버 이유 (이유는 선택)
const SHELL_GIFT_PATTERN = /^!보내기\s+<@(\w+)>\s*(.*)?/;
// 잔고 확인 패턴: !잔고
const BALANCE_CHECK_PATTERN = /^!(셸|잔고|shell|balance)$/i;
// SNS 인증 패턴: !sns인증하기 URL (Slack은 URL을 <https://...|label> 형태로 변환)
const SNS_VERIFY_PATTERN = /^!sns인증하기\s+<?([^>|]+)/;
// 스킬 공유 패턴: !스킬공유하기 URL
const SKILL_SHARE_PATTERN = /^!스킬공유하기\s+<?([^>|]+)/;

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
        const reason = (giftMatch[2] || "").trim();
        await handleShellGift(event.user, giftMatch[1], event.channel, reason);
        return NextResponse.json({ ok: true });
      }

      // SNS 인증 처리
      const snsMatch = event.text.match(SNS_VERIFY_PATTERN);
      if (snsMatch) {
        await handleSnsVerify(event.user, snsMatch[1], event.channel);
        return NextResponse.json({ ok: true });
      }

      // 스킬 공유 처리
      const skillMatch = event.text.match(SKILL_SHARE_PATTERN);
      if (skillMatch) {
        await handleSkillShare(event.user, skillMatch[1], event.channel);
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
  channel: string,
  reason: string
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

  const result = await sendShellGift(sender.id, receiver.id, reason);

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

  let msg = `🐚 <@${senderSlackId}>님이 <@${receiverSlackId}>님에게 오늘의 셸을 보냈어요!`;
  if (reason) {
    msg += `\n💬 "${reason}"`;
  }

  await getSlackClient().chat.postMessage({
    channel,
    text: msg,
  });
}

async function handleSnsVerify(slackUserId: string, url: string, channel: string) {
  const member = await getMemberBySlackId(slackUserId);
  if (!member) {
    await getSlackClient().chat.postMessage({
      channel,
      text: "스폰지클럽에 등록되지 않은 멤버예요. 어드민에게 문의해주세요!",
    });
    return;
  }

  const result = await submitSnsVerification(member.id, url);

  if (!result.success) {
    const msgs: Record<string, string> = {
      DAILY_LIMIT: "오늘은 이미 SNS 인증을 신청했어요! 내일 다시 해주세요 🐚",
      TX_FAILED: "신청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
    await getSlackClient().chat.postMessage({
      channel,
      text: msgs[result.error!] || "알 수 없는 오류가 발생했어요.",
    });
    return;
  }

  await getSlackClient().chat.postMessage({
    channel,
    text: `📸 <@${slackUserId}>님의 SNS 인증 신청이 접수되었어요!\n🔗 ${url}\n어드민 승인 후 +2🐚이 지급됩니다.`,
  });
}

async function handleSkillShare(slackUserId: string, url: string, channel: string) {
  const member = await getMemberBySlackId(slackUserId);
  if (!member) {
    await getSlackClient().chat.postMessage({
      channel,
      text: "스폰지클럽에 등록되지 않은 멤버예요. 어드민에게 문의해주세요!",
    });
    return;
  }

  const result = await submitSkillShare(member.id, url);

  if (!result.success) {
    await getSlackClient().chat.postMessage({
      channel,
      text: "신청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    });
    return;
  }

  await getSlackClient().chat.postMessage({
    channel,
    text: `📚 <@${slackUserId}>님의 스킬 공유 신청이 접수되었어요!\n🔗 ${url}\n어드민 승인 후 +1🐚이 지급됩니다.`,
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
