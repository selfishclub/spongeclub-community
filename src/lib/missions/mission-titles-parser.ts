/**
 * vault의 각 주차 폴더 안 `_missions.md` 파서.
 *
 * 본문 형식:
 *   - **미션 1**: claude code 로 인터뷰스킬 사용해서 인터뷰 까지 진행
 *   - **미션 2**: 따라해보고 싶은 개인/업무/삶 OS 따라서 만들어보기 ...
 *   - **미션 3**: AI 도움 없이 1주차 SNS 글 작성 - 링크드인/인스타그램
 *
 * frontmatter (선택):
 *   ---
 *   week: 1
 *   replay_url: https://www.youtube.com/watch?v=...   ← 주차별 다시보기 링크
 *   ---
 *
 * 운영진이 `/set-missions` 슬래시 명령 또는 직접 편집으로 이 파일을 갱신하면
 * 사이트의 3번 섹션(이번주 미션)이 자동 반영된다.
 */

import { parseFrontmatter } from "./parse-frontmatter";

const VAULT_REPO = "spongeclub/spongeclub_1";
const REVALIDATE_SECONDS = 300; // 5분

export type Mission = {
  index: number; // 1, 2, 3, ...
  title: string;
};

export type WeekMeta = {
  missions: Mission[];
  replayUrl: string | null; // 주차 세션 다시보기 URL (없으면 null)
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = process.env.VAULT_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * 주차 폴더의 _missions.md를 fetch하고 미션 제목 + replay_url 반환.
 * 파일이 없거나 파싱 실패 시 빈 결과.
 */
export async function getWeekMeta(weekFolder: string): Promise<WeekMeta> {
  const url = `https://raw.githubusercontent.com/${VAULT_REPO}/main/02_mission/${encodeURIComponent(weekFolder)}/_missions.md`;

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return { missions: [], replayUrl: null };
    const md = await res.text();
    const missions = parseMissionTitles(md);
    const replayUrl = extractReplayUrl(md);
    return { missions, replayUrl };
  } catch {
    return { missions: [], replayUrl: null };
  }
}

/**
 * frontmatter의 `replay_url` 값을 안전하게 추출.
 * 빈 문자열·잘못된 형식이면 null.
 */
function extractReplayUrl(md: string): string | null {
  const fm = parseFrontmatter(md);
  const v = fm.replay_url;
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  // 최소한 http(s) 또는 youtu.be 같은 URL인지 확인
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes("youtu")) return null;
  return trimmed;
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
