/**
 * 미션 노트 단건 조회 — filePath 로 vault 원문을 가져와 HTML 로 렌더.
 *
 * 사용처: `/api/missions/note` 라우트 → MemberNoteModal.
 * vault 원문은 raw.githubusercontent 에서 직접 받는다(공개 레포, rate limit 없음).
 * 마크다운 변환·렌더는 obsidian-markdown.ts 가 담당.
 */
import {
  transformObsidianMarkdown,
  renderMarkdownToHtml,
  stripFrontmatter,
  extractFirstHeading,
} from "./obsidian-markdown";

const VAULT_REPO = "spongeclub/spongeclub_1";
const REVALIDATE_SECONDS = 300; // 5분

// 본문에 이미지가 통째로 박힌 초대형 노트 가드.
// 이 한도를 넘으면 GitHub Markdown API 호출을 건너뛰고 안내 문구를 보여준다
// (GitHub fetch 캐시도 2MB 초과분은 캐싱 불가 + 모달 가독성도 떨어짐).
const MAX_RENDER_CHARS = 1_000_000; // ~1MB

export type RenderedNote = {
  html: string;
  title: string;
  githubUrl: string;
};

/** filePath 검증: `02_mission` 하위 `.md` 파일만 허용 (경로 탈출 차단) */
export function isValidNotePath(filePath: string): boolean {
  return (
    filePath.startsWith("02_mission/") &&
    filePath.endsWith(".md") &&
    !filePath.includes("..")
  );
}

/** 레포 상대경로 → GitHub blob(원본 보기) URL */
function blobUrl(filePath: string): string {
  const segs = filePath.split("/").map((s) => encodeURIComponent(s));
  return `https://github.com/${VAULT_REPO}/blob/main/${segs.join("/")}`;
}

/** vault 원문 마크다운 fetch */
async function fetchRawMarkdown(filePath: string): Promise<string | null> {
  const segs = filePath.split("/").map((s) => encodeURIComponent(s));
  const url = `https://raw.githubusercontent.com/${VAULT_REPO}/main/${segs.join(
    "/",
  )}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** filePath 의 미션 노트를 가져와 HTML 로 렌더한 결과 반환 */
export async function getRenderedNote(
  filePath: string,
): Promise<RenderedNote | null> {
  if (!isValidNotePath(filePath)) return null;

  const raw = await fetchRawMarkdown(filePath);
  if (raw == null) return null;

  const title =
    extractFirstHeading(stripFrontmatter(raw)) ??
    (filePath.split("/").pop() ?? "미션 노트").replace(/\.md$/, "");
  const githubUrl = blobUrl(filePath);

  // 초대형 노트는 렌더하지 않고 안내 문구만 반환
  if (raw.length > MAX_RENDER_CHARS) {
    return {
      title,
      githubUrl,
      html:
        "<p>이 노트는 용량이 커서(본문에 이미지가 포함된 것 같아요) " +
        "미리보기를 제공하지 않아요. 아래 “GitHub에서 원본 보기”로 확인해 주세요.</p>",
    };
  }

  // 노트 디렉토리를 넘겨 본문 내 상대경로 이미지(`![](attachments/..)`)를
  // vault raw URL 로 정확히 해석한다.
  const noteDir = filePath.split("/").slice(0, -1).join("/");
  const transformed = await transformObsidianMarkdown(raw, noteDir);
  const html = await renderMarkdownToHtml(transformed);

  return { html, title, githubUrl };
}
