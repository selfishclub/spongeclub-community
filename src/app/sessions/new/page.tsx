"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MemberOption {
  id: string;
  name: string;
  cohort?: number | null;
}

const CATEGORIES = [
  { value: "AI", label: "AI" },
  { value: "CAREER", label: "커리어/성장" },
  { value: "FINANCE", label: "재테크" },
  { value: "LIFESTYLE", label: "일상/취미" },
];

// 기수별 가능 요일 (0=일, 1=월, ..., 5=금, 6=토)
const COHORT_ALLOWED_DAYS: Record<number, number[]> = {
  1: [5],          // 1기: 금요일만
  2: [1, 2, 3, 4], // 2기: 월, 화, 수, 목
};

function getAllowedDays(cohort: number): number[] {
  return COHORT_ALLOWED_DAYS[cohort] || [1, 2, 3, 4, 5]; // 기본: 월~금
}

function getDayLabel(days: number[]): string {
  const names = ["일", "월", "화", "수", "목", "금", "토"];
  return days.map((d) => names[d]).join(", ");
}

export default function NewSessionPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [hostSearch, setHostSearch] = useState("");
  const [selectedHost, setSelectedHost] = useState<MemberOption | null>(null);
  const [showHostList, setShowHostList] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AI");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [duration, setDuration] = useState(60);
  const [entryCost, setEntryCost] = useState(5);
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    fetch("/api/auth/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(
          (data.members || []).map((m: MemberOption) => ({
            ...m,
            cohort: m.cohort ?? 1,
          }))
        );
      });
  }, []);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(hostSearch.toLowerCase())
  );

  const hostCohort = selectedHost?.cohort ?? 2;
  const allowedDays = getAllowedDays(hostCohort);

  // 날짜 선택 시 요일 체크
  const handleDateChange = (value: string) => {
    if (!value) { setDate(""); return; }
    const d = new Date(value + "T00:00:00");
    const day = d.getDay();
    if (!allowedDays.includes(day)) {
      setError(`${hostCohort}기는 ${getDayLabel(allowedDays)}요일에만 공유회를 열 수 있어요.`);
      return;
    }
    setError("");
    setDate(value);
  };

  const handleSubmit = async () => {
    if (!selectedHost) {
      setError("진행자를 선택해주세요.");
      return;
    }
    if (!title || !date) {
      setError("제목과 날짜는 필수입니다.");
      return;
    }

    // 최종 요일 체크
    const d = new Date(date + "T00:00:00");
    if (!allowedDays.includes(d.getDay())) {
      setError(`${hostCohort}기는 ${getDayLabel(allowedDays)}요일에만 공유회를 열 수 있어요.`);
      return;
    }

    setLoading(true);
    setError("");

    const scheduled_at = new Date(`${date}T${time}:00+09:00`).toISOString();

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host_id: selectedHost.id,
        title,
        description,
        category,
        scheduled_at,
        duration_minutes: duration,
        entry_cost: entryCost,
        capacity: capacity ? parseInt(capacity) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "신청에 실패했어요.");
      return;
    }

    setSuccess(true);
  };

  const inputClass =
    "w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors";

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="bg-[var(--yellow)] inline-block px-5 py-3 mb-5">
            <span className="text-lg font-extrabold text-[var(--ink)]">캘린더에 게시됐어요!</span>
          </div>
          <p className="text-sm text-[var(--ink-50)] mb-8 leading-relaxed">
            알림 신청자가 5명 이상 모이면<br />자동으로 확정돼요.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 transition-opacity"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-lg mx-auto px-5 py-10">
        <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-8 tracking-tight">
          공유회 열기
        </h1>

        <div className="space-y-6">
          {/* 진행자 선택 */}
          <div className="relative">
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">
              진행자 <span className="text-red-500">*</span>
            </label>
            {selectedHost ? (
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--ink-05)]">
                <span className="text-sm text-[var(--ink)] font-bold">{selectedHost.name}</span>
                <button
                  onClick={() => { setSelectedHost(null); setHostSearch(""); setDate(""); }}
                  className="text-xs font-bold text-[var(--ink-30)] hover:text-[var(--ink)] transition-colors"
                >
                  변경
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={hostSearch}
                  onChange={(e) => { setHostSearch(e.target.value); setShowHostList(true); }}
                  onFocus={() => setShowHostList(true)}
                  onBlur={() => setTimeout(() => setShowHostList(false), 150)}
                  placeholder="이름을 입력하세요..."
                  autoComplete="off"
                  className={inputClass}
                />
                {showHostList && hostSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg max-h-48 overflow-y-auto">
                    {filteredMembers.length === 0 ? (
                      <p className="text-xs text-[var(--ink-30)] px-4 py-2.5 font-medium">검색 결과 없음</p>
                    ) : (
                      filteredMembers.map((m) => (
                        <button
                          key={m.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setSelectedHost(m); setShowHostList(false); setHostSearch(""); setDate(""); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[var(--ink)] font-medium hover:bg-[var(--yellow-dim)] transition-colors border-b border-[var(--ink-05)] last:border-0"
                        >
                          {m.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: UX 리서치 입문"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공유회에 대해 간단히 설명해주세요"
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">카테고리</label>
            <div className="flex border-2 border-[var(--ink)]">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-1 py-2.5 text-xs font-extrabold transition-colors ${
                    category === c.value
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"
                  } ${c.value !== "AI" ? "border-l-2 border-[var(--ink)]" : ""}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className={inputClass}
              />
              {selectedHost && (
                <p className="text-[11px] text-[var(--ink-30)] mt-1.5 font-medium">
                  {hostCohort}기 가능 요일: {getDayLabel(allowedDays)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">시간</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">
                가격 (1~10 🐚)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={entryCost}
                  onChange={(e) => setEntryCost(parseInt(e.target.value))}
                  className="flex-1 accent-[var(--ink)]"
                />
                <span className="text-sm font-extrabold text-[var(--ink)] tabular-nums w-10 text-center">
                  {entryCost} 🐚
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">정원 (선택)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="무제한"
                min={1}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">길이</label>
            <div className="flex border-2 border-[var(--ink)]">
              {[30, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2.5 text-xs font-extrabold transition-colors ${
                    duration === d
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"
                  } ${d !== 30 ? "border-l-2 border-[var(--ink)]" : ""}`}
                >
                  {d}분
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedHost || !title || !date}
            className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading ? "신청 중..." : "공유회 신청하기"}
          </button>

          <p className="text-xs text-[var(--ink-30)] text-center leading-relaxed font-medium">
            신청 즉시 캘린더에서 알림 신청이 시작돼요.<br />
            알림 신청자가 5명 이상 모이면 공유회 진행이 확정됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
