import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/achievements/feed
// 배지 Top 3 + 최근 획득 피드
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cohort = searchParams.get("cohort");

  const supabase = createAdminClient();

  // 2기 시작일 (KST 2026-06-28 00:00 = UTC 2026-06-27 15:00)
  const COHORT2_START_UTC = "2026-06-27T15:00:00.000Z";

  // Top 3: 배지 많은 순
  let badgeQuery = supabase
    .from("member_achievements")
    .select("member_id, earned_at, members!member_achievements_member_id_fkey(name, is_active, is_admin, profile_image, cohort)");

  if (cohort === "2") badgeQuery = badgeQuery.gte("earned_at", COHORT2_START_UTC);
  else if (cohort === "1") badgeQuery = badgeQuery.lt("earned_at", COHORT2_START_UTC);

  const { data: topData } = await badgeQuery;

  function matchesCohort(member: { cohort?: number | null }): boolean {
    if (!cohort) return true;
    return (member.cohort ?? 1) === parseInt(cohort);
  }

  const badgeCounts = new Map<string, { member_id: string; name: string; profile_image: string | null; count: number }>();

  for (const row of topData || []) {
    const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null; cohort?: number | null };
    if (!member.is_active || member.is_admin) continue;
    if (!matchesCohort(member)) continue;

    const existing = badgeCounts.get(row.member_id);
    if (existing) {
      existing.count++;
    } else {
      badgeCounts.set(row.member_id, {
        member_id: row.member_id,
        name: member.name,
        profile_image: member.profile_image,
        count: 1,
      });
    }
  }

  const top3 = Array.from(badgeCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((m, i) => ({ rank: i + 1, ...m }));

  // Top 3 멤버의 배지 목록도 가져오기
  const top3Ids = top3.map((t) => t.member_id);
  const { data: top3Badges } = await supabase
    .from("member_achievements")
    .select("member_id, achievements(slug, name, icon)")
    .in("member_id", top3Ids.length > 0 ? top3Ids : ["none"]);

  const top3WithBadges = top3.map((t) => ({
    ...t,
    badges: (top3Badges || [])
      .filter((b) => b.member_id === t.member_id)
      .map((b) => {
        const a = b.achievements as unknown as { slug: string; name: string; icon: string };
        return { slug: a.slug, name: a.name, icon: a.icon };
      }),
  }));

  // 최근 배지 획득 피드 (최신 10건)
  const { data: recentData } = await supabase
    .from("member_achievements")
    .select(`
      earned_at,
      members!member_achievements_member_id_fkey(name, is_active, is_admin, profile_image),
      achievements(slug, name, icon)
    `)
    .order("earned_at", { ascending: false })
    .limit(10);

  const recent = (recentData || [])
    .filter((row) => {
      const member = row.members as unknown as { name: string; is_active: boolean };
      return member.is_active;
    })
    .map((row) => {
      const member = row.members as unknown as { name: string; is_admin: boolean; profile_image: string | null };
      const achievement = row.achievements as unknown as { slug: string; name: string; icon: string };
      return {
        name: member.name,
        profile_image: member.profile_image,
        badge_name: achievement.name,
        badge_slug: achievement.slug,
        badge_icon: achievement.icon,
        earned_at: row.earned_at,
      };
    });

  return NextResponse.json({ top3: top3WithBadges, recent });
}
