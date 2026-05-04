import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ member: null });
  }

  const supabase = createAdminClient();
  const { data: member } = await supabase
    .from("members")
    .select("id, name, shell_balance, is_admin, group_number, pin_changed")
    .eq("id", session.memberId)
    .single();

  return NextResponse.json({ member });
}
