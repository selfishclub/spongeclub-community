import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { extractYouTubeId } from "@/lib/youtube";

// 영상 상세 (권한 부여된 멤버 목록 포함)
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: video, error: vErr } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (vErr || !video) {
    return NextResponse.json({ error: "영상을 찾을 수 없어요" }, { status: 404 });
  }

  const { data: grantRows } = await supabase
    .from("video_grants")
    .select("id, granted_at, member_id")
    .eq("video_id", id)
    .order("granted_at", { ascending: false });

  let grants: Array<{
    id: string;
    granted_at: string;
    member_id: string;
    members: { id: string; name: string; shell_balance: number } | null;
  }> = [];

  if (grantRows && grantRows.length > 0) {
    const memberIds = grantRows.map((g) => g.member_id);
    const { data: memberRows } = await supabase
      .from("members")
      .select("id, name, shell_balance")
      .in("id", memberIds);

    const memberMap = new Map(
      (memberRows || []).map((m) => [m.id, m])
    );

    grants = grantRows.map((g) => ({
      ...g,
      members: memberMap.get(g.member_id) || null,
    }));
  }

  return NextResponse.json({ video, grants });
}

// 영상 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, youtube_url, description, cost, expires_at } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (expires_at !== undefined) updateData.expires_at = expires_at;
  if (youtube_url !== undefined) {
    const ytId = extractYouTubeId(youtube_url);
    if (!ytId) {
      return NextResponse.json({ error: "유효한 유튜브 링크가 아니에요" }, { status: 400 });
    }
    updateData.youtube_url = youtube_url;
  }
  if (cost !== undefined) {
    const costNum = Number(cost);
    if (!Number.isFinite(costNum) || costNum < 0) {
      return NextResponse.json({ error: "cost는 0 이상의 숫자여야 합니다" }, { status: 400 });
    }
    updateData.cost = Math.floor(costNum);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("videos")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ video: data });
}

// 영상 삭제 (권한·트랜잭션은 그대로 유지, video_grants는 cascade)
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
