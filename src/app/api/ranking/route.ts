import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "ranking";

  const supabase = createAdminClient();

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

    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)")
      .gte("created_at", mondayUTC.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;
      if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

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
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number; earned: number; spent: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;
      if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

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
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)")
      .lt("amount", 0);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;
      if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

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
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, profile_image)")
      .gt("amount", 0);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; profile_image: string | null; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; profile_image: string | null };
      if (!member.is_active || member.is_admin) continue;
      if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

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
    // 1) 조별 로스터 인원 (활성·비어드민 멤버 수) 집계
    const { data: roster, error: rosterError } = await supabase
      .from("members")
      .select("group_number")
      .eq("is_active", true)
      .eq("is_admin", false)
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
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, group_number)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const groupTotals = new Map<number, { group_number: number; total: number; earned: number; spent: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; group_number: number | null };
      if (!member.is_active || member.is_admin || !member.group_number) continue;
      if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

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
