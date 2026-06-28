import { NextRequest, NextResponse } from "next/server";
import {
  getMemberBySlackId,
  getShellBalance,
  sendShellGift,
  getTodayGiftCount,
  submitSnsVerification,
} from "@/lib/shell-service";
import { after } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const command = formData.get("command") as string;
  const text = (formData.get("text") as string || "").trim();
  const userId = formData.get("user_id") as string;
  const responseUrl = formData.get("response_url") as string;

  // 멤버 확인
  const member = await getMemberBySlackId(userId);
  if (!member) {
    return NextResponse.json({
      response_type: "ephemeral",
      text: "스폰지클럽에 등록되지 않은 멤버예요. 어드민에게 문의해주세요!",
    });
  }

  switch (command) {
    case "/이기적스폰지": {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "🐚 이기적 스폰지클럽 바로가기\n👉 https://spongeclub-community.vercel.app/",
      });
    }

    case "/잔고": {
      const balance = await getShellBalance(member.id);
      return NextResponse.json({
        response_type: "ephemeral",
        text: `🐚 ${member.name}님의 셸 잔고: *${balance}개*\n👉 마이페이지: https://spongeclub-community.vercel.app/mypage`,
      });
    }

    case "/보내기":
    case "/셸보내기": {
      const idMatch = text.match(/^<@(\w+)(?:\|[^>]*)?>[\s]*(.*)?/);
      const usernameMatch = text.match(/^@(\S+)\s*(.*)?/);

      if (!idMatch && !usernameMatch) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: `사용법: \`${command} @멤버이름 이유\`\n예: \`${command} @비비안 오늘 도움 고마워!\``,
        });
      }

      // 수신자 조회 (동기 — 빠른 실패 처리)
      let receiver;
      let reason: string;

      if (idMatch) {
        const slackId = idMatch[1];
        reason = (idMatch[2] || "").trim();
        receiver = await getMemberBySlackId(slackId);
      } else {
        const username = usernameMatch![1];
        reason = (usernameMatch![2] || "").trim();

        const supabaseAdmin = (await import("@/lib/supabase")).createAdminClient();
        const { data: allMembers } = await supabaseAdmin
          .from("members")
          .select("*")
          .eq("is_active", true);

        receiver = (allMembers || []).find((m: { name: string }) =>
          m.name.toLowerCase() === username.toLowerCase()
        ) || null;
        if (!receiver) {
          receiver = (allMembers || []).find((m: { name: string }) =>
            m.name.toLowerCase().includes(username.toLowerCase()) ||
            username.toLowerCase().includes(m.name.toLowerCase())
          ) || null;
        }
      }

      if (!receiver) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "받는 분이 스폰지클럽에 등록되지 않은 멤버예요.",
        });
      }

      // 자기 자신 체크
      if (member.id === receiver.id) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "자기 자신에게는 셸을 보낼 수 없어요! 🐚",
        });
      }

      // 일일 한도 체크
      const todayCount = await getTodayGiftCount(member.id);
      if (todayCount >= 1) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "오늘의 셸은 이미 보냈어요! 내일 다시 보내주세요 🐚",
        });
      }

      // 검증 통과 — 트랜잭션은 after()로 백그라운드 처리
      const receiverId = receiver.id;
      const receiverName = receiver.name;
      const receiverSlackId = receiver.slack_user_id;

      after(async () => {
        try {
          const result = await sendShellGift(member.id, receiverId, reason);

          if (!result.success) {
            await sendSlackResponse(responseUrl, {
              response_type: "ephemeral",
              text: "셸 송신 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
              replace_original: true,
            });
            return;
          }

          const receiverMention = receiverSlackId ? `<@${receiverSlackId}>` : receiverName;
          let msg = `🐚 <@${userId}>님이 ${receiverMention}님에게 오늘의 셸을 보냈어요!`;
          if (reason) msg += `\n💬 "${reason}"`;

          await sendSlackResponse(responseUrl, {
            response_type: "in_channel",
            text: msg,
            replace_original: true,
          });
        } catch (e) {
          console.error("[셸보내기 ERROR]", e);
          await sendSlackResponse(responseUrl, {
            response_type: "ephemeral",
            text: "셸 송신 중 오류가 발생했어요. 어드민에게 문의해주세요.",
            replace_original: true,
          });
        }
      });

      return new NextResponse(null, { status: 200 });
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
        const errMsg = result.error === "DUPLICATE_URL"
          ? "이미 인증된 링크예요! 다른 게시물로 인증해주세요."
          : "인증 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
        return NextResponse.json({
          response_type: "ephemeral",
          text: errMsg,
        });
      }

      return NextResponse.json({
        response_type: "in_channel",
        text: `📸 <@${userId}>님이 SNS 인증으로 +1🐚을 받았어요!\n🔗 ${url}`,
      });
    }

    default:
      return NextResponse.json({
        response_type: "ephemeral",
        text: "알 수 없는 명령어예요.",
      });
  }
}

async function sendSlackResponse(responseUrl: string, body: Record<string, unknown>) {
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function extractUrl(text: string): string | null {
  const slackMatch = text.match(/<([^>|]+)/);
  if (slackMatch) return slackMatch[1];

  const urlMatch = text.match(/(https?:\/\/\S+)/);
  if (urlMatch) return urlMatch[1];

  return null;
}
