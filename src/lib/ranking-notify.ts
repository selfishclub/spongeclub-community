import { createAdminClient } from "./supabase";
import { getSlackClient } from "./slack";

const RANKING_NOTIFY_CHANNEL = "C0B19KV8538";

type RankEntry = {
  rank: number;
  id: string;
  name: string;
  total: number;
};

// 개인 누적 랭킹 Top 10 계산
async function computeIndividualRanking(): Promise<RankEntry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("shell_transactions")
    .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin)");

  const aggregated = new Map<string, { id: string; name: string; total: number }>();

  for (const row of data || []) {
    const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean };
    if (!member.is_active || member.is_admin) continue;
    if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

    const existing = aggregated.get(row.member_id);
    const absAmount = Math.abs(row.amount);
    if (existing) {
      existing.total += absAmount;
    } else {
      aggregated.set(row.member_id, {
        id: row.member_id,
        name: member.name,
        total: absAmount,
      });
    }
  }

  return Array.from(aggregated.values())
    .filter((m) => m.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((m, i) => ({ rank: i + 1, ...m }));
}

// 조별 누적 랭킹 계산
async function computeGroupRanking(): Promise<RankEntry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("shell_transactions")
    .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, group_number)");

  const memberTotals = new Map<string, { group_number: number; total: number }>();

  for (const row of data || []) {
    const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; group_number: number | null };
    if (!member.is_active || member.is_admin || !member.group_number) continue;
    if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;

    const existing = memberTotals.get(row.member_id);
    const absAmount = Math.abs(row.amount);
    if (existing) {
      existing.total += absAmount;
    } else {
      memberTotals.set(row.member_id, {
        group_number: member.group_number,
        total: absAmount,
      });
    }
  }

  const groupTotals = new Map<number, { group_number: number; total: number }>();
  for (const { group_number, total } of memberTotals.values()) {
    const existing = groupTotals.get(group_number);
    if (existing) {
      existing.total += total;
    } else {
      groupTotals.set(group_number, { group_number, total });
    }
  }

  return Array.from(groupTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((g, i) => ({
      rank: i + 1,
      id: `group-${g.group_number}`,
      name: `${g.group_number}조`,
      total: g.total,
    }));
}

// 스냅샷 저장/조회
async function getSnapshot(type: string): Promise<RankEntry[] | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ranking_snapshots")
    .select("rankings")
    .eq("type", type)
    .single();

  if (!data) return null;
  const raw = data.rankings;
  // 과거에 JSON.stringify 로 이중 인코딩되어 저장된 데이터 호환 처리
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as RankEntry[];
    } catch {
      return null;
    }
  }
  return raw as RankEntry[];
}

async function saveSnapshot(type: string, rankings: RankEntry[]) {
  const supabase = createAdminClient();
  await supabase
    .from("ranking_snapshots")
    .upsert(
      { type, rankings, updated_at: new Date().toISOString() },
      { onConflict: "type" }
    );
}

// 랭킹 변동 감지 + Slack 알림
function detectChanges(oldRanking: RankEntry[], newRanking: RankEntry[]): string[] {
  const changes: string[] = [];

  const oldMap = new Map(oldRanking.map((r) => [r.id, r.rank]));
  const newMap = new Map(newRanking.map((r) => [r.id, r.rank]));

  for (const entry of newRanking) {
    const oldRank = oldMap.get(entry.id);
    if (oldRank === undefined) {
      // 새로 Top 10 진입
      changes.push(`${entry.name}님이 ${entry.rank}위에 새로 진입!`);
    } else if (oldRank !== entry.rank) {
      const diff = oldRank - entry.rank;
      if (diff > 0) {
        changes.push(`${entry.name}님이 ${oldRank}위 → ${entry.rank}위로 상승!`);
      } else {
        changes.push(`${entry.name}님이 ${oldRank}위 → ${entry.rank}위로 하락`);
      }
    }
  }

  // Top 10에서 밀려난 경우
  for (const entry of oldRanking) {
    if (!newMap.has(entry.id)) {
      changes.push(`${entry.name}님이 Top 10에서 이탈`);
    }
  }

  return changes;
}

// 메인: 랭킹 변동 체크 후 Slack 알림
export async function checkAndNotifyRankingChanges() {
  try {
    const [individualRanking, groupRanking] = await Promise.all([
      computeIndividualRanking(),
      computeGroupRanking(),
    ]);

    const [oldIndividual, oldGroup] = await Promise.all([
      getSnapshot("individual"),
      getSnapshot("group"),
    ]);

    const messages: string[] = [];

    if (oldIndividual) {
      const individualChanges = detectChanges(oldIndividual, individualRanking);
      if (individualChanges.length > 0) {
        messages.push("*🏆 개인 누적 랭킹 변동*\n" + individualChanges.map((c) => `• ${c}`).join("\n"));
      }
    }

    if (oldGroup) {
      const groupChanges = detectChanges(oldGroup, groupRanking);
      if (groupChanges.length > 0) {
        messages.push("*🏆 조별 누적 랭킹 변동*\n" + groupChanges.map((c) => `• ${c}`).join("\n"));
      }
    }

    // 스냅샷 업데이트
    await Promise.all([
      saveSnapshot("individual", individualRanking),
      saveSnapshot("group", groupRanking),
    ]);

    // 변동이 있으면 Slack 알림
    if (messages.length > 0) {
      const slackClient = getSlackClient();
      await slackClient.chat.postMessage({
        channel: RANKING_NOTIFY_CHANNEL,
        text: messages.join("\n\n"),
      });
    }
  } catch (e) {
    console.error("[랭킹 알림] 오류:", e);
  }
}
