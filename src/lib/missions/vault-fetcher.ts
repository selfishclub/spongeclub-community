/**
 * Vault (spongeclub/spongeclub_1) → /missions 데이터 가져오기
 *
 * 멤버가 vault에 push한 미션 노트를 GitHub API로 직접 읽어서
 * /missions 페이지의 진척 매트릭스에 노출.
 *
 * 캐시: Next.js fetch revalidate 300초 (5분).
 *       vault에 push 후 최대 5분 안에 사이트에 반영.
 *
 * 인증: vault repo가 PUBLIC이라 token 없어도 동작하지만,
 *       rate limit이 60/hr(unauthenticated) → 5,000/hr(authenticated).
 *       Vercel env var `VAULT_GITHUB_TOKEN`을 설정하면 자동 적용.
 */

import {
  parseFrontmatter,
  extractDisplayName,
  type Frontmatter,
} from "./parse-frontmatter";
import type { MissionSubmission, TeamProgress } from "./types";

const VAULT_REPO = "spongeclub/spongeclub_1";
const API_BASE = `https://api.github.com/repos/${VAULT_REPO}`;
const REVALIDATE_SECONDS = 300; // 5분

type GhContentItem = {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  download_url: string | null;
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.VAULT_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function ghFetch(path: string): Promise<GhContentItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/contents/${path}`, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as GhContentItem[]) : null;
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * 한 조의 미션 파일 frontmatter를 모두 fetch하고 진척 집계.
 */
export async function getTeamProgress(
  weekFolder: string,
  team: string,
): Promise<TeamProgress> {
  const items = await ghFetch(
    `02_mission/${encodeURIComponent(weekFolder)}/${encodeURIComponent(team)}`,
  );

  if (!items) {
    return { team, submittedCount: 0, totalCount: 0, members: [] };
  }

  // *_submit.md 파일만 미션 노트로 인정
  const submitFiles = items.filter(
    (f) =>
      f.type === "file" &&
      f.name.endsWith("_submit.md") &&
      f.download_url !== null,
  );

  const submissions = await Promise.all(
    submitFiles.map((f) => parseSubmissionFile(f, team)),
  );

  // 닉네임 기준 정렬 (조장 먼저)
  submissions.sort((a, b) => {
    if (a.role === "조장" && b.role !== "조장") return -1;
    if (b.role === "조장" && a.role !== "조장") return 1;
    return a.displayName.localeCompare(b.displayName, "ko");
  });

  return {
    team,
    submittedCount: submissions.filter((s) => s.submitted).length,
    totalCount: submissions.length,
    members: submissions,
  };
}

async function parseSubmissionFile(
  file: GhContentItem,
  fallbackTeam: string,
): Promise<MissionSubmission> {
  const content = file.download_url
    ? await fetchText(file.download_url)
    : null;
  const fm: Frontmatter = content ? parseFrontmatter(content) : {};

  const member = String(fm.member ?? extractMemberFromFilename(file.name));

  return {
    team: String(fm.team ?? fallbackTeam),
    member,
    displayName: extractDisplayName(member),
    role: fm.role ? String(fm.role) : undefined,
    week: typeof fm.week === "number" ? fm.week : 0,
    submitted: fm.submitted === true,
    filePath: file.path,
  };
}

/**
 * "4조_다다(김다솔)_1주차_submit.md" → "다다(김다솔)"
 * frontmatter 누락 시 백업용.
 */
function extractMemberFromFilename(fileName: string): string {
  // 1) 확장자 제거
  const noExt = fileName.replace(/\.md$/i, "");
  // 2) "_N주차_submit" 또는 "_NN_OT_submit" 등 뒷부분 제거
  const cleaned = noExt.replace(
    /_\d+(주차|주|N)?_submit$|_\d{2}_OT_submit$/,
    "",
  );
  // 3) "조N_" 접두사 제거
  const m = cleaned.match(/^\d+조_(.+)$/);
  return m ? m[1] : cleaned;
}

/**
 * 6개 조의 진척을 병렬로 가져옴.
 */
export async function getAllTeamsProgress(
  weekFolder: string,
): Promise<TeamProgress[]> {
  const teams = ["1조", "2조", "3조", "4조", "5조", "6조"];
  return Promise.all(teams.map((t) => getTeamProgress(weekFolder, t)));
}

/**
 * (deprecated) 하드코딩 fallback.
 *
 * 새 코드는 `schedule-parser.ts`의 `getAllWeeks()` → `getCurrentWeek()`를
 * 호출해 vault `99_meta/주차일정.md` 기반으로 오늘 날짜에 맞는 주차를
 * 동적으로 결정한다. 이 함수는 schedule-parser fetch가 실패했을 때의
 * 최후 fallback이며, 새 호출자는 사용하지 말 것.
 */
export function getCurrentWeekFolder(): string {
  return "1주차_0510";
}
