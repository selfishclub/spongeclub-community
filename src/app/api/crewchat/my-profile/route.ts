import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

// GET /api/crewchat/my-profile
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ profile: null });
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("crew_profiles")
    .select("job_title, field, want_to_meet, sns_instagram, sns_blog, sns_linkedin, sns_threads, sns_portfolio")
    .eq("member_id", session.memberId)
    .single();

  return NextResponse.json({ profile: profile || null });
}

// POST /api/crewchat/my-profile
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { job_title, field, want_to_meet, sns_instagram, sns_blog, sns_linkedin, sns_threads, sns_portfolio } = await request.json();

  if (!job_title?.trim()) {
    return NextResponse.json({ error: "직무는 필수에요." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 기존 프로필 있는지 확인 (첫 저장 여부)
  const { data: existing } = await supabase
    .from("crew_profiles")
    .select("id")
    .eq("member_id", session.memberId)
    .single();

  const isFirstSave = !existing;

  const { error } = await supabase
    .from("crew_profiles")
    .upsert(
      {
        member_id: session.memberId,
        job_title: job_title.trim(),
        field: (field || "").trim(),
        want_to_meet: (want_to_meet || "").trim(),
        sns_instagram: (sns_instagram || "").trim(),
        sns_blog: (sns_blog || "").trim(),
        sns_linkedin: (sns_linkedin || "").trim(),
        sns_threads: (sns_threads || "").trim(),
        sns_portfolio: (sns_portfolio || "").trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "member_id" }
    );

  if (error) {
    console.error("Crew profile save error:", error);
    return NextResponse.json({ error: "저장에 실패했어요." }, { status: 500 });
  }

  // 첫 프로필 작성 시 +3셸 지급
  if (isFirstSave) {
    await supabase.from("shell_transactions").insert({
      member_id: session.memberId,
      amount: 3,
      reason: "ADMIN_ADJUSTMENT",
      reason_detail: "크루챗 프로필 첫 작성 보너스",
    });
    await supabase.rpc("increment_shell_balance", {
      p_member_id: session.memberId,
      p_amount: 3,
    });
  }

  return NextResponse.json({ success: true, firstSave: isFirstSave });
}
