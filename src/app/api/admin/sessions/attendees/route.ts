import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id 필수" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("session_attendees")
    .select(`
      id, status, registered_at, cancelled_at,
      member:members!session_attendees_member_id_fkey(id, name)
    `)
    .eq("session_id", sessionId)
    .in("status", ["REGISTERED", "ATTENDED", "CANCELLED"])
    .order("registered_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attendees: data || [] });
}
