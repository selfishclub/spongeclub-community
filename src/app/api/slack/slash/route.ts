import { NextRequest, NextResponse } from "next/server";
import { getSlackClient } from "@/lib/slack";
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
        text: `🐚 ${member.name}님의 셸 잔고: *${balance}개*\n👉 마이페이지: https://spongeclub-community.vercel.app/mypage`,
      });
    }

    case "/보내기":
    case "/셸보내기": {
      // 형식: @멤버 이유
      // Slack은 <@U123> 또는 @username 형식으로 보낼 수 있음
      const idMatch = text.match(/^<@(\w+)(?:\|[^>]*)?>[\s]*(.*)?/);
      const usernameMatch = text.match(/^@(\S+)\s*(.*)?/);

      if (!idMatch && !usernameMatch) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: `사용법: \`${command} @멤버이름 이유\`\n예: \`${command} @비비안 오늘 도움 고마워!\``,
        });
      }

      let receiver;
      let reason: string;

      if (idMatch) {
        reason = (idMatch[2] || "").trim();
        receiver = await getMemberBySlackId(idMatch[1]);
      } else {
        const username = usernameMatch![1];
        reason = (usernameMatch![2] || "").trim();
        // username으로 Supabase에서 멤버 조회
        const supabaseAdmin = (await import("@/lib/supabase")).createAdminClient();
        const { data: members } = await supabaseAdmin
          .from("members")
          .select("*")
          .eq("is_active", true);
        // Slack CSV에서 가져온 username이나 이름으로 매칭
        receiver = (members || []).find((m: { slack_user_id: string | null; name: string }) => {
          // email 앞부분이 username인 경우가 많음
          return m.name.toLowerCase() === username.toLowerCase();
        }) || null;
        // 못 찾으면 slack username으로 API 조회
        if (!receiver) {
          try {
            const slackClient = getSlackClient();
            const userList = await slackClient.users.list({});
            const slackUser = userList.members?.find((u) => u.name === username);
            if (slackUser?.id) {
              receiver = await getMemberBySlackId(slackUser.id);
            }
          } catch {
            // silently fail
          }
        }
      }
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

      let msg = `🐚 <@${userId}>님이 ${receiver.name}님에게 오늘의 셸을 보냈어요!`;
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
        text: `📸 <@${userId}>님의 SNS 인증 신청이 접수되었어요!\n🔗 ${url}\n어드민 승인 후 +2🐚이 지급됩니다.\n👉 웹에서도 가능: https://spongeclub-community.vercel.app/mypage`,
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
        text: `📚 <@${userId}>님의 스킬 공유 신청이 접수되었어요!\n🔗 ${url}\n어드민 승인 후 +1🐚이 지급됩니다.\n👉 웹에서도 가능: https://spongeclub-community.vercel.app/mypage`,
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
