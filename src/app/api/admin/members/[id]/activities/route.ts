import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/members/[id]/activities
// 한 멤버의 모든 활동을 카테고리별로 묶어서 반환
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // 멤버 본인 정보
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, name, phone_last4, email, slack_user_id, shell_balance, group_number, is_admin, is_active, created_at")
    .eq("id", id)
    .single();

  if (memberError || !member) {
    return NextResponse.json({ error: "멤버를 찾을 수 없어요." }, { status: 404 });
  }

  const [
    attendedRes,
    hostedRes,
    snsRes,
    skillRes,
    sentRes,
    receivedRes,
    vodRes,
    grantsRes,
    badgesRes,
  ] = await Promise.all([
    // 참여한 공유회 (REGISTERED + ATTENDED)
    supabase
      .from("session_attendees")
      .select(`
        id, status, registered_at, cancelled_at,
        session:sessions!session_attendees_session_id_fkey(
          id, title, scheduled_at, status, entry_cost,
          host:members!sessions_host_id_fkey(name)
        )
      `)
      .eq("member_id", id)
      .order("registered_at", { ascending: false }),

    // 개최한 공유회
    supabase
      .from("sessions")
      .select("id, title, scheduled_at, status, entry_cost, capacity, created_at")
      .eq("host_id", id)
      .order("scheduled_at", { ascending: false }),

    // SNS 인증
    supabase
      .from("shell_requests")
      .select("id, url, status, created_at, reviewed_at")
      .eq("member_id", id)
      .eq("type", "SNS_VERIFY")
      .order("created_at", { ascending: false }),

    // 스킬 공유 (써본 + 써보고싶은)
    supabase
      .from("shell_requests")
      .select("id, type, url, status, created_at, reviewed_at")
      .eq("member_id", id)
      .in("type", ["SKILL_SHARE", "SKILL_TRIED"])
      .order("created_at", { ascending: false }),

    // 셸 보낸 내역 (related_member_id = 본인)
    supabase
      .from("shell_transactions")
      .select(`
        id, amount, reason, reason_detail, created_at,
        receiver:members!shell_transactions_member_id_fkey(id, name)
      `)
      .eq("related_member_id", id)
      .eq("reason", "MEMBER_GIFT")
      .order("created_at", { ascending: false }),

    // 셸 받은 내역
    supabase
      .from("shell_transactions")
      .select(`
        id, amount, reason, reason_detail, created_at,
        sender:members!shell_transactions_related_member_id_fkey(id, name)
      `)
      .eq("member_id", id)
      .eq("reason", "MEMBER_GIFT")
      .order("created_at", { ascending: false }),

    // VOD 신청
    supabase
      .from("vod_requests")
      .select(`
        id, status, created_at, resolved_at,
        session:sessions!vod_requests_session_id_fkey(id, title, scheduled_at, entry_cost)
      `)
      .eq("member_id", id)
      .order("created_at", { ascending: false }),

    // 시청 권한 받은 영상
    supabase
      .from("video_grants")
      .select(`
        id, granted_at,
        video:videos!video_grants_video_id_fkey(id, title, youtube_url, cost, expires_at)
      `)
      .eq("member_id", id)
      .order("granted_at", { ascending: false }),

    // 획득한 배지
    supabase
      .from("member_achievements")
      .select(`
        id, earned_at,
        achievement:achievements!member_achievements_achievement_id_fkey(slug, name, description, icon)
      `)
      .eq("member_id", id)
      .order("earned_at", { ascending: false }),
  ]);

  return NextResponse.json({
    member,
    attended: attendedRes.data || [],
    hosted: hostedRes.data || [],
    sns: snsRes.data || [],
    skill: skillRes.data || [],
    sent: sentRes.data || [],
    received: receivedRes.data || [],
    vodRequests: vodRes.data || [],
    videoGrants: grantsRes.data || [],
    badges: badgesRes.data || [],
  });
}
