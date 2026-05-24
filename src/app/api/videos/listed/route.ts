import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { extractYouTubeId, youtubeThumbnailUrl } from "@/lib/youtube";

// 판매 노출 중인 영상 목록 (공개)
export async function GET() {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, cost, youtube_url, expires_at, created_at")
    .eq("is_listed", true)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const videos = (data || []).map((v) => {
    const ytId = extractYouTubeId(v.youtube_url);
    return {
      id: v.id,
      title: v.title,
      description: v.description,
      cost: v.cost,
      thumbnail_url: ytId ? youtubeThumbnailUrl(ytId) : null,
    };
  });

  return NextResponse.json({ videos });
}
