import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 어드민: VOD 신청 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  const supabase = createAdminClient();

  // 세션 기반 VOD 신청
  const { data: sessionReqs } = await supabase
    .from("vod_requests")
    .select(`
      id, status, created_at, resolved_at, video_id,
      session:sessions!vod_requests_session_id_fkey(id, title, scheduled_at, entry_cost, host:members!sessions_host_id_fkey(name)),
      member:members!vod_requests_member_id_fkey(id, name)
    `)
    .eq("status", status)
    .is("video_id", null)
    .order("created_at", { ascending: false })
    .limit(200);

  // 영상 직접 구매 신청
  const { data: videoReqs } = await supabase
    .from("vod_requests")
    .select(`
      id, status, created_at, resolved_at, video_id,
      video:videos!vod_requests_video_id_fkey(id, title, cost),
      member:members!vod_requests_member_id_fkey(id, name)
    `)
    .eq("status", status)
    .not("video_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  type SessionRow = {
    id: string;
    status: string;
    created_at: string;
    resolved_at: string | null;
    video_id: string | null;
    session: { id: string; title: string; scheduled_at: string; entry_cost: number; host: { name: string } | null } | null;
    member: { id: string; name: string } | null;
  };

  type VideoRow = {
    id: string;
    status: string;
    created_at: string;
    resolved_at: string | null;
    video_id: string | null;
    video: { id: string; title: string; cost: number } | null;
    member: { id: string; name: string } | null;
  };

  const sessionRequests = ((sessionReqs || []) as unknown as SessionRow[]).map((row) => {
    const entryCost = row.session?.entry_cost ?? 0;
    return {
      id: row.id,
      type: "session" as const,
      status: row.status,
      created_at: row.created_at,
      session_id: row.session?.id ?? null,
      session_title: row.session?.title ?? "(삭제된 공유회)",
      session_scheduled_at: row.session?.scheduled_at ?? null,
      session_entry_cost: entryCost,
      vod_suggested_cost: entryCost * 2,
      host_name: row.session?.host?.name ?? "알 수 없음",
      member_id: row.member?.id ?? null,
      member_name: row.member?.name ?? "알 수 없음",
      video_id: null,
      video_title: null,
      video_cost: null,
    };
  });

  const videoRequests = ((videoReqs || []) as unknown as VideoRow[]).map((row) => ({
    id: row.id,
    type: "video" as const,
    status: row.status,
    created_at: row.created_at,
    session_id: null,
    session_title: null,
    session_scheduled_at: null,
    session_entry_cost: 0,
    vod_suggested_cost: row.video?.cost ?? 0,
    host_name: "",
    member_id: row.member?.id ?? null,
    member_name: row.member?.name ?? "알 수 없음",
    video_id: row.video_id,
    video_title: row.video?.title ?? "(삭제된 영상)",
    video_cost: row.video?.cost ?? 0,
  }));

  const requests = [...sessionRequests, ...videoRequests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ requests });
}

// 어드민: VOD 신청 처리 (RESOLVED 또는 REJECTED 로 표시)
export async function POST(request: NextRequest) {
  const { id, action } = await request.json();
  if (!id || !action) {
    return NextResponse.json({ error: "id, action 필수" }, { status: 400 });
  }

  const newStatus = action === "resolve" ? "RESOLVED" : action === "reject" ? "REJECTED" : null;
  if (!newStatus) {
    return NextResponse.json({ error: "action 은 resolve / reject 만 허용" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("vod_requests")
    .update({ status: newStatus, resolved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "PENDING");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
