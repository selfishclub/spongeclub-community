import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/crewchat — 전체 크루 카드 데이터 (조별 그룹핑)
export async function GET() {
  const supabase = createAdminClient();

  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, profile_image, group_number")
    .eq("is_active", true)
    .eq("is_admin", false)
    .order("name");

  if (error) {
    return NextResponse.json({ error: "멤버 목록을 불러올 수 없어요." }, { status: 500 });
  }

  // crew_profiles 조회
  const { data: profiles } = await supabase
    .from("crew_profiles")
    .select("member_id, job_title, field, want_to_meet, sns_instagram, sns_blog, sns_linkedin, sns_threads, sns_portfolio");

  const profileMap = new Map(
    (profiles || []).map((p) => [p.member_id, p])
  );

  // 조별로 그룹핑
  const groupMap = new Map<number, typeof cards>();
  const cards = (members || []).map((m) => {
    const profile = profileMap.get(m.id);
    return {
      id: m.id,
      name: m.name,
      profile_image: m.profile_image,
      group_number: m.group_number,
      has_profile: !!profile,
      ...(profile
        ? {
            job_title: profile.job_title,
            field: profile.field,
            want_to_meet: profile.want_to_meet,
            sns_instagram: profile.sns_instagram,
            sns_blog: profile.sns_blog,
            sns_linkedin: profile.sns_linkedin,
            sns_threads: profile.sns_threads,
            sns_portfolio: profile.sns_portfolio,
          }
        : {}),
    };
  });

  for (const card of cards) {
    const group = card.group_number || 0;
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(card);
  }

  // 조 번호순 정렬
  const groups = Array.from(groupMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([group, members]) => ({
      group_number: group,
      members,
    }));

  return NextResponse.json({ groups });
}
