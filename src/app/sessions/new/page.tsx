"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MemberOption {
  id: string;
  name: string;
}

const CATEGORIES = [
  { value: "AI", label: "AI" },
  { value: "CAREER", label: "커리어/성장" },
  { value: "FINANCE", label: "재테크" },
  { value: "LIFESTYLE", label: "일상/취미" },
];

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
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(
          (data.members || [])
            .filter((m: MemberOption & { is_active: boolean }) => m.is_active)
            .map((m: MemberOption) => ({ id: m.id, name: m.name }))
        );
      });
  }, []);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(hostSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedHost) {
      setError("진행자를 선택해주세요.");
      return;
    }
    if (!title || !date) {
      setError("제목과 날짜는 필수입니다.");
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
          <p className="text-4xl mb-4">🐚</p>
          <h2 className="text-xl font-bold text-amber-900 mb-2">캘린더에 게시됐어요!</h2>
          <p className="text-sm text-amber-800 mb-6">
            알림 신청자가 5명 이상 모이면 자동으로 확정돼요.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-amber-700 mb-4 hover:text-amber-900"
        >
          &larr; 돌아가기
        </button>

        <h1 className="text-xl font-bold text-amber-900 mb-6">
          🐚 공유회 열기
        </h1>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {/* 진행자 선택 */}
          <div className="relative">
            <label className="block text-sm font-medium text-amber-800 mb-1">
              진행자 <span className="text-red-500">*</span>
            </label>
            {selectedHost ? (
              <div className="flex items-center justify-between px-3 py-2.5 border border-amber-200 rounded-lg">
                <span className="text-sm text-amber-900 font-medium">{selectedHost.name}</span>
                <button
                  onClick={() => { setSelectedHost(null); setHostSearch(""); }}
                  className="text-xs text-amber-700 hover:text-amber-900"
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
                  placeholder="이름을 입력하세요..."
                  className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
                />
                {showHostList && hostSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredMembers.length === 0 ? (
                      <p className="text-xs text-amber-700 px-3 py-2">검색 결과 없음</p>
                    ) : (
                      filteredMembers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedHost(m); setShowHostList(false); setHostSearch(""); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 text-amber-900"
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
            <label className="block text-sm font-medium text-amber-800 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: UX 리서치 입문"
              className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공유회에 대해 간단히 설명해주세요"
              rows={3}
              className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">시간</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">가격 (1~10 🐚)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={entryCost}
                onChange={(e) => setEntryCost(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-center text-sm font-bold text-amber-900 mt-1">{entryCost} 🐚</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">정원 (선택)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="무제한"
                min={1}
                className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">길이 (분)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
            >
              <option value={30}>30분</option>
              <option value={60}>60분</option>
              <option value={90}>90분</option>
              <option value={120}>120분</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedHost || !title || !date}
            className="w-full py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "신청 중..." : "공유회 신청하기"}
          </button>

          <p className="text-xs text-amber-700 text-center">
            어드민 승인 후 캘린더에 공개됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
