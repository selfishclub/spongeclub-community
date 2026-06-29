import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { setSessionCookie } from "@/lib/auth";
import { hashPin, isHashed, verifyPin } from "@/lib/pin";

export async function POST(request: NextRequest) {
  const { name, pin } = await request.json();

  if (!name || !pin) {
    return NextResponse.json(
      { error: "이름과 PIN을 입력해주세요." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 이름으로 멤버 조회 (대소문자 무시)
  const { data: members } = await supabase
    .from("members")
    .select("id, name, pin, pin_changed, shell_balance, is_admin, is_active")
    .eq("is_active", true);

  const member = (members || []).find(
    (m) => m.name.toLowerCase() === name.toLowerCase().trim()
  );

  if (!member) {
    return NextResponse.json(
      { error: "일치하는 멤버를 찾을 수 없어요." },
      { status: 401 }
    );
  }

  const ok = await verifyPin(pin, member.pin);
  if (!ok) {
    return NextResponse.json(
      { error: "PIN이 일치하지 않아요." },
      { status: 401 }
    );
  }

  // 평문 PIN으로 인증된 경우, 같은 PIN을 해시로 즉시 교체한다.
  if (!isHashed(member.pin)) {
    const hashed = await hashPin(pin);
    await supabase
      .from("members")
      .update({ pin: hashed })
      .eq("id", member.id);
  }

  await setSessionCookie({ memberId: member.id, name: member.name });

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      name: member.name,
      shell_balance: member.shell_balance,
      pin_changed: member.pin_changed,
    },
  });
}
