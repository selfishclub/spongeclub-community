import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "weekly";

  const supabase = createAdminClient();

  if (type === "weekly") {
    // 이번 주 월요일 00:00 KST 계산
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    const dayOfWeek = kstNow.getUTCDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayKST = new Date(kstNow);
    mondayKST.setUTCDate(kstNow.getUTCDate() - diffToMonday);
    mondayKST.setUTCHours(0, 0, 0, 0);
    // KST 월요일 00:00을 UTC로 변환
    const mondayUTC = new Date(mondayKST.getTime() - kstOffset);

    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, members!inner(name, is_active)")
      .eq("reason", "MEMBER_GIFT")
      .gte("created_at", mondayUTC.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<
      string,
      { member_id: string; name: string; total: number }
    >();

    for (const row of data || []) {
      const member = row.members as unknown as {
        name: string;
        is_active: boolean;
      };
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
      .slice(0, 50)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "weekly", weekStart: mondayUTC.toISOString(), ranking });
  }

  if (type === "total") {
    const { data, error } = await supabase
      .from("shell_transactions")
      .select("member_id, amount, members!inner(name, is_active)")
      .eq("reason", "MEMBER_GIFT");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const aggregated = new Map<
      string,
      { member_id: string; name: string; total: number }
    >();

    for (const row of data || []) {
      const member = row.members as unknown as {
        name: string;
        is_active: boolean;
      };
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
      .slice(0, 50)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return NextResponse.json({ type: "total", ranking });
  }

  return NextResponse.json(
    { error: "type은 weekly 또는 total이어야 합니다" },
    { status: 400 }
  );
}
