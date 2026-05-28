"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import type { GrantPreview, GrantResult } from "@/lib/missions/shell-grant";

interface AdminReference {
  index: number;
  title: string;
  url: string;
  note: string | null;
}

interface AdminWeek {
  id: string;
  weekFolder: string;
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  missions: { index: number; title: string }[];
  references: AdminReference[];
  replayUrl: string | null;
  transcriptUrl: string | null;
  published: boolean;
}

const MISSION_SLOTS = [1, 2, 3];
const REFERENCE_SLOTS = [1, 2, 3, 4, 5];

type ReferenceInput = { title: string; url: string; note: string };
const emptyReferenceInputs = (): Record<number, ReferenceInput> =>
  Object.fromEntries(
    REFERENCE_SLOTS.map((i) => [i, { title: "", url: "", note: "" }]),
  );

export default function AdminMissionWeekPage({
  params,
}: {
  params: Promise<{ weekFolder: string }>;
}) {
  const { weekFolder } = use(params);
  const decoded = decodeURIComponent(weekFolder);

  const [week, setWeek] = useState<AdminWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [missionInputs, setMissionInputs] = useState<Record<number, string>>({
    1: "",
    2: "",
    3: "",
  });
  const [referenceInputs, setReferenceInputs] =
    useState<Record<number, ReferenceInput>>(emptyReferenceInputs);
  const [replayUrl, setReplayUrl] = useState("");
  const [transcriptUrl, setTranscriptUrl] = useState("");
  const [published, setPublished] = useState(true);

  // 제출자 일괄 셸 지급
  const [grantPreview, setGrantPreview] = useState<GrantPreview | null>(null);
  const [grantBusy, setGrantBusy] = useState(false);
  const [grantResult, setGrantResult] = useState<GrantResult | null>(null);
  const [grantError, setGrantError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/missions/weeks/${encodeURIComponent(decoded)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error || !data.week) {
          setError(data.error || "주차를 찾지 못했어요");
          setLoading(false);
          return;
        }
        const w: AdminWeek = data.week;
        setWeek(w);
        setHeroTitle(w.heroTitle ?? "");
        setHeroSubtitle(w.heroSubtitle ?? "");
        const slots: Record<number, string> = { 1: "", 2: "", 3: "" };
        for (const m of w.missions) slots[m.index] = m.title;
        setMissionInputs(slots);
        const refSlots = emptyReferenceInputs();
        for (const r of w.references || []) {
          if (REFERENCE_SLOTS.includes(r.index)) {
            refSlots[r.index] = {
              title: r.title,
              url: r.url,
              note: r.note ?? "",
            };
          }
        }
        setReferenceInputs(refSlots);
        setReplayUrl(w.replayUrl ?? "");
        setTranscriptUrl(w.transcriptUrl ?? "");
        setPublished(w.published);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [decoded]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const missions = MISSION_SLOTS.map((idx) => ({
      index: idx,
      title: (missionInputs[idx] || "").trim(),
    })).filter((m) => m.title.length > 0);

    const references = REFERENCE_SLOTS.map((idx) => {
      const r = referenceInputs[idx];
      return {
        index: idx,
        title: r.title.trim(),
        url: r.url.trim(),
        note: r.note.trim() || null,
      };
    }).filter((r) => r.title.length > 0 && r.url.length > 0);

    const res = await fetch(
      `/api/admin/missions/weeks/${encodeURIComponent(decoded)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTitle: heroTitle.trim() || null,
          heroSubtitle: heroSubtitle.trim() || null,
          missions,
          references,
          replayUrl: replayUrl.trim() || null,
          transcriptUrl: transcriptUrl.trim() || null,
          published,
        }),
      },
    );

    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) {
      setError(data.error || `저장 실패 (${res.status})`);
      return;
    }
    setWeek(data.week);
    setSavedAt(new Date());
  }

  async function fetchGrantPreview(): Promise<GrantPreview | null> {
    const res = await fetch(
      `/api/admin/missions/weeks/${encodeURIComponent(decoded)}/grant-shells`,
    );
    const data = await res.json();
    if (!res.ok || data.error) {
      setGrantError(data.error || `미리보기 실패 (${res.status})`);
      return null;
    }
    return data.preview as GrantPreview;
  }

  async function loadGrantPreview() {
    setGrantBusy(true);
    setGrantError(null);
    setGrantResult(null);
    try {
      const p = await fetchGrantPreview();
      if (p) setGrantPreview(p);
    } catch (e) {
      setGrantError(String(e));
    }
    setGrantBusy(false);
  }

  async function runGrant() {
    if (!grantPreview) return;
    if (
      !confirm(
        `${grantPreview.grantableCount}명에게 +${grantPreview.shellPerSubmitter}셸을 지급합니다. 진행할까요?`,
      )
    ) {
      return;
    }
    setGrantBusy(true);
    setGrantError(null);
    try {
      const res = await fetch(
        `/api/admin/missions/weeks/${encodeURIComponent(decoded)}/grant-shells`,
        { method: "POST" },
      );
      const data = await res.json();
      const result = data.result as GrantResult | undefined;
      if (!res.ok || data.error) {
        setGrantError(data.error || `지급 실패 (${res.status})`);
      } else if (result?.blocked === "LOCKED") {
        setGrantError("이미 지급 완료된 주차입니다 — 재지급할 수 없어요.");
        const p = await fetchGrantPreview();
        if (p) setGrantPreview(p);
      } else {
        setGrantResult(result ?? null);
        // 지급 후 미리보기 갱신 (잠금·이미지급 반영) — grantResult 는 유지
        const p = await fetchGrantPreview();
        if (p) setGrantPreview(p);
      }
    } catch (e) {
      setGrantError(String(e));
    }
    setGrantBusy(false);
  }

  if (loading) {
    return (
      <p className="text-center py-12 text-[var(--ink-30)] text-sm">
        로딩 중...
      </p>
    );
  }

  if (error && !week) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/missions"
          className="inline-block text-xs font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)]"
        >
          ← 미션 관리
        </Link>
        <p className="text-sm text-[var(--ink)] border-2 border-[var(--ink)] p-4">
          {error}
        </p>
      </div>
    );
  }

  if (!week) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb + 기본 정보 */}
      <div>
        <Link
          href="/admin/missions"
          className="inline-block text-xs font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)] mb-4"
        >
          ← 미션 관리
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">
          {week.label} 편집
        </h1>
        <p className="text-xs text-[var(--ink-50)] mt-1">
          {week.startDate} ~ {week.endDate} · {week.weekFolder}
        </p>
      </div>

      {/* Hero 타이틀 / 서브 카피 */}
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold text-[var(--ink)] uppercase tracking-wider">
          Hero 타이틀
        </h2>
        <div className="space-y-1">
          <label
            htmlFor="hero-title"
            className="block text-xs font-extrabold text-[var(--ink-50)]"
          >
            큰 제목 (서술형)
          </label>
          <input
            id="hero-title"
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="예: 나의 고객과 why 정의하기"
            className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="hero-subtitle"
            className="block text-xs font-extrabold text-[var(--ink-50)]"
          >
            서브 카피
          </label>
          <input
            id="hero-subtitle"
            type="text"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="예: 이번 주에 만들고 나눌 과제입니다."
            className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
          />
        </div>
        <p className="text-xs text-[var(--ink-30)] font-medium">
          빈 칸이면 기본 문구로 노출됩니다.
        </p>
      </section>

      {/* 미션 입력 */}
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold text-[var(--ink)] uppercase tracking-wider">
          미션 제목
        </h2>
        {MISSION_SLOTS.map((idx) => (
          <div key={idx} className="space-y-1">
            <label
              htmlFor={`mission-${idx}`}
              className="block text-xs font-extrabold text-[var(--ink-50)]"
            >
              미션 {idx}
            </label>
            <input
              id={`mission-${idx}`}
              type="text"
              value={missionInputs[idx] || ""}
              onChange={(e) =>
                setMissionInputs({ ...missionInputs, [idx]: e.target.value })
              }
              placeholder={`미션 ${idx} 제목 (빈 칸이면 노출 안 함)`}
              className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
            />
          </div>
        ))}
        <p className="text-xs text-[var(--ink-30)] font-medium">
          입력된 미션만 사이트 3번 섹션에 노출됩니다.
        </p>
      </section>

      {/* 참고자료 */}
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold text-[var(--ink)] uppercase tracking-wider">
          참고자료
        </h2>
        <p className="text-xs text-[var(--ink-30)] font-medium">
          제목 + URL 둘 다 입력된 항목만 사이트 hero 아래 카드로 노출됩니다.
        </p>
        {REFERENCE_SLOTS.map((idx) => {
          const r = referenceInputs[idx];
          return (
            <div
              key={idx}
              className="space-y-1 border-2 border-[var(--ink-10)] p-3"
            >
              <span className="text-xs font-extrabold text-[var(--ink-50)]">
                #{idx}
              </span>
              <input
                type="text"
                value={r.title}
                onChange={(e) =>
                  setReferenceInputs({
                    ...referenceInputs,
                    [idx]: { ...r, title: e.target.value },
                  })
                }
                placeholder="제목"
                className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
              />
              <input
                type="url"
                value={r.url}
                onChange={(e) =>
                  setReferenceInputs({
                    ...referenceInputs,
                    [idx]: { ...r, url: e.target.value },
                  })
                }
                placeholder="https://..."
                className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
              />
              <input
                type="text"
                value={r.note}
                onChange={(e) =>
                  setReferenceInputs({
                    ...referenceInputs,
                    [idx]: { ...r, note: e.target.value },
                  })
                }
                placeholder="보조 설명 (선택)"
                className="w-full border-2 border-[var(--ink-30)] px-3 py-2 text-xs focus:outline-none focus:bg-[var(--yellow-dim)]"
              />
            </div>
          );
        })}
      </section>

      {/* 다시보기 URL */}
      <section className="space-y-2">
        <label
          htmlFor="replay-url"
          className="block text-sm font-extrabold text-[var(--ink)] uppercase tracking-wider"
        >
          다시보기 URL
        </label>
        <input
          id="replay-url"
          type="url"
          value={replayUrl}
          onChange={(e) => setReplayUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
        />
        <p className="text-xs text-[var(--ink-30)] font-medium">
          입력 시 미션 hero 옆에 📺 다시보기 버튼이 노출됩니다.
        </p>
      </section>

      {/* 속기본 URL */}
      <section className="space-y-2">
        <label
          htmlFor="transcript-url"
          className="block text-sm font-extrabold text-[var(--ink)] uppercase tracking-wider"
        >
          속기본 URL
        </label>
        <input
          id="transcript-url"
          type="url"
          value={transcriptUrl}
          onChange={(e) => setTranscriptUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border-2 border-[var(--ink)] px-3 py-2 text-sm focus:outline-none focus:bg-[var(--yellow-dim)]"
        />
        <p className="text-xs text-[var(--ink-30)] font-medium">
          입력 시 미션 hero 옆에 📝 속기본 버튼이 노출됩니다.
        </p>
      </section>

      {/* 공개 토글 */}
      <section className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-5 h-5 accent-[var(--ink)]"
          />
          <span className="text-sm font-extrabold text-[var(--ink)]">
            이 주차를 사이트에 공개
          </span>
        </label>
        <p className="text-xs text-[var(--ink-30)] font-medium ml-8">
          꺼두면 /missions 페이지에서 이 주차 데이터를 안 가져옵니다.
        </p>
      </section>

      {/* 제출자 일괄 셸 지급 */}
      <section className="space-y-3 border-2 border-[var(--ink)] p-4">
        <div>
          <h2 className="text-sm font-extrabold text-[var(--ink)] uppercase tracking-wider">
            제출자 일괄 셸 지급
          </h2>
          <p className="text-xs text-[var(--ink-50)] font-medium mt-1">
            이 주차 과제 제출자에게 +1셸씩 지급합니다. 먼저 매칭을 확인하세요.
            (이미 지급된 멤버는 자동으로 건너뜁니다.)
          </p>
        </div>

        <button
          type="button"
          onClick={loadGrantPreview}
          disabled={grantBusy}
          className="px-4 py-2 border-2 border-[var(--ink)] bg-white text-[var(--ink)] text-xs font-extrabold hover:bg-[var(--yellow-dim)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {grantBusy ? "처리 중..." : "제출자 매칭 미리보기"}
        </button>

        {grantError && (
          <p className="text-xs text-red-600 font-extrabold">⚠ {grantError}</p>
        )}

        {grantPreview && (
          <div className="space-y-3 border-t-2 border-[var(--ink-10)] pt-3">
            <p className="text-xs font-extrabold text-[var(--ink)]">
              제출자 {grantPreview.submitterCount}명 · 매칭{" "}
              {grantPreview.matched.length}명 · 미매칭{" "}
              {grantPreview.unmatched.length}명 · 이미 지급{" "}
              {grantPreview.alreadyGrantedCount}명
            </p>
            {grantPreview.locked ? (
              <p className="text-xs text-[var(--ink-50)] font-medium">
                🔒 이 주차는 이미 지급 완료됨 — 재지급 불가. 누락된 사람은
                멤버 관리에서 수동 지급하세요.
              </p>
            ) : (
              <p className="text-xs text-[var(--ink-30)] font-medium">
                지금 지급하면 이 명단으로 고정되고, 이후 늦게 제출하는 사람은
                지급되지 않습니다 (수동 지급으로 처리).
              </p>
            )}

            {grantPreview.matched.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-[var(--ink-50)]">
                  매칭된 제출자
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {grantPreview.matched.map((m) => (
                    <span
                      key={m.memberId}
                      title={`${m.team} · vault: ${m.vaultMember} → members: ${m.memberName}`}
                      className={`text-xs px-2 py-0.5 border ${
                        m.alreadyGranted
                          ? "border-[var(--ink-10)] text-[var(--ink-30)] line-through"
                          : "border-[var(--ink)] text-[var(--ink)]"
                      }`}
                    >
                      {m.team} {m.memberName}
                      {m.alreadyGranted && " ✓"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {grantPreview.unmatched.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-red-600">
                  ⚠ 매칭 안 됨 — 아래 제출자는 멤버 관리에서 수동 지급하세요
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {grantPreview.unmatched.map((u) => (
                    <span
                      key={`${u.team}-${u.vaultMember}`}
                      title={
                        u.reason === "AMBIGUOUS"
                          ? "동명이인 의심 — members 에 같은 이름 여럿"
                          : "members 테이블에서 못 찾음"
                      }
                      className="text-xs px-2 py-0.5 border border-red-300 text-red-600"
                    >
                      {u.team} {u.vaultMember}
                      {u.reason === "AMBIGUOUS" ? " (동명이인?)" : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {grantPreview.locked ? null : grantPreview.grantableCount > 0 ? (
              <button
                type="button"
                onClick={runGrant}
                disabled={grantBusy}
                className="px-5 py-2.5 border-2 border-[var(--ink)] bg-[var(--yellow)] text-[var(--ink)] text-sm font-extrabold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {grantBusy
                  ? "지급 중..."
                  : `확인 — ${grantPreview.grantableCount}명에게 +${grantPreview.shellPerSubmitter}셸 지급`}
              </button>
            ) : (
              <p className="text-xs text-[var(--ink-50)] font-medium">
                지급할 대상이 없어요.
              </p>
            )}
          </div>
        )}

        {grantResult && (
          <p className="text-xs font-extrabold text-[var(--ink)] border-t-2 border-[var(--ink-10)] pt-3">
            ✓ {grantResult.granted}명 지급 완료 · {grantResult.skipped}명 건너뜀
            {grantResult.failed.length > 0 && (
              <span className="text-red-600">
                {" · "}
                {grantResult.failed.length}명 실패
              </span>
            )}
          </p>
        )}
      </section>

      {/* 저장 */}
      <div className="border-t-2 border-[var(--ink-10)] pt-6 flex items-center justify-between gap-4">
        <div className="text-xs text-[var(--ink-50)] font-medium">
          {error && (
            <span className="text-red-600 font-extrabold">⚠ {error}</span>
          )}
          {!error && savedAt && (
            <span>✓ 저장됨 ({savedAt.toLocaleTimeString("ko-KR")})</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 border-2 border-[var(--ink)] bg-[var(--yellow)] text-[var(--ink)] text-sm font-extrabold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
