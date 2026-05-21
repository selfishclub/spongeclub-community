"use client";

import { useMemo, useRef, useState } from "react";
import type { CuratedSkill, CuratedQuote } from "@/lib/skills/types";

type Props = { skills: CuratedSkill[] };

const CATEGORIES = ["전체", "클로드코드", "콘텐츠마케팅", "개발도구", "생산성"] as const;
const DIFFICULTIES = ["전체", "설치만하면됨", "설정좀필요", "코드만져야함"] as const;
const POST_TYPES = ["전체", "써본후기", "공유"] as const;

const CATEGORY_LABEL: Record<string, string> = {
  전체: "전체",
  클로드코드: "클로드코드",
  콘텐츠마케팅: "콘텐츠·마케팅",
  개발도구: "개발도구",
  생산성: "생산성",
};

const COLOR_BY_CATEGORY: Record<string, { bg: string; fg: string }> = {
  클로드코드: { bg: "#E8F0F9", fg: "#0F4A85" },
  콘텐츠마케팅: { bg: "#F8ECF1", fg: "#7A2A45" },
  개발도구: { bg: "#E8F3EC", fg: "#0D5A3A" },
  생산성: { bg: "#FBF1DE", fg: "#6B4410" },
};
const COLOR_BY_DIFFICULTY: Record<string, { bg: string; fg: string }> = {
  설치만하면됨: { bg: "#E8F3EC", fg: "#0D5A3A" },
  설정좀필요: { bg: "#FBF1DE", fg: "#6B4410" },
  코드만져야함: { bg: "#F8ECF1", fg: "#7A2A45" },
};
const COLOR_BY_POST: Record<string, { bg: string; fg: string }> = {
  써본후기: { bg: "#EEEDFE", fg: "#3C3489" },
  공유: { bg: "#F1EFE8", fg: "#5A584F" },
};
const DEFAULT_COLOR = { bg: "#F1EFE8", fg: "#5A584F" };

function topQuotes(q: CuratedQuote[]): CuratedQuote[] {
  return q.slice(0, 3);
}

function searchHaystack(sk: CuratedSkill): string {
  return [
    sk.skillName,
    sk.title,
    sk.summary,
    sk.inspiredBy,
    sk.authors.join(" "),
    sk.audience.join(" "),
    sk.keywords.join(" "),
    sk.quotes.map((q) => `${q.quote} ${q.author}`).join(" "),
    sk.category,
    sk.difficulty,
    sk.postType,
  ]
    .join(" ")
    .toLowerCase();
}

