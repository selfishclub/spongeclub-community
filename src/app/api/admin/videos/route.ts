import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { extractYouTubeId } from "@/lib/youtube";

// 영상 목록
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*, video_grants(id)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const videos = (data || []).map((v) => ({
    ...v,
    grant_count: v.video_grants?.length || 0,
    video_grants: undefined,
  }));

  return NextResponse.json({ videos });
}

// 영상 생성
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, youtube_url, description, cost, expires_at } = body;

  if (!title || !youtube_url || !expires_at) {
    return NextResponse.json(
      { error: "title, youtube_url, expires_at는 필수입니다" },
      { status: 400 }
    );
  }

  const ytId = extractYouTubeId(youtube_url);
  if (!ytId) {
    return NextResponse.json(
      { error: "유효한 유튜브 링크가 아니에요" },
      { status: 400 }
    );
  }

  const costNum = Number(cost);
  if (!Number.isFinite(costNum) || costNum < 0) {
    return NextResponse.json({ error: "cost는 0 이상의 숫자여야 합니다" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("videos")
    .insert({
      title,
      youtube_url,
      description: description || null,
      cost: Math.floor(costNum),
      expires_at,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ video: data });
}
