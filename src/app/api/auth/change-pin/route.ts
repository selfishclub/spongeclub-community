import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { hashPin, isValidPassword, PASSWORD_RULE_MESSAGE } from "@/lib/pin";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { new_pin } = await request.json();

  if (!isValidPassword(new_pin)) {
    return NextResponse.json(
      { error: PASSWORD_RULE_MESSAGE },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const hashed = await hashPin(new_pin);

  const { error } = await supabase
    .from("members")
    .update({ pin: hashed, pin_changed: true })
    .eq("id", session.memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
