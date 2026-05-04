import { NextRequest, NextResponse } from "next/server";
import { registerForSession } from "@/lib/session-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { member_id } = await request.json();

  if (!member_id) {
    return NextResponse.json({ error: "멤버를 선택해주세요." }, { status: 400 });
  }

  const result = await registerForSession(member_id, id);

  if (!result.success) {
    const msgs: Record<string, string> = {
      NOT_FOUND: "공유회를 찾을 수 없어요.",
      OWN_SESSION: "본인이 개최한 공유회에는 신청할 수 없어요.",
      ALREADY_REGISTERED: "이미 신청한 공유회예요.",
      FULL: "정원이 마감되었어요.",
      INSUFFICIENT_BALANCE: "셸이 부족해요.",
    };
    return NextResponse.json(
      { error: msgs[result.error!] || "신청에 실패했어요." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
