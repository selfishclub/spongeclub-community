import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("profile_image")
    .eq("name", name)
    .single();

  return NextResponse.json({ profile_image: data?.profile_image || null });
}
