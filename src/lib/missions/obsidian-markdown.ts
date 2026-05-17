/**
 * 옵시디언 마크다운 → HTML 렌더링.
 *
 * aaa-homepage(spongeclub_homepage)의 data.ts 변환 로직을 이식.
 * 차이점: aaa-homepage 는 vault 를 로컬 디스크에서 읽지만 여기서는
 *        GitHub API 로 읽으므로 이미지 인덱스를 git tree API 로 빌드한다.
 *
 * 마크다운 → HTML 변환은 GitHub Markdown API(`POST /markdown`)를 사용한다.
 * (npm 의존성 추가 없이 GFM 렌더링 — 기존 vault-fetcher 의 GitHub API 패턴 재사용)
 */

const VAULT_REPO = "spongeclub/spongeclub_1";
const REVALIDATE_SECONDS = 300; // 5분
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.VAULT_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** vault 상대경로 → raw.githubusercontent URL (세그먼트별 인코딩) */
function rawGithubUrl(relPath: string): string {
  const segments = relPath.split("/").map((s) => encodeURIComponent(s));
  return `https://raw.githubusercontent.com/${VAULT_REPO}/main/${segments.join(
    "/",
  )}`;
}

/** frontmatter 블록 제거 */
export function stripFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/** 마크다운 본문에서 첫 H1 추출 */
export function extractFirstHeading(md: string): string | undefined {
  const m = md.match(/^#\s+(.+)$/m);
  return m?.[1].trim();
}

/** 옵시디언 콜아웃(`> [!type] ...`) 블록 통째 제거 */
function stripCallouts(md: string): string {
  return md.replace(
    /^[ \t]*>[ \t]*\[![\w-]+\][+-]?[^\n]*(?:\n[ \t]*>[^\n]*)*\n?/gm,
    "",
  );
}

/** `![[file]]` 이미지 임베드 → 표준 마크다운 이미지 */
function rewriteWikilinkImages(
  md: string,
  imageIndex: Map<string, string>,
): string {
  return md.replace(/!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, (_m, raw) => {
    const filename = String(raw).trim();
    if (!IMAGE_EXT.test(filename)) return "";
    const rel = imageIndex.get(filename);
    return rel ? `![${filename}](${rawGithubUrl(rel)})` : "";
  });
}

/** 일반 wikilink(`[[note]]`) → 평문 (사이트에 해당 노트 페이지 없음) */
function rewriteWikilinkNotes(md: string): string {
  return md.replace(
    /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
    (_m, target, alias) => String(alias || target),
  );
}

/** vault 전체 이미지 파일 인덱스: 파일명 → 레포 상대경로 */
async function buildImageIndex(): Promise<Map<string, string>> {
  const index = new Map<string, string>();
  try {
    const res = await fetch(
      `https://api.github.com/repos/${VAULT_REPO}/git/trees/main?recursive=1`,
      { headers: authHeaders(), next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return index;
    const data = (await res.json()) as {
      tree?: { path: string; type: string }[];
    };
    for (const item of data.tree ?? []) {
      if (item.type !== "blob" || !IMAGE_EXT.test(item.path)) continue;
      const base = item.path.split("/").pop();
      if (base && !index.has(base)) index.set(base, item.path);
    }
  } catch {
    /* 이미지 인덱스 실패 시 이미지 없는 채로 렌더 */
  }
  return index;
}

/** 옵시디언 마크다운 → 표준 마크다운 (콜아웃 제거 + wikilink 변환) */
export async function transformObsidianMarkdown(md: string): Promise<string> {
  const imageIndex = await buildImageIndex();
  let out = stripCallouts(stripFrontmatter(md));
  out = rewriteWikilinkImages(out, imageIndex);
  out = rewriteWikilinkNotes(out);
  return out;
}

/** GitHub Markdown API 로 마크다운 → HTML (GFM) */
export async function renderMarkdownToHtml(md: string): Promise<string> {
  const res = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ text: md, mode: "gfm", context: VAULT_REPO }),
  });
  if (!res.ok) {
    throw new Error(`GitHub Markdown API ${res.status}`);
  }
  return await res.text();
}
