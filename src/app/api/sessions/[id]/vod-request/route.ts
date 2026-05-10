import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";

// 본인이 이 세션에 대한 VOD 신청을 했는지 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ requested: false });

  const { id: sessionId } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("vod_requests")
    .select("id, status, created_at")
    .eq("session_id", sessionId)
    .eq("member_id", session.memberId)
    .maybeSingle();

  return NextResponse.json({
    requested: !!data,
    request: data || null,
  });
}

// VOD 구매 신청 (무료 — 어드민이 video_grants 만들 때 셸 차감)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { id: sessionId } = await params;
  const supabase = createAdminClient();

  // 세션 존재 확인
  const { data: target } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "공유회를 찾을 수 없어요." }, { status: 404 });
  }

  const { error } = await supabase.from("vod_requests").insert({
    session_id: sessionId,
    member_id: session.memberId,
    status: "PENDING",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "이미 VOD 신청을 완료하셨어요." },
        { status: 409 }
      );
    }
    console.error("[vod-request] insert 실패:", error);
    return NextResponse.json(
      { error: `신청 중 오류: ${error.message || error.code || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
