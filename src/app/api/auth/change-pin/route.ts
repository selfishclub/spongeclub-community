import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { new_pin } = await request.json();

  if (!new_pin || !/^\d{4}$/.test(new_pin)) {
    return NextResponse.json(
      { error: "PIN은 숫자 4자리여야 해요." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("members")
    .update({ pin: new_pin, pin_changed: true })
    .eq("id", session.memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
