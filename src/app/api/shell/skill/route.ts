import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { submitSkillShare } from "@/lib/shell-service";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "링크를 입력해주세요." }, { status: 400 });
  }

  const result = await submitSkillShare(session.memberId, url);

  if (!result.success) {
    return NextResponse.json(
      { error: "신청 중 오류가 발생했어요." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
