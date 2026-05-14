/**
 * vault의 각 주차 폴더 안 `_missions.md` 파서.
 *
 * 형식:
 *   - **미션 1**: claude code 로 인터뷰스킬 사용해서 인터뷰 까지 진행
 *   - **미션 2**: 따라해보고 싶은 개인/업무/삶 OS 따라서 만들어보기 ...
 *   - **미션 3**: AI 도움 없이 1주차 SNS 글 작성 - 링크드인/인스타그램
 *
 * 운영진이 `/set-missions` 슬래시 명령으로 이 파일을 갱신하면
 * 사이트의 3번 섹션(이번주 미션)이 자동 반영된다.
 */

const VAULT_REPO = "spongeclub/spongeclub_1";
const REVALIDATE_SECONDS = 300; // 5분

export type Mission = {
  index: number; // 1, 2, 3, ...
  title: string;
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = process.env.VAULT_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * 주차 폴더의 _missions.md를 fetch하고 미션 제목 목록 반환.
 * 파일이 없거나 파싱 실패 시 빈 배열.
 */
export async function getWeekMissions(weekFolder: string): Promise<Mission[]> {
  const url = `https://raw.githubusercontent.com/${VAULT_REPO}/main/02_mission/${encodeURIComponent(weekFolder)}/_missions.md`;

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const md = await res.text();
    return parseMissionTitles(md);
  } catch {
    return [];
  }
}

/**
 * `- **미션 N**: 제목` 패턴을 찾아 리스트로 반환.
 * 본문(미션별 구조 설명 등)에 같은 패턴이 있어도 미션 라인은 첫 등장 순서대로.
 */
export function parseMissionTitles(md: string): Mission[] {
  const missions: Mission[] = [];
  // - **미션 1**: 제목  (콜론은 ASCII : 또는 전각 ：)
  const re = /^[-*]\s+\*\*미션\s*(\d+)\*\*\s*[::]\s*(.+?)\s*$/gm;

  let m: RegExpExecArray | null;
  const seen = new Set<number>();
  while ((m = re.exec(md)) !== null) {
    const idx = parseInt(m[1], 10);
    if (!Number.isFinite(idx) || seen.has(idx)) continue;
    seen.add(idx);
    missions.push({ index: idx, title: m[2].trim() });
  }
  missions.sort((a, b) => a.index - b.index);
  return missions;
}
