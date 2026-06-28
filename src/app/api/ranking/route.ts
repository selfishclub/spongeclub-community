import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// Supabase 1000행 제한 우회: 페이지네이션으로 전체 조회
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAll(query: any): Promise<any[]> {
  const PAGE = 1000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data } = await query.range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// 2기 시작일 (KST 2026-06-28 00:00 = UTC 2026-06-27 15:00)
const COHORT2_START_UTC = "2026-06-27T15:00:00.000Z";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "ranking";
  const cohort = searchParams.get("cohort"); // "1", "2", or null (전체)

  const supabase = createAdminClient();

  // cohort=2 → 2기 시작일 이후 거래만, cohort=1 → 이전만, null → 전체
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyDateFilter(query: any) {
    if (cohort === "2") return query.gte("created_at", COHORT2_START_UTC);
    if (cohort === "1") return query.lt("created_at", COHORT2_START_UTC);
    return query;
  }

  // 이번 주 월요일 00:00 KST 계산 헬퍼
  function getThisWeekMondayUTC() {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    const dayOfWeek = kstNow.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayKST = new Date(kstNow);
    mondayKST.setUTCDate(kstNow.getUTCDate() - diffToMonday);
    mondayKST.setUTCHours(0, 0, 0, 0);
    return new Date(mondayKST.getTime() - kstOffset);
  }

  // 이번 주 활동 랭킹 (월~일)
  if (type === "weekly") {
    const mondayUTC = getThisWeekMondayUTC();

    let query = supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)")
      .gte("created_at", mondayUTC.toISOString());

    // 2기 필터: 이미 이번 주 범위이므로 2기 시작일 이후인지만 추가 체크
    if (cohort === "2") query = query.gte("created_at", COHORT2_START_UTC);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;

      const existing = aggregated.get(row.member_id);
      const absAmount = Math.abs(row.amount);
      if (existing) {
        existing.total += absAmount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          profile_image: member.profile_image,
          total: absAmount,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "weekly", ranking });
  }

  // 전체 활동 랭킹: 적립 + 지출 분리
  if (type === "ranking") {
    const baseQuery = supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)");

    const data = await fetchAll(applyDateFilter(baseQuery));

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number; earned: number; spent: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;

      const existing = aggregated.get(row.member_id);
      const absAmount = Math.abs(row.amount);
      if (existing) {
        existing.total += absAmount;
        if (row.amount > 0) existing.earned += row.amount;
        else existing.spent += absAmount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          profile_image: member.profile_image,
          total: absAmount,
          earned: row.amount > 0 ? row.amount : 0,
          spent: row.amount < 0 ? absAmount : 0,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "ranking", ranking });
  }

  // 셸 지출 랭킹: 가장 많이 쓴 사람
  if (type === "spent") {
    const baseQuery = supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)")
      .lt("amount", 0);

    const data = await fetchAll(applyDateFilter(baseQuery));

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;

      const absAmount = Math.abs(row.amount);
      const existing = aggregated.get(row.member_id);
      if (existing) {
        existing.total += absAmount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          profile_image: member.profile_image,
          total: absAmount,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "spent", ranking });
  }

  // 셸 적립 랭킹: 가장 많이 받은 사람
  if (type === "earned") {
    const baseQuery = supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)")
      .gt("amount", 0);

    const data = await fetchAll(applyDateFilter(baseQuery));

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;

      const existing = aggregated.get(row.member_id);
      if (existing) {
        existing.total += row.amount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          profile_image: member.profile_image,
          total: row.amount,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "earned", ranking });
  }

  // 조별 활동 랭킹: 1인 평균 기준 (조별 인원수 차이 보정)
  if (type === "group") {
    // 1) 조별 로스터 인원 (활성 멤버, 어드민 제외하되 조에 속한 어드민은 포함)
    const { data: roster, error: rosterError } = await supabase
      .from("members")
      .select("group_number")
      .eq("is_active", true)
      .not("group_number", "is", null);

    if (rosterError) {
      return NextResponse.json({ error: rosterError.message }, { status: 500 });
    }

    const rosterCount = new Map<number, number>();
    for (const r of roster || []) {
      const n = r.group_number as number;
      rosterCount.set(n, (rosterCount.get(n) || 0) + 1);
    }

    // 2) 거래 내역 합산
    const baseQuery = supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, group_number)");

    const data = await fetchAll(applyDateFilter(baseQuery));

    const groupTotals = new Map<number, { group_number: number; total: number; earned: number; spent: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; group_number: number | null };
      if (!member.is_active || !member.group_number) continue;

      const absAmount = Math.abs(row.amount);
      const existing = groupTotals.get(member.group_number);
      if (existing) {
        existing.total += absAmount;
        if (row.amount > 0) existing.earned += row.amount;
        else existing.spent += absAmount;
      } else {
        groupTotals.set(member.group_number, {
          group_number: member.group_number,
          total: absAmount,
          earned: row.amount > 0 ? row.amount : 0,
          spent: row.amount < 0 ? absAmount : 0,
        });
      }
    }

    // 3) 활동 0 인 조도 노출되도록 로스터 기반으로 합치기
    for (const [n] of rosterCount) {
      if (!groupTotals.has(n)) {
        groupTotals.set(n, { group_number: n, total: 0, earned: 0, spent: 0 });
      }
    }

    const ranking = Array.from(groupTotals.values())
      .map((g) => {
        const member_count = rosterCount.get(g.group_number) || 0;
        const avg = member_count > 0 ? g.total / member_count : 0;
        return { ...g, member_count, avg };
      })
      .sort((a, b) => b.avg - a.avg)
      .map((g, i) => ({
        rank: i + 1,
        member_id: `group-${g.group_number}`,
        name: `${g.group_number}조`,
        total: g.total,
        earned: g.earned,
        spent: g.spent,
        member_count: g.member_count,
        avg: Math.round(g.avg * 10) / 10,
      }));

    return NextResponse.json({ type: "group", ranking });
  }

  return NextResponse.json({ error: "잘못된 type" }, { status: 400 });
}
