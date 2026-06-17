import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// VOD 즉시 구매 (셸 차감 + 권한 부여 + 요청 기록)
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

  // 1. 영상 존재 및 판매 노출 확인
  const { data: video } = await supabase
    .from("videos")
    .select("id, title, is_listed, expires_at, cost")
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

  // 2. 이미 시청 권한이 있는지 확인
  const { data: existingGrant } = await supabase
    .from("video_grants")
    .select("id")
    .eq("video_id", videoId)
    .eq("member_id", session.memberId)
    .maybeSingle();

  if (existingGrant) {
    return NextResponse.json({ error: "이미 시청 권한이 있어요" }, { status: 409 });
  }

  // 3. 멤버 잔고 확인
  const { data: member } = await supabase
    .from("members")
    .select("id, shell_balance")
    .eq("id", session.memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "멤버 정보를 찾을 수 없어요" }, { status: 404 });
  }

  if (member.shell_balance < video.cost) {
    return NextResponse.json(
      { error: `셸이 부족해요 (필요 ${video.cost}🐚, 보유 ${member.shell_balance}🐚)` },
      { status: 400 }
    );
  }

  // 4. 셸 차감 트랜잭션
  let transactionId: string | null = null;
  if (video.cost > 0) {
    const { data: tx, error: txErr } = await supabase
      .from("shell_transactions")
      .insert({
        member_id: session.memberId,
        amount: -video.cost,
        reason: "VIDEO_GRANT",
        reason_detail: `영상 시청 권한: ${video.title}`,
      })
      .select()
      .single();

    if (txErr || !tx) {
      return NextResponse.json({ error: "셸 차감에 실패했어요" }, { status: 500 });
    }
    transactionId = tx.id;

    const { error: rpcErr } = await supabase.rpc("increment_shell_balance", {
      p_member_id: session.memberId,
      p_amount: -video.cost,
    });
    if (rpcErr) {
      await supabase.from("shell_transactions").delete().eq("id", tx.id);
      return NextResponse.json({ error: "잔고 갱신에 실패했어요" }, { status: 500 });
    }
  }

  // 5. 권한 부여
  const { error: gErr } = await supabase
    .from("video_grants")
    .insert({
      video_id: videoId,
      member_id: session.memberId,
      transaction_id: transactionId,
    });

  if (gErr) {
    // 롤백
    if (transactionId) {
      await supabase.from("shell_transactions").delete().eq("id", transactionId);
      await supabase.rpc("increment_shell_balance", {
        p_member_id: session.memberId,
        p_amount: video.cost,
      });
    }
    return NextResponse.json({ error: "권한 부여에 실패했어요" }, { status: 500 });
  }

  // 6. vod_request 기록 (즉시 RESOLVED)
  await supabase.from("vod_requests").insert({
    video_id: videoId,
    member_id: session.memberId,
    status: "RESOLVED",
    resolved_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, purchased: true });
}

// 본인의 구매 상태 확인 (grant 기반)
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

  // grant가 있으면 구매 완료
  const { data: grant } = await supabase
    .from("video_grants")
    .select("id")
    .eq("video_id", videoId)
    .eq("member_id", session.memberId)
    .maybeSingle();

  if (grant) {
    return NextResponse.json({ requested: true, status: "RESOLVED" });
  }

  return NextResponse.json({ requested: false, status: null });
}
