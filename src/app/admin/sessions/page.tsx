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

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "대기 중", bg: "bg-yellow-100", text: "text-yellow-700" },
  APPROVED: { label: "예정", bg: "bg-green-100", text: "text-green-700" },
  COMPLETED: { label: "완료", bg: "bg-blue-100", text: "text-blue-700" },
  REJECTED: { label: "거부", bg: "bg-red-100", text: "text-red-600" },
  CANCELLED: { label: "취소", bg: "bg-gray-100", text: "text-gray-500" },
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  // 수정 모달
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", category: "AI", date: "", time: "19:00",
    duration: 60, entry_cost: 5, capacity: "", status: "PENDING",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // 강제 신청 모달
  const [forceSession, setForceSession] = useState<Session | null>(null);
  const [forceSearch, setForceSearch] = useState("");
  const [forceLoading, setForceLoading] = useState(false);
  const [forceError, setForceError] = useState("");
  const [forceSuccess, setForceSuccess] = useState("");

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

  const openEditSession = (s: Session) => {
    setEditSession(s);
    const d = new Date(s.scheduled_at);
    setEditForm({
      title: s.title,
      description: s.description || "",
      category: s.category,
      date: d.toISOString().split("T")[0],
      time: d.toTimeString().slice(0, 5),
      duration: s.duration_minutes,
      entry_cost: s.entry_cost,
      capacity: s.capacity ? String(s.capacity) : "",
      status: s.status,
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editSession) return;
    setEditLoading(true);
    setEditError("");

    const scheduled_at = new Date(`${editForm.date}T${editForm.time}:00+09:00`).toISOString();

    const res = await fetch("/api/admin/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editSession.id,
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        scheduled_at,
        duration_minutes: editForm.duration,
        entry_cost: editForm.entry_cost,
        capacity: editForm.capacity ? parseInt(editForm.capacity) : null,
        status: editForm.status,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error || "수정에 실패했습니다.");
      setEditLoading(false);
      return;
    }

    setEditSession(null);
    setEditLoading(false);
    fetchSessions();
  };

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

  const forceFilteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(forceSearch.toLowerCase())
  );

  const handleForceRegister = async (memberId: string, memberName: string) => {
    if (!forceSession) return;
    if (!confirm(`${memberName}님을 "${forceSession.title}"에 강제 신청할까요? 셸이 차감됩니다.`)) return;

    setForceLoading(true);
    setForceError("");
    setForceSuccess("");

    const res = await fetch("/api/admin/sessions/force-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: forceSession.id, member_id: memberId }),
    });

    const data = await res.json();
    setForceLoading(false);

    if (!res.ok) {
      setForceError(data.error || "신청에 실패했어요.");
      return;
    }

    setForceSuccess(`${memberName}님 신청 완료!`);
    setForceSearch("");
    fetchSessions();
  };

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

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          ["ALL", "전체"],
          ["PENDING", "대기 중"],
          ["APPROVED", "예정"],
          ["COMPLETED", "완료"],
          ["REJECTED", "거부"],
          ["CANCELLED", "취소"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 text-sm rounded-lg ${
              statusFilter === key
                ? "bg-amber-600 text-white"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm text-amber-800 mb-4">총 {sessions.length}건</p>

      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="text-left px-4 py-3 text-amber-800">제목</th>
              <th className="text-left px-4 py-3 text-amber-800">카테고리</th>
              <th className="text-left px-4 py-3 text-amber-800">진행자</th>
              <th className="text-left px-4 py-3 text-amber-800">일시</th>
              <th className="text-right px-4 py-3 text-amber-800">가격</th>
              <th className="text-center px-4 py-3 text-amber-800">참석</th>
              <th className="text-center px-4 py-3 text-amber-800">상태</th>
              <th className="text-center px-4 py-3 text-amber-800">액션</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const hostName = (s.host as unknown as { name: string } | null)?.name ?? "-";
              const st = STATUS_LABELS[s.status] || STATUS_LABELS.PENDING;

              return (
                <tr key={s.id} className="border-t border-amber-100">
                  <td className="px-4 py-3 font-medium text-amber-900">
                    {s.title}
                    {s.description && (
                      <p className="text-xs text-amber-700 font-normal truncate max-w-[200px]">{s.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-amber-50 text-amber-900 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[s.category] || s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-amber-900">{hostName}</td>
                  <td className="px-4 py-3 text-amber-900 text-xs">
                    {new Date(s.scheduled_at).toLocaleDateString("ko-KR")}<br/>
                    {new Date(s.scheduled_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-900 font-medium">{s.entry_cost}🐚</td>
                  <td className="px-4 py-3 text-center text-amber-900">
                    {s.attendee_count}{s.capacity ? `/${s.capacity}` : ""}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded ${st.bg} ${st.text}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button onClick={() => openEditSession(s)} className="px-2 py-1 text-xs bg-amber-50 text-amber-900 rounded border border-amber-200 hover:bg-amber-100">수정</button>
                      {(s.status === "APPROVED" || s.status === "PENDING") && (
                        <button onClick={() => { setForceSession(s); setForceSearch(""); setForceError(""); setForceSuccess(""); }} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100">참석자 추가</button>
                      )}
                      {s.status === "PENDING" && (
                        <>
                          <button onClick={() => handleAction(s.id, "approve")} disabled={loading === s.id} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">승인</button>
                          <button onClick={() => handleAction(s.id, "reject")} disabled={loading === s.id} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">거부</button>
                        </>
                      )}
                      {s.status === "APPROVED" && (
                        <>
                          <button onClick={() => handleAction(s.id, "complete")} disabled={loading === s.id} className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50">완료</button>
                          <button onClick={() => { if (confirm("이 공유회를 취소할까요?")) handleAction(s.id, "cancel"); }} disabled={loading === s.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50">취소</button>
                        </>
                      )}
                      <button onClick={() => { if (confirm("이 공유회를 삭제할까요? 복구할 수 없습니다.")) handleAction(s.id, "delete"); }} disabled={loading === s.id} className="px-2 py-1 text-xs text-red-400 hover:text-red-600">삭제</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sessions.length === 0 && (
          <p className="text-center py-8 text-amber-700">해당 상태의 공유회가 없습니다.</p>
        )}
      </div>

      {/* 공유회 수정 모달 */}
      {editSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-amber-900 mb-4">공유회 수정</h2>

            {editError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">{editError}</p>}

            <label className="block text-sm text-amber-800 mb-1">제목</label>
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded mb-3 text-sm" />

            <label className="block text-sm text-amber-800 mb-1">설명</label>
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-amber-300 rounded mb-3 text-sm resize-none" />

            <label className="block text-sm text-amber-800 mb-1">카테고리</label>
            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded mb-3 text-sm">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-amber-800 mb-1">날짜</label>
                <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm text-amber-800 mb-1">시간</label>
                <input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm text-amber-800 mb-1">가격</label>
                <input type="number" min={5} max={10} value={editForm.entry_cost} onChange={(e) => setEditForm({ ...editForm, entry_cost: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm text-amber-800 mb-1">길이(분)</label>
                <select value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-amber-300 rounded text-sm">
                  <option value={30}>30분</option><option value={60}>60분</option><option value={90}>90분</option><option value={120}>120분</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-amber-800 mb-1">정원</label>
                <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} placeholder="무제한" min={1} className="w-full px-3 py-2 border border-amber-300 rounded text-sm" />
              </div>
            </div>

            <label className="block text-sm text-amber-800 mb-1">상태</label>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2 border border-amber-300 rounded mb-4 text-sm">
              <option value="PENDING">대기 중</option>
              <option value="APPROVED">예정</option>
              <option value="COMPLETED">완료</option>
              <option value="REJECTED">거부</option>
              <option value="CANCELLED">취소</option>
            </select>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditSession(null)} className="px-4 py-2 text-sm text-amber-900">취소</button>
              <button onClick={handleEditSave} disabled={editLoading || !editForm.title || !editForm.date} className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50">
                {editLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 강제 참석자 추가 모달 */}
      {forceSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-amber-900 mb-1">참석자 강제 신청</h2>
            <p className="text-sm text-amber-800 mb-4">{forceSession.title} ({forceSession.entry_cost}🐚)</p>

            {forceError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-3">{forceError}</p>}
            {forceSuccess && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded mb-3">{forceSuccess}</p>}

            <input
              type="text"
              value={forceSearch}
              onChange={(e) => setForceSearch(e.target.value)}
              placeholder="멤버 이름 검색..."
              className="w-full px-3 py-2 border border-amber-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <div className="max-h-48 overflow-y-auto border border-amber-200 rounded">
              {forceSearch && forceFilteredMembers.length === 0 && (
                <p className="text-xs text-amber-700 px-3 py-2">검색 결과 없음</p>
              )}
              {forceSearch && forceFilteredMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleForceRegister(m.id, m.name)}
                  disabled={forceLoading}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 border-b border-amber-100 last:border-b-0 disabled:opacity-50"
                >
                  {m.name}
                </button>
              ))}
              {!forceSearch && (
                <p className="text-xs text-amber-700 px-3 py-2">이름을 입력하세요</p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setForceSession(null)} className="px-4 py-2 text-sm text-amber-900">닫기</button>
            </div>
          </div>
        </div>
      )}

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
                <button onClick={() => { setSelectedHost(null); setHostSearch(""); }} className="text-xs text-amber-700">변경</button>
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
                      <p className="text-xs text-amber-700 px-3 py-2">없음</p>
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
              <button onClick={() => { setShowAddModal(false); setAddError(""); }} className="px-4 py-2 text-sm text-amber-900">취소</button>
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
