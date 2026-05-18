/**
 * 미션 제출자 일괄 셸 지급.
 *
 * vault 의 주차별 제출자(frontmatter `submitted: true`)를 Supabase `members`
 * 와 이름으로 매칭해, 매칭된 멤버에게 +1셸을 일괄 지급한다.
 *
 * 안전장치:
 *  - 매칭은 이름 기반이라 100% 보장 안 됨 → 어드민이 미리보기(buildGrantPreview)로
 *    매칭/미매칭 결과를 확인한 뒤 실행(executeGrant)한다.
 *  - 멱등성: 지급 트랜잭션의 reason_detail 마커로 이미 지급된 멤버는 건너뛴다.
 *    (중복 실행해도 두 번 지급되지 않음)
 *
 * 셸 지급은 shell_transactions insert + increment_shell_balance RPC 로,
 * shell-service 의 동작과 동일하게 처리한다(트랜잭션이 source of truth).
 */
import { createAdminClient } from "@/lib/supabase";
import { getAllTeamsProgress } from "./vault-fetcher";

const SHELL_PER_SUBMITTER = 1;
const GRANT_REASON = "ADMIN_ADJUSTMENT";

/** 주차별 유일한 지급 마커 — reason_detail 에 저장, 멱등성 판단 기준 */
function grantMarker(weekFolder: string): string {
  return `과제 제출 보상 · ${weekFolder}`;
}

type MemberRow = { id: string; name: string };

export type MatchedSubmitter = {
  team: string;
  vaultMember: string; // vault 원본 ("다다(김다솔)")
  displayName: string; // "다다"
  memberId: string;
  memberName: string; // members.name
  alreadyGranted: boolean;
};

export type UnmatchedSubmitter = {
  team: string;
  vaultMember: string;
  displayName: string;
  reason: "NOT_FOUND" | "AMBIGUOUS";
};

export type GrantPreview = {
  weekFolder: string;
  marker: string;
  shellPerSubmitter: number;
  submitterCount: number;
  matched: MatchedSubmitter[];
  unmatched: UnmatchedSubmitter[];
  alreadyGrantedCount: number;
  grantableCount: number; // matched 중 아직 지급 안 된 수
};

export type GrantResult = {
  granted: number;
  skipped: number; // 이미 지급됨
  failed: { memberName: string; error: string }[];
};

function norm(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

/** "다다(김다솔)" → ["다다(김다솔)", "다다", "김다솔"] · "박경선" → ["박경선"] */
function nameKeys(raw: string): string[] {
  const keys = new Set<string>();
  const trimmed = raw.trim();
  if (trimmed) keys.add(norm(trimmed));
  const m = trimmed.match(/^(.*?)\(([^)]+)\)\s*$/);
  if (m) {
    if (m[1].trim()) keys.add(norm(m[1]));
    if (m[2].trim()) keys.add(norm(m[2]));
  }
  return [...keys];
}

/** 주차 제출자 목록 (submitted=true 만) */
async function getSubmitters(
  weekFolder: string,
): Promise<{ team: string; member: string; displayName: string }[]> {
  const teams = await getAllTeamsProgress(weekFolder);
  const out: { team: string; member: string; displayName: string }[] = [];
  for (const t of teams) {
    for (const m of t.members) {
      if (m.submitted) {
        out.push({ team: m.team, member: m.member, displayName: m.displayName });
      }
    }
  }
  return out;
}

async function getAllMembers(): Promise<MemberRow[]> {
  const sb = createAdminClient();
  const { data, error } = await sb.from("members").select("id, name");
  if (error || !data) return [];
  return data as MemberRow[];
}

/** 이미 이 주차 지급을 받은 member_id 집합 */
async function getGrantedMemberIds(marker: string): Promise<Set<string>> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("shell_transactions")
    .select("member_id")
    .eq("reason", GRANT_REASON)
    .eq("reason_detail", marker);
  const set = new Set<string>();
  if (!error && data) {
    for (const r of data as { member_id: string }[]) set.add(r.member_id);
  }
  return set;
}

/**
 * 지급 미리보기 — 제출자 ↔ members 매칭 결과.
 */
export async function buildGrantPreview(
  weekFolder: string,
): Promise<GrantPreview> {
  const marker = grantMarker(weekFolder);
  const [submitters, members, grantedIds] = await Promise.all([
    getSubmitters(weekFolder),
    getAllMembers(),
    getGrantedMemberIds(marker),
  ]);

  // members 이름 인덱스 (정규화 키 → 멤버들)
  const index = new Map<string, MemberRow[]>();
  for (const mem of members) {
    for (const k of nameKeys(mem.name)) {
      const arr = index.get(k) ?? [];
      arr.push(mem);
      index.set(k, arr);
    }
  }

  const matched: MatchedSubmitter[] = [];
  const unmatched: UnmatchedSubmitter[] = [];

  for (const s of submitters) {
    const candidates = new Map<string, MemberRow>();
    for (const k of nameKeys(s.member)) {
      for (const mem of index.get(k) ?? []) candidates.set(mem.id, mem);
    }
    const list = [...candidates.values()];

    if (list.length === 1) {
      matched.push({
        team: s.team,
        vaultMember: s.member,
        displayName: s.displayName,
        memberId: list[0].id,
        memberName: list[0].name,
        alreadyGranted: grantedIds.has(list[0].id),
      });
    } else {
      unmatched.push({
        team: s.team,
        vaultMember: s.member,
        displayName: s.displayName,
        reason: list.length === 0 ? "NOT_FOUND" : "AMBIGUOUS",
      });
    }
  }

  const alreadyGrantedCount = matched.filter((m) => m.alreadyGranted).length;

  return {
    weekFolder,
    marker,
    shellPerSubmitter: SHELL_PER_SUBMITTER,
    submitterCount: submitters.length,
    matched,
    unmatched,
    alreadyGrantedCount,
    grantableCount: matched.length - alreadyGrantedCount,
  };
}

/** 멤버 한 명에게 셸 지급 (트랜잭션 기록 + 잔고 증가) */
async function grantOne(
  memberId: string,
  marker: string,
): Promise<{ ok: boolean; error?: string }> {
  const sb = createAdminClient();

  const { error: txError } = await sb.from("shell_transactions").insert({
    member_id: memberId,
    amount: SHELL_PER_SUBMITTER,
    reason: GRANT_REASON,
    reason_detail: marker,
    created_by: null,
  });
  if (txError) return { ok: false, error: txError.message };

  // 잔고는 캐시 — RPC 실패해도 트랜잭션이 source of truth (어드민 재계산 가능)
  const { error: rpcError } = await sb.rpc("increment_shell_balance", {
    p_member_id: memberId,
    p_amount: SHELL_PER_SUBMITTER,
  });
  if (rpcError) {
    console.error("[shell-grant] increment_shell_balance 실패:", rpcError);
  }
  return { ok: true };
}

/**
 * 일괄 지급 실행 — 매칭됐고 아직 지급 안 된 멤버에게만 +1셸.
 * 멱등: 이미 지급된 멤버는 건너뛴다.
 */
export async function executeGrant(weekFolder: string): Promise<GrantResult> {
  const preview = await buildGrantPreview(weekFolder);
  const result: GrantResult = { granted: 0, skipped: 0, failed: [] };

  for (const m of preview.matched) {
    if (m.alreadyGranted) {
      result.skipped++;
      continue;
    }
    const r = await grantOne(m.memberId, preview.marker);
    if (r.ok) result.granted++;
    else result.failed.push({ memberName: m.memberName, error: r.error ?? "unknown" });
  }

  return result;
}
