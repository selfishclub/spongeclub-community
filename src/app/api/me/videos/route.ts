import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { extractYouTubeId, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

// 본인이 시청 가능한 영상 목록 (권한 부여 + 만료 전)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("video_grants")
    .select(
      "id, granted_at, videos(id, title, youtube_url, description, expires_at)"
    )
    .eq("member_id", session.memberId)
    .order("granted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type GrantRow = {
    id: string;
    granted_at: string;
    videos: {
      id: string;
      title: string;
      youtube_url: string;
      description: string | null;
      expires_at: string;
    } | null;
  };

  const videos = ((data || []) as unknown as GrantRow[])
    .filter((g) => g.videos)
    .map((g) => {
      const v = g.videos!;
      const ytId = extractYouTubeId(v.youtube_url);
      const expired = v.expires_at <= nowIso;
      return {
        id: v.id,
        title: v.title,
        description: v.description,
        expires_at: v.expires_at,
        granted_at: g.granted_at,
        expired,
        embed_url: ytId ? youtubeEmbedUrl(ytId) : null,
        thumbnail_url: ytId ? youtubeThumbnailUrl(ytId) : null,
      };
    });

  return NextResponse.json({ videos });
}
