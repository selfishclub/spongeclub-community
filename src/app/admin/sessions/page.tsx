"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  title: string;
  description: string;
  category: string;
  scheduled_at: string;
  duration_minutes: number;
  entry_cost: number;
  capacity: number | null;
  status: string;
  zoom_link: string | null;
  created_at: string;
  attendee_count: number;
  host: { id: string; name: string } | null;
}

interface MemberOption {
  id: string;
  name: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  AI: "AI",
  CAREER: "커리어/성장",
  FINANCE: "재테크",
  LIFESTYLE: "일상/취미",
};

const CATEGORIES = [
  { value: "AI", label: "AI" },
  { value: "CAREER", label: "커리어/성장" },
  { value: "FINANCE", label: "재테크" },
  { value: "LIFESTYLE", label: "일상/취미" },
];

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState<string | null>(null);

  // 수동 등록 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [hostSearch, setHostSearch] = useState("");
  const [selectedHost, setSelectedHost] = useState<MemberOption | null>(null);
  const [showHostList, setShowHostList] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    category: "AI",
    date: "",
    time: "19:00",
    duration: 60,
    entry_cost: 5,
    capacity: "",
    status: "APPROVED",
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchSessions = () => {
    fetch(`/api/admin/sessions?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions || []));
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

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

  const handleAction = async (id: string, action: string) => {
    setLoading(id);
    await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setLoading(null);
    fetchSessions();
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(hostSearch.toLowerCase())
  );

  const handleAdd = async () => {
    if (!selectedHost || !addForm.title || !addForm.date) {
      setAddError("진행자, 제목, 날짜는 필수입니다.");
      return;
    }

    setAddLoading(true);
    setAddError("");

    const scheduled_at = new Date(`${addForm.date}T${addForm.time}:00+09:00`).toISOString();

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host_id: selectedHost.id,
        title: addForm.title,
        description: addForm.description,
        category: addForm.category,
        scheduled_at,
        duration_minutes: addForm.duration,
        entry_cost: addForm.entry_cost,
        capacity: addForm.capacity ? parseInt(addForm.capacity) : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAddError(data.error || "등록에 실패했습니다.");
      setAddLoading(false);
      return;
    }

    // 바로 승인 상태로 만들기
    if (addForm.status === "APPROVED" && data.session?.id) {
      await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.session.id, action: "approve" }),
      });
    }

    setShowAddModal(false);
    setSelectedHost(null);
    setHostSearch("");
    setAddForm({
      title: "",
      description: "",
      category: "AI",
      date: "",
      time: "19:00",
      duration: 60,
      entry_cost: 5,
      capacity: "",
      status: "APPROVED",
    });
    setAddLoading(false);
    fetchSessions();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-900">공유회 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
        >
          + 공유회 등록
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        {["PENDING", "APPROVED", "COMPLETED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm rounded-lg ${
              statusFilter === s
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {s === "PENDING"
              ? "대기 중"
              : s === "APPROVED"
                ? "예정"
                : s === "COMPLETED"
                  ? "완료"
                  : "거부"}
          </button>
        ))}
      </div>

      <p className="text-sm text-amber-600 mb-4">총 {sessions.length}건</p>

      <div className="space-y-3">
        {sessions.map((s) => {
          const hostName =
            (s.host as unknown as { name: string } | null)?.name ?? "알 수 없음";

          return (
            <div
              key={s.id}
              className="bg-white rounded-lg border border-amber-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-amber-900">{s.title}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[s.category] || s.category}
                    </span>
                  </div>
                  <p className="text-sm text-amber-600 mb-1">{s.description}</p>
                  <div className="text-xs text-amber-500 space-y-0.5">
                    <p>
                      진행자: {hostName} | 가격: {s.entry_cost}🐚 | 참석:{" "}
                      {s.attendee_count}명{s.capacity ? `/${s.capacity}명` : ""}
                    </p>
                    <p>
                      일시: {new Date(s.scheduled_at).toLocaleString("ko-KR")} | {s.duration_minutes}분
                    </p>
                    {s.zoom_link && (
                      <p>
                        줌:{" "}
                        <Link href={s.zoom_link} target="_blank" className="text-blue-600 hover:underline">
                          {s.zoom_link}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {statusFilter === "PENDING" && (
                    <>
                      <button onClick={() => handleAction(s.id, "approve")} disabled={loading === s.id} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">승인</button>
                      <button onClick={() => handleAction(s.id, "reject")} disabled={loading === s.id} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">거부</button>
                    </>
                  )}
                  {statusFilter === "APPROVED" && (
                    <button onClick={() => handleAction(s.id, "complete")} disabled={loading === s.id} className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50">완료 처리</button>
                  )}
                  {statusFilter === "COMPLETED" && <span className="text-xs text-green-600 font-medium">완료</span>}
                  {statusFilter === "REJECTED" && <span className="text-xs text-red-500 font-medium">거부</span>}
                </div>
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <p className="text-center py-8 text-amber-500">해당 상태의 공유회가 없습니다.</p>
        )}
      </div>

      {/* 공유회 수동 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-amber-900 mb-4">공유회 등록</h2>

            {addError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">{addError}</p>
            )}

            {/* 진행자 선택 */}
            <label className="block text-sm text-amber-800 mb-1">진행자 <span className="text-red-500">*</span></label>
            {selectedHost ? (
              <div className="flex items-center justify-between px-3 py-2 border border-amber-300 rounded mb-3">
                <span className="text-sm font-medium text-amber-900">{selectedHost.name}</span>
                <button onClick={() => { setSelectedHost(null); setHostSearch(""); }} className="text-xs text-amber-500">변경</button>
              </div>
            ) : (
              <div className="relative mb-3">
                <input
                  type="text"
                  value={hostSearch}
                  onChange={(e) => { setHostSearch(e.target.value); setShowHostList(true); }}
                  onFocus={() => setShowHostList(true)}
                  placeholder="이름 검색..."
                  className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
                {showHostList && hostSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded shadow-lg max-h-32 overflow-y-auto">
                    {filteredMembers.length === 0 ? (
                      <p className="text-xs text-amber-400 px-3 py-2">없음</p>
                    ) : (
                      filteredMembers.map((m) => (
                        <button key={m.id} onClick={() => { setSelectedHost(m); setShowHostList(false); setHostSearch(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50">{m.name}</button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <label className="block text-sm text-amber-800 mb-1">제목 <span className="text-red-500">*</span></label>
            <input type="text" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded mb-3 text-sm" />

            <label className="block text-sm text-amber-800 mb-1">설명</label>
            <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-amber-300 rounded mb-3 text-sm resize-none" />

            <label className="block text-sm text-amber-800 mb-1">카테고리</label>
            <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded mb-3 text-sm">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-amber-800 mb-1">날짜 <span className="text-red-500">*</span></label>
                <input type="date" value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm text-amber-800 mb-1">시간</label>
                <input type="time" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm text-amber-800 mb-1">가격 (🐚)</label>
                <input type="number" min={5} max={10} value={addForm.entry_cost} onChange={(e) => setAddForm({ ...addForm, entry_cost: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm text-amber-800 mb-1">길이 (분)</label>
                <select value={addForm.duration} onChange={(e) => setAddForm({ ...addForm, duration: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm">
                  <option value={30}>30분</option>
                  <option value={60}>60분</option>
                  <option value={90}>90분</option>
                  <option value={120}>120분</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-amber-800 mb-1">정원</label>
                <input type="number" value={addForm.capacity} onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })} placeholder="무제한" min={1} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
            </div>

            <label className="block text-sm text-amber-800 mb-1">등록 상태</label>
            <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded mb-4 text-sm">
              <option value="APPROVED">바로 승인 (캘린더에 공개)</option>
              <option value="PENDING">대기 중 (승인 필요)</option>
            </select>

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowAddModal(false); setAddError(""); }} className="px-4 py-2 text-sm text-amber-700">취소</button>
              <button onClick={handleAdd} disabled={addLoading || !selectedHost || !addForm.title || !addForm.date} className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50">
                {addLoading ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
