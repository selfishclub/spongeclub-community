import { NextRequest, NextResponse } from "next/server";
import {
  getMemberBySlackId,
  getShellBalance,
  sendShellGift,
  submitSnsVerification,
  submitSkillShare,
} from "@/lib/shell-service";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const command = formData.get("command") as string;
  const text = (formData.get("text") as string || "").trim();
  const userId = formData.get("user_id") as string;

  // 멤버 확인
  const member = await getMemberBySlackId(userId);
  if (!member) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "스폰지클럽에 등록되지 않은 멤버예요. 어드민에게 문의해주세요!",
    });
  }

  switch (command) {
    case "/잔고": {
      const balance = await getShellBalance(member.id);
      return NextResponse.json({
        response_type: "ephemeral",
        text: `🐚 ${member.name}님의 셸 잔고: *${balance}개*`,
      });
    }

    case "/보내기": {
      // 형식: @멤버 이유
      const mentionMatch = text.match(/^<@(\w+)\|[^>]*>\s*(.*)?/);
      if (!mentionMatch) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "사용법: `/보내기 @멤버이름 이유`\n예: `/보내기 @비비안 오늘 도움 고마워!`",
        });
      }

      const receiverSlackId = mentionMatch[1];
      const reason = (mentionMatch[2] || "").trim();

      const receiver = await getMemberBySlackId(receiverSlackId);
      if (!receiver) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "받는 분이 스폰지클럽에 등록되지 않은 멤버예요.",
        });
      }

      const result = await sendShellGift(member.id, receiver.id, reason);

      if (!result.success) {
        const msgs: Record<string, string> = {
          SELF_SEND: "자기 자신에게는 셸을 보낼 수 없어요! 🐚",
          DAILY_LIMIT: "오늘의 셸은 이미 보냈어요! 내일 다시 보내주세요 🐚",
          TX_FAILED: "셸 송신 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        };
        return NextResponse.json({
          response_type: "ephemeral",
          text: msgs[result.error!] || "알 수 없는 오류가 발생했어요.",
        });
      }

      let msg = `🐚 <@${userId}>님이 <@${receiverSlackId}>님에게 오늘의 셸을 보냈어요!`;
      if (reason) msg += `\n💬 "${reason}"`;

      return NextResponse.json({
        response_type: "in_channel",
        text: msg,
      });
    }

    case "/sns인증": {
      const url = extractUrl(text);
      if (!url) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "사용법: `/sns인증 링크`\n예: `/sns인증 https://instagram.com/p/xxx`",
        });
      }

      const result = await submitSnsVerification(member.id, url);
      if (!result.success) {
        const msgs: Record<string, string> = {
          DAILY_LIMIT: "오늘은 이미 SNS 인증을 신청했어요! 내일 다시 해주세요 🐚",
          TX_FAILED: "신청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        };
        return NextResponse.json({
          response_type: "ephemeral",
          text: msgs[result.error!] || "알 수 없는 오류가 발생했어요.",
        });
      }

      return NextResponse.json({
        response_type: "in_channel",
        text: `📸 <@${userId}>님의 SNS 인증 신청이 접수되었어요!\n🔗 ${url}\n어드민 승인 후 +2🐚이 지급됩니다.`,
      });
    }

    case "/스킬공유": {
      const url = extractUrl(text);
      if (!url) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "사용법: `/스킬공유 링크`\n예: `/스킬공유 https://blog.com/my-post`",
        });
      }

      const result = await submitSkillShare(member.id, url);
      if (!result.success) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "신청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        });
      }

      return NextResponse.json({
        response_type: "in_channel",
        text: `📚 <@${userId}>님의 스킬 공유 신청이 접수되었어요!\n🔗 ${url}\n어드민 승인 후 +1🐚이 지급됩니다.`,
      });
    }

    default:
      return NextResponse.json({
        response_type: "ephemeral",
        text: "알 수 없는 명령어예요.",
      });
  }
}

function extractUrl(text: string): string | null {
  // Slack 형식: <https://...|label> 또는 일반 URL
  const slackMatch = text.match(/<([^>|]+)/);
  if (slackMatch) return slackMatch[1];

  const urlMatch = text.match(/(https?:\/\/\S+)/);
  if (urlMatch) return urlMatch[1];

  return null;
}
