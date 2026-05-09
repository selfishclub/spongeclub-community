import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 영상에 멤버 권한 부여 (cost만큼 자동 차감)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const { member_id } = await request.json();

  if (!member_id) {
    return NextResponse.json({ error: "member_id가 필요해요" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. 영상 + cost 조회
  const { data: video, error: vErr } = await supabase
    .from("videos")
    .select("id, title, cost, expires_at")
    .eq("id", videoId)
    .single();

  if (vErr || !video) {
    return NextResponse.json({ error: "영상을 찾을 수 없어요" }, { status: 404 });
  }

  // 2. 멤버 + 잔고 조회
  const { data: member, error: mErr } = await supabase
    .from("members")
    .select("id, name, shell_balance")
    .eq("id", member_id)
    .eq("is_active", true)
    .single();

  if (mErr || !member) {
    return NextResponse.json({ error: "멤버를 찾을 수 없어요" }, { status: 404 });
  }

  // 3. 잔고 부족 시 차단 (마이너스 허용 안 함)
  if (member.shell_balance < video.cost) {
    return NextResponse.json(
      {
        error: `셸이 부족해요 (필요 ${video.cost}🐚, 보유 ${member.shell_balance}🐚)`,
      },
      { status: 400 }
    );
  }

  // 4. 중복 권한 체크
  const { data: existing } = await supabase
    .from("video_grants")
    .select("id")
    .eq("video_id", videoId)
    .eq("member_id", member_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "이미 권한이 부여된 멤버예요" },
      { status: 400 }
    );
  }

  // 5. 셸 차감 트랜잭션 (cost > 0인 경우에만)
  let transactionId: string | null = null;
  if (video.cost > 0) {
    const { data: tx, error: txErr } = await supabase
      .from("shell_transactions")
      .insert({
        member_id: member_id,
        amount: -video.cost,
        reason: "VIDEO_GRANT",
        reason_detail: `영상 시청 권한: ${video.title}`,
      })
      .select()
      .single();

    if (txErr || !tx) {
      return NextResponse.json(
        { error: "셸 차감에 실패했어요" },
        { status: 500 }
      );
    }
    transactionId = tx.id;

    const { error: rpcErr } = await supabase.rpc("increment_shell_balance", {
      p_member_id: member_id,
      p_amount: -video.cost,
    });
    if (rpcErr) {
      // 롤백 시도
      await supabase.from("shell_transactions").delete().eq("id", tx.id);
      return NextResponse.json(
        { error: "잔고 갱신에 실패했어요" },
        { status: 500 }
      );
    }
  }

  // 6. 권한 부여
  const { data: grant, error: gErr } = await supabase
    .from("video_grants")
    .insert({
      video_id: videoId,
      member_id: member_id,
      transaction_id: transactionId,
    })
    .select()
    .single();

  if (gErr) {
    // 롤백 시도
    if (transactionId) {
      await supabase.from("shell_transactions").delete().eq("id", transactionId);
      await supabase.rpc("increment_shell_balance", {
        p_member_id: member_id,
        p_amount: video.cost,
      });
    }
    return NextResponse.json({ error: gErr.message }, { status: 500 });
  }

  return NextResponse.json({ grant });
}
