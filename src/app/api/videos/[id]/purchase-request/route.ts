import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// VOD 구매 신청 (로그인 필요)
export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 영상 존재 및 판매 노출 확인
  const { data: video } = await supabase
    .from("videos")
    .select("id, title, is_listed, expires_at")
    .eq("id", videoId)
    .single();

  if (!video) {
    return NextResponse.json({ error: "영상을 찾을 수 없어요" }, { status: 404 });
  }
  if (!video.is_listed) {
    return NextResponse.json({ error: "현재 구매할 수 없는 영상이에요" }, { status: 400 });
  }
  if (new Date(video.expires_at) < new Date()) {
    return NextResponse.json({ error: "시청 기간이 만료된 영상이에요" }, { status: 400 });
  }

  // 이미 시청 권한이 있는지 확인
  const { data: existingGrant } = await supabase
    .from("video_grants")
    .select("id")
    .eq("video_id", videoId)
    .eq("member_id", session.memberId)
    .maybeSingle();

  if (existingGrant) {
    return NextResponse.json({ error: "이미 시청 권한이 있어요" }, { status: 409 });
  }

  // 중복 신청 확인
  const { data: existingReq } = await supabase
    .from("vod_requests")
    .select("id")
    .eq("video_id", videoId)
    .eq("member_id", session.memberId)
    .eq("status", "PENDING")
    .maybeSingle();

  if (existingReq) {
    return NextResponse.json({ error: "이미 구매 신청했어요" }, { status: 409 });
  }

  // 신청 생성
  const { error } = await supabase.from("vod_requests").insert({
    video_id: videoId,
    member_id: session.memberId,
    status: "PENDING",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// 본인의 구매 신청 여부 확인
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ requested: false });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("vod_requests")
    .select("id, status")
    .eq("video_id", videoId)
    .eq("member_id", session.memberId)
    .in("status", ["PENDING", "RESOLVED"])
    .maybeSingle();

  return NextResponse.json({ requested: !!data, status: data?.status || null });
}
