/**
 * Vault(spongeclub/spongeclub_1) → /skills 데이터 가져오기
 *
 * `06_unit/데굴데굴/스킬인사이트/skills_md/skill_*.md` 16개의 큐레이션 노트를
 * GitHub API로 직접 읽어 CuratedSkill 모델로 변환한다.
 *
 * 캐시: revalidate 300초 (5분). vault push 후 최대 5분 안에 반영.
 * 인증: vault repo가 public이라 토큰 없어도 동작. rate limit 60/hr.
 *       Vercel env `VAULT_GITHUB_TOKEN` 설정하면 5,000/hr.
 */

import type { CuratedSkill, CuratedQuote } from "./types";

const VAULT_REPO = "spongeclub/spongeclub_1";
const API_BASE = `https://api.github.com/repos/${VAULT_REPO}`;
const SKILLS_PATH = "06_unit/데굴데굴/스킬인사이트/skills_md";
const REVALIDATE_SECONDS = 300;

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

async function listSkillFiles(): Promise<GhContentItem[]> {
  try {
    const res = await fetch(`${API_BASE}/contents/${encodeURI(SKILLS_PATH)}`, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as GhContentItem[];
    return Array.isArray(data)
      ? data.filter((it) => it.type === "file" && it.name.endsWith(".md"))
      : [];
  } catch {
    return [];
  }
}

// ─── frontmatter 파서 (skill md 전용) ───────────────────────────────
function parseFrontmatter(text: string): {
  fm: Record<string, string | string[]>;
  body: string;
} {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const fmText = m[1];
  const body = m[2];
  const fm: Record<string, string | string[]> = {};
  const lines = fmText.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    i++;
    if (line.trim().startsWith("#")) continue;
    if (line.trim() === "") continue;
    const kv = line.match(/^([a-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const val = kv[2].trim();
    if (val === "") {
      const arr: string[] = [];
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        arr.push(
          lines[i]
            .replace(/^\s+-\s+/, "")
            .trim()
            .replace(/^["']|["']$/g, ""),
        );
        i++;
      }
      if (arr.length > 0) fm[key] = arr;
    } else if (val.startsWith("[") && val.endsWith("]")) {
      fm[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      fm[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return { fm, body };
}

function toArr(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function toStr(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.join(", ");
  return typeof v === "string" ? v : "";
}

// 본문의 `> "내용" — 작성자` 패턴에서 인용 추출
function extractQuotes(body: string): CuratedQuote[] {
  const out: CuratedQuote[] = [];
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith(">")) continue;
    const text = line.replace(/^>\s*/, "").trim();
    if (!text) continue;
    const m = text.match(/^["“"]?(.+?)["”"]?\s*[—–-]\s*(.+)$/);
    if (m) {
      out.push({ quote: m[1].trim(), author: m[2].trim() });
    } else {
      out.push({
        quote: text.replace(/^["“"]|["”"]$/g, "").trim(),
        author: "",
      });
    }
  }
  return out;
}

function computeUserCount(authors: string[], inspiredBy: string): number {
  if (authors.length > 0) return authors.length;
  const m = inspiredBy.match(/(\d+)\s*명/);
  return m ? parseInt(m[1], 10) : 0;
}

function mdToSkill(slug: string, raw: string): CuratedSkill {
  const { fm, body } = parseFrontmatter(raw);
  const authors = toArr(fm.author);
  const inspiredBy = toStr(fm.inspired_by);
  return {
    slug,
    title: toStr(fm.title) || slug,
    skillName: toStr(fm.skill_name),
    summary: toStr(fm.summary),
    authors,
    postType: toStr(fm.post_type),
    type: toStr(fm.type),
    category: toStr(fm.category) || "기타",
    audience: toArr(fm.audience),
    difficulty: toStr(fm.difficulty),
    inspiredBy,
    keywords: toArr(fm.keywords),
    links: toArr(fm.links),
    featured: fm.featured === "true",
    quotes: extractQuotes(body),
    userCount: computeUserCount(authors, inspiredBy),
  };
}

export async function getCuratedSkills(): Promise<CuratedSkill[]> {
  const files = await listSkillFiles();
  if (files.length === 0) return [];
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
  const skills = await Promise.all(
    sorted.map(async (f) => {
      if (!f.download_url) return null;
      const raw = await fetchText(f.download_url);
      if (!raw) return null;
      return mdToSkill(f.name.replace(/\.md$/, ""), raw);
    }),
  );
  return skills.filter((s): s is CuratedSkill => s !== null);
}
