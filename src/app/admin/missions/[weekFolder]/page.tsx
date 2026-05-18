"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface AdminWeek {
  id: string;
  weekFolder: string;
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  missions: { index: number; title: string }[];
  replayUrl: string | null;
  transcriptUrl: string | null;
  published: boolean;
}

const MISSION_SLOTS = [1, 2, 3];

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
  const [missionInputs, setMissionInputs] = useState<Record<number, string>>({
    1: "",
    2: "",
    3: "",
  });
  const [replayUrl, setReplayUrl] = useState("");
  const [transcriptUrl, setTranscriptUrl] = useState("");
  const [published, setPublished] = useState(true);

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
        const slots: Record<number, string> = { 1: "", 2: "", 3: "" };
        for (const m of w.missions) slots[m.index] = m.title;
        setMissionInputs(slots);
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

    const res = await fetch(
      `/api/admin/missions/weeks/${encodeURIComponent(decoded)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missions,
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
