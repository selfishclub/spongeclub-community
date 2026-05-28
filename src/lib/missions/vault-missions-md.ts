/**
 * Vault `_missions.md` 파서 — 어드민이 vault에 작성한 미션 목록을
 * /missions hero 에 그대로 노출하기 위한 소스.
 *
 * 파일 위치: `02_mission/{weekFolder}/_missions.md`
 * 라인 패턴: `- **미션N**: TITLE`
 *
 * Supabase missions_weeks 의 missions 필드 대신 사용. replayUrl / transcriptUrl /
 * published 등 운영자가 어드민에서 조정하는 항목은 그대로 Supabase 를 쓴다.
 */

import type { MissionTitle } from "./weeks-repo";

const VAULT_REPO = "spongeclub/spongeclub_1";
const REVALIDATE_SECONDS = 300;

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = process.env.VAULT_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getMissionsFromVault(
  weekFolder: string,
): Promise<MissionTitle[]> {
  const url = `https://raw.githubusercontent.com/${VAULT_REPO}/main/02_mission/${encodeURIComponent(
    weekFolder,
  )}/_missions.md`;

  let md = "";
  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    md = await res.text();
  } catch {
    return [];
  }

  return parseMissionsMarkdown(md);
}

/**
 * `- **미션N**: TITLE` 라인을 추출. 들여쓰기/하위 설명 bullet 은 무시.
 */
export function parseMissionsMarkdown(md: string): MissionTitle[] {
  const result: MissionTitle[] = [];
  const re = /^-\s+\*\*미션\s*(\d+)\s*\*\*\s*:\s*(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const index = parseInt(m[1], 10);
    const title = m[2].trim();
    if (Number.isFinite(index) && title) {
      result.push({ index, title });
    }
  }
  result.sort((a, b) => a.index - b.index);
  return result;
}
