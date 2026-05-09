import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 권한 회수 (셸 환불 옵션)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; grantId: string }> }
) {
  const { id: videoId, grantId } = await params;
  const url = new URL(request.url);
  const refund = url.searchParams.get("refund") === "true";

  const supabase = createAdminClient();

  // 권한 + 영상 정보 조회
  const { data: grant, error: gErr } = await supabase
    .from("video_grants")
    .select("id, member_id, transaction_id, videos(title, cost)")
    .eq("id", grantId)
    .eq("video_id", videoId)
    .single();

  if (gErr || !grant) {
    return NextResponse.json({ error: "권한을 찾을 수 없어요" }, { status: 404 });
  }

  // 환불 처리 (옵션)
  const video = grant.videos as unknown as { title: string; cost: number };
  if (refund && video?.cost > 0) {
    const { error: txErr } = await supabase.from("shell_transactions").insert({
      member_id: grant.member_id,
      amount: video.cost,
      reason: "VIDEO_GRANT_REFUND",
      reason_detail: `영상 권한 회수 환불: ${video.title}`,
    });

    if (!txErr) {
      await supabase.rpc("increment_shell_balance", {
        p_member_id: grant.member_id,
        p_amount: video.cost,
      });
    }
  }

  const { error: dErr } = await supabase
    .from("video_grants")
    .delete()
    .eq("id", grantId);

  if (dErr) {
    return NextResponse.json({ error: dErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
