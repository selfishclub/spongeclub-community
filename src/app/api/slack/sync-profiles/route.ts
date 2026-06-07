import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase";
import { getSlackClient } from "@/lib/slack";

// POST /api/slack/sync-profiles
// Slack에서 전체 멤버 프로필 사진을 가져와서 members.profile_image 업데이트
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 어드민 체크
  const { data: me } = await supabase
    .from("members")
    .select("is_admin")
    .eq("id", session.memberId)
    .single();

  if (!me?.is_admin) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  const slack = getSlackClient();

  try {
    // Slack 전체 유저 목록 가져오기
    const slackUsers: { id: string; profile: { image_192?: string; image_72?: string }; deleted: boolean; is_bot: boolean }[] = [];
    let cursor: string | undefined;

    do {
      const result = await slack.users.list({ cursor, limit: 200 });
      const members = (result.members || []) as { id: string; profile: { image_192?: string; image_72?: string }; deleted: boolean; is_bot: boolean }[];
      slackUsers.push(...members.filter((u) => !u.deleted && !u.is_bot));
      cursor = result.response_metadata?.next_cursor || undefined;
    } while (cursor);

    // DB에서 slack_user_id가 있는 멤버 조회
    const { data: dbMembers } = await supabase
      .from("members")
      .select("id, slack_user_id")
      .not("slack_user_id", "is", null)
      .eq("is_active", true);

    if (!dbMembers || dbMembers.length === 0) {
      return NextResponse.json({ synced: 0, message: "slack_user_id가 있는 멤버가 없어요." });
    }

    // Slack ID → 프로필 사진 맵
    const slackPhotoMap = new Map<string, string>();
    for (const u of slackUsers) {
      const photo = u.profile.image_192 || u.profile.image_72;
      if (photo) slackPhotoMap.set(u.id, photo);
    }

    // 매칭해서 업데이트
    let synced = 0;
    for (const member of dbMembers) {
      const photo = slackPhotoMap.get(member.slack_user_id);
      if (photo) {
        await supabase
          .from("members")
          .update({ profile_image: photo })
          .eq("id", member.id);
        synced++;
      }
    }

    return NextResponse.json({ synced, total: dbMembers.length });
  } catch (error) {
    console.error("Slack sync error:", error);
    return NextResponse.json({ error: "Slack API 호출 중 오류가 발생했어요." }, { status: 500 });
  }
}
