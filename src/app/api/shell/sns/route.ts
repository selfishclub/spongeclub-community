import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { submitSnsVerification } from "@/lib/shell-service";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "링크를 입력해주세요." }, { status: 400 });
  }

  const result = await submitSnsVerification(session.memberId, url);

  if (!result.success) {
    const msgs: Record<string, string> = {
      DAILY_LIMIT: "오늘은 이미 SNS 인증을 신청했어요! 내일 다시 해주세요.",
      TX_FAILED: "신청 중 오류가 발생했어요.",
    };
    return NextResponse.json(
      { error: msgs[result.error!] || "알 수 없는 오류" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
