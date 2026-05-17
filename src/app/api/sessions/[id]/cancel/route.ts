import { NextRequest, NextResponse } from "next/server";
import { cancelOwnRegistration } from "@/lib/session-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { member_id } = await request.json();

  if (!member_id) {
    return NextResponse.json({ error: "멤버를 선택해주세요." }, { status: 400 });
  }

  const result = await cancelOwnRegistration(member_id, id);

  if (!result.success) {
    const msgs: Record<string, string> = {
      NOT_FOUND: "공유회를 찾을 수 없어요.",
      NOT_CANCELLABLE: "취소할 수 없는 상태의 공유회예요.",
      DEADLINE_PASSED: "공유회 당일 자정 이후에는 취소할 수 없어요.",
      NOT_REGISTERED: "신청 내역이 없어요.",
    };
    return NextResponse.json(
      { error: msgs[result.error!] || "취소에 실패했어요." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
