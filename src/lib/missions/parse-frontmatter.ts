/**
 * 가벼운 YAML frontmatter 파서.
 *
 * 미션 노트 frontmatter는 단순한 key: value 라인만 사용하므로
 * 외부 의존성 없이 정규식 기반으로 처리한다.
 *
 * 처리 가능:
 *   team: 4조
 *   member: 다다(김다솔)
 *   role: 조장
 *   week: 1
 *   submitted: true
 *
 * 처리 안 함 (필요해지면 js-yaml 도입):
 *   - 리스트, 중첩 객체
 *   - 멀티라인 값
 */

export type FrontmatterValue = string | number | boolean | null;
export type Frontmatter = Record<string, FrontmatterValue>;

export function parseFrontmatter(markdown: string): Frontmatter {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const result: Frontmatter = {};
  const lines = match[1].split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let raw = line.slice(idx + 1).trim();
    if (!key) continue;

    // 빈 값
    if (raw === "" || raw === "~" || raw === "null") {
      result[key] = null;
      continue;
    }

    // 따옴표 제거
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      raw = raw.slice(1, -1);
    }

    // bool / number 변환
    if (raw === "true") result[key] = true;
    else if (raw === "false") result[key] = false;
    else if (/^-?\d+$/.test(raw)) result[key] = parseInt(raw, 10);
    else if (/^-?\d+\.\d+$/.test(raw)) result[key] = parseFloat(raw);
    else result[key] = raw;
  }

  return result;
}

/**
 * "다다(김다솔)" → "다다"
 * "다다" → "다다"
 * "" → ""
 */
export function extractDisplayName(member: string): string {
  if (!member) return "";
  const idx = member.indexOf("(");
  return (idx === -1 ? member : member.slice(0, idx)).trim();
}
