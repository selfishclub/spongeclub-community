import { NextRequest, NextResponse } from "next/server";
import { adminAdjustShell } from "@/lib/shell-service";

export async function POST(request: NextRequest) {
  const { memberId, amount, reason } = await request.json();

  if (!memberId || amount === undefined || !reason) {
    return NextResponse.json(
      { error: "memberId, amount, reason 필수" },
      { status: 400 }
    );
  }

  // TODO: 어드민 인증 후 실제 adminId 사용
  const adminId = memberId; // 임시

  const result = await adminAdjustShell(memberId, amount, reason, adminId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
