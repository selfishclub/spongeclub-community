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
      .select("member_id, amount, members!shell_transactions_member_id_fkey(name, is_active)")
      .gte("created_at", mondayUTC.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean };
      if (!member.is_active) continue;

      const existing = aggregated.get(row.member_id);
      const absAmount = Math.abs(row.amount);
      if (existing) {
        existing.total += absAmount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          total: absAmount,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "weekly", ranking });
  }

  // 전체 활동 랭킹: 적립 + 지출 분리
  if (type === "ranking") {
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, members!shell_transactions_member_id_fkey(name, is_active)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; total: number; earned: number; spent: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean };
      if (!member.is_active) continue;

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
          total: absAmount,
          earned: row.amount > 0 ? row.amount : 0,
          spent: row.amount < 0 ? absAmount : 0,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "ranking", ranking });
  }

  // 셸 지출 랭킹: 가장 많이 쓴 사람
  if (type === "spent") {
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, members!shell_transactions_member_id_fkey(name, is_active)")
      .lt("amount", 0);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean };
      if (!member.is_active) continue;

      const absAmount = Math.abs(row.amount);
      const existing = aggregated.get(row.member_id);
      if (existing) {
        existing.total += absAmount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          total: absAmount,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "spent", ranking });
  }

  // 셸 적립 랭킹: 가장 많이 받은 사람
  if (type === "earned") {
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, members!shell_transactions_member_id_fkey(name, is_active)")
      .gt("amount", 0);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<string, { member_id: string; name: string; total: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean };
      if (!member.is_active) continue;

      const existing = aggregated.get(row.member_id);
      if (existing) {
        existing.total += row.amount;
      } else {
        aggregated.set(row.member_id, {
          member_id: row.member_id,
          name: member.name,
          total: row.amount,
        });
      }
    }

    const ranking = Array.from(aggregated.values())
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "earned", ranking });
  }

  // 조별 활동 랭킹: 조 멤버들의 활동량 합산
  if (type === "group") {
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, members!shell_transactions_member_id_fkey(name, is_active, group_number)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const groupTotals = new Map<number, { group_number: number; total: number; earned: number; spent: number; member_count: number }>();

    const memberTotals = new Map<string, { group_number: number; total: number; earned: number; spent: number }>();

    for (const row of data || []) {
      const member = row.members as unknown as { name: string; is_active: boolean; group_number: number | null };
      if (!member.is_active || !member.group_number) continue;

      const existing = memberTotals.get(row.member_id);
      const absAmount = Math.abs(row.amount);
      if (existing) {
        existing.total += absAmount;
        if (row.amount > 0) existing.earned += row.amount;
        else existing.spent += absAmount;
      } else {
        memberTotals.set(row.member_id, {
          group_number: member.group_number,
          total: absAmount,
          earned: row.amount > 0 ? row.amount : 0,
          spent: row.amount < 0 ? absAmount : 0,
        });
      }
    }

    for (const { group_number, total, earned, spent } of memberTotals.values()) {
      const existing = groupTotals.get(group_number);
      if (existing) {
        existing.total += total;
        existing.earned += earned;
        existing.spent += spent;
        existing.member_count += 1;
      } else {
        groupTotals.set(group_number, { group_number, total, earned, spent, member_count: 1 });
      }
    }

    const ranking = Array.from(groupTotals.values())
      .sort((a, b) => b.total - a.total)
      .map((g, i) => ({
        rank: i + 1,
        member_id: `group-${g.group_number}`,
        name: `${g.group_number}조`,
        total: g.total,
        earned: g.earned,
        spent: g.spent,
        member_count: g.member_count,
      }));

    return NextResponse.json({ type: "group", ranking });
  }

  return NextResponse.json({ error: "잘못된 type" }, { status: 400 });
}