export function SkillsBoard({ skills }: Props) {
  const [category, setCategory] = useState<string>("전체");
  const [difficulty, setDifficulty] = useState<string>("전체");
  const [postType, setPostType] = useState<string>("전체");
  const [query, setQuery] = useState<string>("");
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sorted = useMemo(() => {
    return [...skills].sort((a, b) => {
      const ar = a.postType === "써본후기" ? 1 : 0;
      const br = b.postType === "써본후기" ? 1 : 0;
      if (ar !== br) return br - ar;
      return (b.userCount || 0) - (a.userCount || 0);
    });
  }, [skills]);

  const haystacks = useMemo(() => {
    const map = new Map<string, string>();
    for (const sk of sorted) map.set(sk.slug, searchHaystack(sk));
    return map;
  }, [sorted]);

  const filtered = useMemo(() => {
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    return sorted.filter((sk) => {
      const hay = haystacks.get(sk.slug) || "";
      const queryOk =
        tokens.length === 0 || tokens.every((t) => hay.includes(t));
      return (
        (category === "전체" || sk.category === category) &&
        (difficulty === "전체" || sk.difficulty === difficulty) &&
        (postType === "전체" || sk.postType === postType) &&
        queryOk
      );
    });
  }, [sorted, haystacks, category, difficulty, postType, query]);

  const total = skills.length;
  const reviewed = skills.filter((s) => s.postType === "써본후기").length;
  const shared = skills.filter((s) => s.postType === "공유").length;

  return (
    <div className="space-y-5">
      {/* ─── 타이틀 ─── */}
      <section className="pt-2 pb-1">
        <div className="text-[11px] text-[#A8A6A0] tracking-wider mb-2">
          스폰지클럽 1기 · 데굴데굴 큐레이션
        </div>
        <h1 className="text-[28px] font-semibold m-0 text-[#15161A] tracking-[-0.02em]">
          스킬 &amp; 인사이트
        </h1>
        <p className="text-sm text-[#73726c] mt-2.5 leading-relaxed tracking-[-0.01em]">
          스폰지들이 직접 써본 스킬과 가이드.{" "}
          <strong className="text-[#15161A] font-semibold">
            &ldquo;누가 발견 → 누가 써봄&rdquo;
          </strong>{" "}
          흐름까지 같이 봐요.
        </p>
        <div className="flex gap-3 mt-4 text-xs text-[#73726c] flex-wrap items-center">
          <span>
            <strong className="text-[#15161A] font-semibold">{total}개</strong>{" "}
            스킬
          </span>
          <span className="text-[#DAD8CF]">·</span>
          <span>
            써본후기{" "}
            <strong className="text-[#15161A] font-semibold">
              {reviewed}건
            </strong>
          </span>
          <span className="text-[#DAD8CF]">·</span>
          <span>
            공유{" "}
            <strong className="text-[#15161A] font-semibold">{shared}건</strong>
          </span>
          <span className="text-[#DAD8CF]">·</span>
          <span>
            표시 중{" "}
            <strong className="text-[#15161A] font-semibold">
              {filtered.length}
            </strong>
            개
          </span>
        </div>
      </section>

      {/* ─── 필터 + 검색 ─── */}
      <section className="bg-white border border-[#ECEAE2] rounded-xl p-4 space-y-3">
        {/* 검색 */}
        <div className="flex gap-2.5 flex-wrap items-center">
          <span className="text-[11px] text-[#A8A6A0] min-w-[36px] tracking-wider">
            검색
          </span>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                if (composingRef.current) return;
                setQuery(e.target.value);
              }}
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={(e) => {
                composingRef.current = false;
                setQuery((e.target as HTMLInputElement).value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  setQuery("");
                  e.preventDefault();
                }
              }}
              placeholder="스킬명·요약·키워드·후기·사람으로 찾기"
              autoComplete="off"
              aria-label="스킬 검색"
              className="w-full h-8 pl-3 pr-9 text-[13px] tracking-[-0.005em] rounded-full border border-[#E0DED6] bg-white text-[#15161A] placeholder:text-[#A8A6A0] focus:outline-none focus:border-[#0F4A85] focus:ring-3 focus:ring-[#0F4A85]/10 transition-colors appearance-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="검색 지우기"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full bg-[#ECEAE2] text-[#73726c] text-sm leading-none inline-flex items-center justify-center hover:bg-[#DAD8CF] hover:text-[#15161A] transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 분야 */}
        <FilterRow
          label="분야"
          options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
          active={category}
          onPick={setCategory}
        />
        {/* 난이도 */}
        <FilterRow
          label="난이도"
          options={DIFFICULTIES.map((v) => ({ value: v, label: v }))}
          active={difficulty}
          onPick={setDifficulty}
        />
        {/* 게시 */}
        <FilterRow
          label="게시"
          options={POST_TYPES.map((v) => ({ value: v, label: v }))}
          active={postType}
          onPick={setPostType}
        />
      </section>

      {/* ─── 카드 그리드 ─── */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#A8A6A0]">
          해당 조건의 스킬이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {filtered.map((sk) => (
            <SkillCard key={sk.slug} sk={sk} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  onPick,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  active: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex gap-2.5 flex-wrap items-center">
      <span className="text-[11px] text-[#A8A6A0] min-w-[36px] tracking-wider">
        {label}
      </span>
      {options.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            className={
              isActive
                ? "text-xs px-3 py-1.5 rounded-full border tracking-[-0.01em] font-medium transition-all bg-[#E8F0F9] border-[#0F4A85] text-[#0F4A85]"
                : "text-xs px-3 py-1.5 rounded-full border tracking-[-0.01em] font-normal transition-all bg-white border-[#E0DED6] text-[#73726c] hover:border-[#c8c5b8]"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SkillCard({ sk }: { sk: CuratedSkill }) {
  const catColor = COLOR_BY_CATEGORY[sk.category] ?? DEFAULT_COLOR;
  const diffColor = COLOR_BY_DIFFICULTY[sk.difficulty] ?? DEFAULT_COLOR;
  const postColor = COLOR_BY_POST[sk.postType] ?? DEFAULT_COLOR;
  const quotes = topQuotes(sk.quotes);
  const isReview = sk.postType === "써본후기";
  const href = sk.links[0] ?? `#${sk.slug}`;
  const external = sk.links[0] !== undefined;

  return (
    <article
      id={sk.slug}
      className="border border-[#ECEAE2] rounded-xl bg-white transition-all flex flex-col h-full hover:border-[#c8c5b8] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
    >
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="flex flex-col h-full"
      >
        {/* head */}
        <div className="p-[18px] flex flex-col gap-1.5">
          <div className="flex justify-between items-start gap-2">
            <span className="text-sm font-semibold text-[#15161A] tracking-[-0.01em] leading-snug flex-1">
              {sk.summary || sk.skillName || sk.title}
            </span>
            {sk.userCount > 0 && (
              <span
                className="text-[11px] px-2.5 py-[3px] rounded-full whitespace-nowrap font-medium shrink-0"
                style={{ background: postColor.bg, color: postColor.fg }}
              >
                🔥 {sk.userCount}명이 써봄
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#73726c] leading-relaxed m-0 tracking-[-0.01em]">
            {sk.skillName || sk.title}
          </p>
        </div>

        {/* quotes */}
        {isReview && quotes.length > 0 && (
          <div className="px-[18px] pb-[14px] flex flex-col gap-2.5 border-t border-[#F4F3F0] pt-[14px]">
            <p className="text-[11px] text-[#A8A6A0] tracking-wider m-0">
              💬 써본 사람들이 발견한 것
            </p>
            {quotes.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#C8C5BC] text-lg leading-none -mt-0.5 shrink-0">
                  &ldquo;
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#4A4946] leading-relaxed m-0 tracking-[-0.01em]">
                    {q.quote}
                  </p>
                  {q.author && (
                    <p className="text-[11px] text-[#A8A6A0] m-0 mt-0.5 tracking-[-0.01em]">
                      — {q.author}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* foot */}
        <div className="mt-auto px-[18px] pb-[14px] pt-[12px] border-t border-[#F4F3F0] flex flex-col gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {sk.category && (
              <span
                className="text-[11px] px-2.5 py-[3px] rounded-full whitespace-nowrap font-medium tracking-[-0.01em]"
                style={{ background: catColor.bg, color: catColor.fg }}
              >
                {CATEGORY_LABEL[sk.category] ?? sk.category}
              </span>
            )}
            {sk.difficulty && (
              <span
                className="text-[11px] px-2.5 py-[3px] rounded-full whitespace-nowrap font-medium tracking-[-0.01em]"
                style={{ background: diffColor.bg, color: diffColor.fg }}
              >
                {sk.difficulty}
              </span>
            )}
            {sk.postType && (
              <span
                className="text-[11px] px-2.5 py-[3px] rounded-full whitespace-nowrap font-medium tracking-[-0.01em]"
                style={{ background: postColor.bg, color: postColor.fg }}
              >
                {sk.postType}
              </span>
            )}
          </div>
          {sk.inspiredBy && (
            <div className="text-[11px] text-[#4D43B8] flex items-center gap-1.5 tracking-[-0.01em]">
              <span>↻</span> {sk.inspiredBy}
            </div>
          )}
        </div>
      </a>
    </article>
  );
}
