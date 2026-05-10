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

// 조별 누적 랭킹 계산 (1인 평균 기준 — 조별 인원수 차이 보정)
async function computeGroupRanking(): Promise<RankEntry[]> {
  const supabase = createAdminClient();

  // 조별 로스터 인원
  const { data: roster } = await supabase
    .from("members")
    .select("group_number")
    .eq("is_active", true)
    .eq("is_admin", false)
    .not("group_number", "is", null);

  const rosterCount = new Map<number, number>();
  for (const r of roster || []) {
    const n = r.group_number as number;
    rosterCount.set(n, (rosterCount.get(n) || 0) + 1);
  }

  // 거래 합산
  const { data } = await supabase
    .from("shell_transactions")
    .select("member_id, amount, reason_detail, members!shell_transactions_member_id_fkey(name, is_active, is_admin, group_number)");

  const groupTotals = new Map<number, number>();
  for (const row of data || []) {
    const member = row.members as unknown as { name: string; is_active: boolean; is_admin: boolean; group_number: number | null };
    if (!member.is_active || member.is_admin || !member.group_number) continue;
    if (row.reason_detail?.startsWith("[취소됨]") || row.reason_detail?.startsWith("[취소]")) continue;
    groupTotals.set(member.group_number, (groupTotals.get(member.group_number) || 0) + Math.abs(row.amount));
  }

  // 활동 0 인 조도 포함되도록 로스터로 보강
  for (const [n] of rosterCount) {
    if (!groupTotals.has(n)) groupTotals.set(n, 0);
  }

  return Array.from(groupTotals.entries())
    .map(([group_number, total]) => {
      const count = rosterCount.get(group_number) || 0;
      const avg = count > 0 ? total / count : 0;
      return { group_number, total, avg };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)
    .map((g, i) => ({
      rank: i + 1,
      id: `group-${g.group_number}`,
      name: `${g.group_number}조`,
      total: Math.round(g.avg * 10) / 10, // 알림 비교용 — 1인 평균값 저장
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
  const { error } = await supabase
    .from("ranking_snapshots")
    .upsert(
      { type, rankings, updated_at: new Date().toISOString() },
      { onConflict: "type" }
    );
  if (error) {
    console.error(`[ranking-notify] saveSnapshot(${type}) 실패:`, error);
  } else {
    console.log(`[ranking-notify] saveSnapshot(${type}) OK (${rankings.length}건)`);
  }
}

// 랭킹 변동 감지 — Top 3 에 영향이 있는 변동만 추출
// (Top 3 내부 변동, Top 3 신규 진입, Top 3 이탈)
const TOP_N = 3;

function detectChanges(oldRanking: RankEntry[], newRanking: RankEntry[]): string[] {
  const changes: string[] = [];

  const oldMap = new Map(oldRanking.map((r) => [r.id, r.rank]));
  const newMap = new Map(newRanking.map((r) => [r.id, r.rank]));
  const nameMap = new Map<string, string>();
  for (const r of [...oldRanking, ...newRanking]) nameMap.set(r.id, r.name);

  const allIds = new Set<string>([...oldMap.keys(), ...newMap.keys()]);

  for (const id of allIds) {
    const oldRank = oldMap.get(id);
    const newRank = newMap.get(id);

    // 순위 변동 없음
    if (oldRank === newRank) continue;

    const wasInTop = oldRank !== undefined && oldRank <= TOP_N;
    const isInTop = newRank !== undefined && newRank <= TOP_N;

    // Top 3 와 무관한 변동은 무시 (예: 5→4, 8→7, 11→4 등)
    if (!wasInTop && !isInTop) continue;

    const name = nameMap.get(id) || "(알 수 없음)";

    if (oldRank === undefined) {
      // 순위권 밖에서 Top 3 안으로 신규 진입
      changes.push(`${name}님이 ${newRank}위에 새로 진입!`);
    } else if (newRank === undefined) {
      // Top 3 였다가 순위권(Top 10) 밖으로 이탈
      changes.push(`${name}님이 ${oldRank}위에서 순위권 이탈`);
    } else if (newRank < oldRank) {
      changes.push(`${name}님이 ${oldRank}위 → ${newRank}위로 상승!`);
    } else {
      changes.push(`${name}님이 ${oldRank}위 → ${newRank}위로 하락`);
    }
  }

  return changes;
}

// 메인: 랭킹 변동 체크 후 Slack 알림
export async function checkAndNotifyRankingChanges() {
  console.log("[ranking-notify] 시작");
  try {
    const [individualRanking, groupRanking] = await Promise.all([
      computeIndividualRanking(),
      computeGroupRanking(),
    ]);
    console.log(`[ranking-notify] 계산 완료 — 개인 ${individualRanking.length} / 조 ${groupRanking.length}`);

    const [oldIndividual, oldGroup] = await Promise.all([
      getSnapshot("individual"),
      getSnapshot("group"),
    ]);
    console.log(`[ranking-notify] 이전 스냅샷 로드 — 개인 ${oldIndividual?.length ?? "null"} / 조 ${oldGroup?.length ?? "null"}`);

    const messages: string[] = [];

    if (oldIndividual) {
      const individualChanges = detectChanges(oldIndividual, individualRanking);
      console.log(`[ranking-notify] 개인 변동 ${individualChanges.length}건`);
      if (individualChanges.length > 0) {
        messages.push("*🏆 개인 누적 랭킹 변동*\n" + individualChanges.map((c) => `• ${c}`).join("\n"));
      }
    }

    if (oldGroup) {
      const groupChanges = detectChanges(oldGroup, groupRanking);
      console.log(`[ranking-notify] 조 변동 ${groupChanges.length}건`);
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
      console.log(`[ranking-notify] Slack 발송 시도 → ${RANKING_NOTIFY_CHANNEL}`);
      const slackClient = getSlackClient();
      const result = await slackClient.chat.postMessage({
        channel: RANKING_NOTIFY_CHANNEL,
        text: messages.join("\n\n"),
      });
      console.log(`[ranking-notify] Slack 발송 결과: ok=${result.ok} ts=${result.ts}`);
    } else {
      console.log("[ranking-notify] 변동 없음 — Slack 미발송");
    }
    console.log("[ranking-notify] 종료");
  } catch (e) {
    console.error("[ranking-notify] 오류:", e);
    throw e;
  }
}
