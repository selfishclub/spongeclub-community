"use client";

import { useEffect, useState } from "react";

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

interface Attendee {
  id: string;
  status: string;
  registered_at: string;
  member: { id: string; name: string } | null;
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

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDING: { label: "신청 진행 중", classes: "bg-[var(--yellow)] text-[var(--ink)]" },
  APPROVED: { label: "진행 확정", classes: "bg-[var(--ink)] text-[var(--paper)]" },
  COMPLETED: { label: "완료", classes: "bg-[var(--ink-10)] text-[var(--ink-50)]" },
  REJECTED: { label: "거부", classes: "bg-red-100 text-red-600" },
  CANCELLED: { label: "취소", classes: "bg-[var(--ink-05)] text-[var(--ink-30)]" },
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

  // 신청자 목록 모달
  const [attendeeSession, setAttendeeSession] = useState<Session | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // 수동 등록 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [hostSearch, setHostSearch] = useState("");
  const [selectedHost, setSelectedHost] = useState<MemberOption | null>(null);
  const [showHostList, setShowHostList] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "", description: "", category: "AI", date: "", time: "19:00",
    duration: 60, entry_cost: 5, capacity: "", status: "APPROVED",
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchSessions = () => {
    fetch(`/api/admin/sessions?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions || []));
  };

  useEffect(() => { fetchSessions(); }, [statusFilter]);

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
      title: s.title, description: s.description || "", category: s.category,
      date: d.toISOString().split("T")[0], time: d.toTimeString().slice(0, 5),
      duration: s.duration_minutes, entry_cost: s.entry_cost,
      capacity: s.capacity ? String(s.capacity) : "", status: s.status,
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editSession) return;
    setEditLoading(true); setEditError("");
    const scheduled_at = new Date(`${editForm.date}T${editForm.time}:00+09:00`).toISOString();
    const res = await fetch("/api/admin/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editSession.id, title: editForm.title, description: editForm.description,
        category: editForm.category, scheduled_at, duration_minutes: editForm.duration,
        entry_cost: editForm.entry_cost, capacity: editForm.capacity ? parseInt(editForm.capacity) : null,
        status: editForm.status,
      }),
    });
    if (!res.ok) { const data = await res.json(); setEditError(data.error || "수정에 실패했습니다."); setEditLoading(false); return; }
    setEditSession(null); setEditLoading(false); fetchSessions();
  };

  const handleAction = async (id: string, action: string) => {
    setLoading(id);
    await fetch("/api/admin/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    setLoading(null); fetchSessions();
  };

  const openAttendees = async (s: Session) => {
    setAttendeeSession(s);
    setAttendeesLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions/attendees?session_id=${s.id}`);
      const data = await res.json();
      setAttendees(data.attendees || []);
    } catch {
      setAttendees([]);
    }
    setAttendeesLoading(false);
  };

  const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(hostSearch.toLowerCase()));
  const forceFilteredMembers = members.filter((m) => m.name.toLowerCase().includes(forceSearch.toLowerCase()));

  const handleForceRegister = async (memberId: string, memberName: string) => {
    if (!forceSession) return;
    if (!confirm(`${memberName}님을 "${forceSession.title}"에 강제 신청할까요? 셸이 차감됩니다.`)) return;
    setForceLoading(true); setForceError(""); setForceSuccess("");
    const res = await fetch("/api/admin/sessions/force-register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: forceSession.id, member_id: memberId }),
    });
    const data = await res.json(); setForceLoading(false);
    if (!res.ok) { setForceError(data.error || "신청에 실패했어요."); return; }
    setForceSuccess(`${memberName}님 신청 완료!`); setForceSearch(""); fetchSessions();
  };

  const handleAdd = async () => {
    if (!selectedHost || !addForm.title || !addForm.date) { setAddError("진행자, 제목, 날짜는 필수입니다."); return; }
    setAddLoading(true); setAddError("");
    const scheduled_at = new Date(`${addForm.date}T${addForm.time}:00+09:00`).toISOString();
    const res = await fetch("/api/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host_id: selectedHost.id, title: addForm.title, description: addForm.description,
        category: addForm.category, scheduled_at, duration_minutes: addForm.duration,
        entry_cost: addForm.entry_cost, capacity: addForm.capacity ? parseInt(addForm.capacity) : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error || "등록에 실패했습니다."); setAddLoading(false); return; }
    if (addForm.status === "APPROVED" && data.session?.id) {
      await fetch("/api/admin/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: data.session.id, action: "approve" }) });
    }
    setShowAddModal(false); setSelectedHost(null); setHostSearch("");
    setAddForm({ title: "", description: "", category: "AI", date: "", time: "19:00", duration: 60, entry_cost: 5, capacity: "", status: "APPROVED" });
    setAddLoading(false); fetchSessions();
  };

  const inputClass = "w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium";
  const labelClass = "block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">공유회 관리</h1>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2.5 text-xs font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity">
          + 공유회 등록
        </button>
      </div>

      <div className="flex border-2 border-[var(--ink)] mb-6 w-fit">
        {[["ALL", "전체"], ["PENDING", "신청 진행 중"], ["APPROVED", "진행 확정"], ["COMPLETED", "완료"], ["CANCELLED", "취소"]].map(([key, label], i) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`px-4 py-2.5 text-xs font-extrabold transition-colors ${i > 0 ? "border-l-2 border-[var(--ink)]" : ""} ${statusFilter === key ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"}`}>
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">{sessions.length}건</p>

      <div className="border-2 border-[var(--ink-10)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--ink-05)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">제목</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">카테고리</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">진행자</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">일시</th>
              <th className="text-right px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">가격</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">참석</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">상태</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const hostName = (s.host as unknown as { name: string } | null)?.name ?? "-";
              const st = STATUS_CONFIG[s.status] || STATUS_CONFIG.PENDING;
              return (
                <tr key={s.id} className="border-t border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors">
                  <td className="px-4 py-3 font-bold text-[var(--ink)]">
                    {s.title}
                    {s.description && <p className="text-xs text-[var(--ink-30)] font-normal truncate max-w-[200px]">{s.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-extrabold bg-[var(--ink)] text-[var(--paper)] px-1.5 py-0.5 uppercase tracking-wider">
                      {CATEGORY_LABELS[s.category] || s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-50)]">{hostName}</td>
                  <td className="px-4 py-3 text-[var(--ink-50)] text-xs">
                    {new Date(s.scheduled_at).toLocaleDateString("ko-KR")}<br/>
                    {new Date(s.scheduled_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-[var(--ink)] tabular-nums">{s.entry_cost} 셸</td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <button
                      onClick={() => openAttendees(s)}
                      className="text-[var(--ink-50)] hover:text-[var(--ink)] hover:underline underline-offset-2 font-bold transition-colors"
                    >
                      {s.attendee_count}{s.capacity ? `/${s.capacity}` : ""}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider ${st.classes}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button onClick={() => openEditSession(s)} className="px-2 py-1 text-xs font-bold border-2 border-[var(--ink-10)] text-[var(--ink-50)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors">수정</button>
                      {(s.status === "APPROVED" || s.status === "PENDING") && (
                        <button onClick={() => { setForceSession(s); setForceSearch(""); setForceError(""); setForceSuccess(""); }} className="px-2 py-1 text-xs font-bold border-2 border-[var(--ink-10)] text-[var(--ink-50)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors">참석자 추가</button>
                      )}
                      {s.status === "APPROVED" && (
                        <button onClick={() => handleAction(s.id, "complete")} disabled={loading === s.id} className="px-2 py-1 text-xs font-extrabold bg-[var(--yellow)] text-[var(--ink)] hover:opacity-80 disabled:opacity-40">완료</button>
                      )}
                      {(s.status === "APPROVED" || s.status === "PENDING") && (
                        <button onClick={() => { if (confirm("이 공유회를 취소할까요?")) handleAction(s.id, "cancel"); }} disabled={loading === s.id} className="px-2 py-1 text-xs font-bold bg-[var(--ink-05)] text-[var(--ink-30)] hover:bg-[var(--ink-10)] disabled:opacity-40">취소</button>
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
          <p className="text-center py-8 text-[var(--ink-30)] text-sm">해당 상태의 공유회가 없습니다.</p>
        )}
      </div>

      {/* 공유회 수정 모달 */}
      {editSession && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-5">공유회 수정</h2>
            {editError && <p className="text-sm text-red-500 font-medium bg-red-50 px-3 py-2 mb-4">{editError}</p>}

            <label className={labelClass}>제목</label>
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={`${inputClass} mb-3`} />

            <label className={labelClass}>설명</label>
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className={`${inputClass} mb-3 resize-none`} />

            <label className={labelClass}>카테고리</label>
            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={`${inputClass} mb-3`}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelClass}>날짜</label><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>시간</label><input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className={inputClass} /></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div><label className={labelClass}>가격</label><input type="number" min={5} max={10} value={editForm.entry_cost} onChange={(e) => setEditForm({ ...editForm, entry_cost: parseInt(e.target.value) || 5 })} className={inputClass} /></div>
              <div><label className={labelClass}>길이(분)</label><select value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })} className={inputClass}><option value={30}>30분</option><option value={60}>60분</option><option value={90}>90분</option><option value={120}>120분</option></select></div>
              <div><label className={labelClass}>정원</label><input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} placeholder="무제한" min={1} className={inputClass} /></div>
            </div>

            <label className={labelClass}>상태</label>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={`${inputClass} mb-5`}>
              <option value="PENDING">신청 진행 중</option><option value="APPROVED">진행 확정</option><option value="COMPLETED">완료</option><option value="CANCELLED">취소</option>
            </select>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditSession(null)} className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium">취소</button>
              <button onClick={handleEditSave} disabled={editLoading || !editForm.title || !editForm.date} className="px-4 py-2.5 text-sm font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 disabled:opacity-40 transition-opacity">
                {editLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 강제 참석자 추가 모달 */}
      {forceSession && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-sm mx-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-1">참석자 강제 신청</h2>
            <p className="text-sm text-[var(--ink-30)] mb-4 font-medium">{forceSession.title} ({forceSession.entry_cost} 셸)</p>

            {forceError && <p className="text-sm text-red-500 font-medium bg-red-50 px-3 py-2 mb-3">{forceError}</p>}
            {forceSuccess && <p className="text-sm text-[var(--ink)] font-bold bg-[var(--yellow-dim)] px-3 py-2 mb-3">{forceSuccess}</p>}

            <input type="text" value={forceSearch} onChange={(e) => setForceSearch(e.target.value)} placeholder="멤버 이름 검색..."
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm mb-2" />

            <div className="max-h-48 overflow-y-auto border-2 border-[var(--ink-10)]">
              {forceSearch && forceFilteredMembers.length === 0 && <p className="text-xs text-[var(--ink-30)] px-3 py-2">검색 결과 없음</p>}
              {forceSearch && forceFilteredMembers.map((m) => (
                <button key={m.id} onClick={() => handleForceRegister(m.id, m.name)} disabled={forceLoading}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--yellow-dim)] border-b border-[var(--ink-10)] last:border-b-0 disabled:opacity-40 font-medium text-[var(--ink)]">
                  {m.name}
                </button>
              ))}
              {!forceSearch && <p className="text-xs text-[var(--ink-30)] px-3 py-2">이름을 입력하세요</p>}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setForceSession(null)} className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 신청자 목록 모달 */}
      {attendeeSession && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-sm mx-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-1">신청자 목록</h2>
            <p className="text-sm text-[var(--ink-30)] mb-4 font-medium">{attendeeSession.title}</p>

            {attendeesLoading ? (
              <p className="text-sm text-[var(--ink-30)] py-4 text-center">불러오는 중...</p>
            ) : attendees.length === 0 ? (
              <p className="text-sm text-[var(--ink-30)] py-4 text-center">신청자가 없습니다.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {attendees.filter((a) => a.status !== "CANCELLED").map((a) => (
                    <span key={a.id} className="text-sm font-bold text-[var(--ink)]">@{a.member?.name ?? "-"}</span>
                  ))}
                </div>
                {attendees.some((a) => a.status === "CANCELLED") && (
                  <div className="mt-3 pt-3 border-t border-[var(--ink-10)]">
                    <p className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-1.5">취소</p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {attendees.filter((a) => a.status === "CANCELLED").map((a) => (
                        <span key={a.id} className="text-sm text-[var(--ink-30)] line-through">@{a.member?.name ?? "-"}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={() => setAttendeeSession(null)} className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 공유회 수동 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-5">공유회 등록</h2>
            {addError && <p className="text-sm text-red-500 font-medium bg-red-50 px-3 py-2 mb-4">{addError}</p>}

            <label className={labelClass}>진행자 <span className="text-red-500">*</span></label>
            {selectedHost ? (
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--ink-05)] border-2 border-[var(--yellow)] mb-3">
                <span className="text-sm font-bold text-[var(--ink)]">{selectedHost.name}</span>
                <button onClick={() => { setSelectedHost(null); setHostSearch(""); }} className="text-xs text-[var(--ink-30)] hover:text-[var(--ink)]">변경</button>
              </div>
            ) : (
              <div className="relative mb-3">
                <input type="text" value={hostSearch} onChange={(e) => { setHostSearch(e.target.value); setShowHostList(true); }} onFocus={() => setShowHostList(true)} placeholder="이름 검색..." className={inputClass} />
                {showHostList && hostSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg max-h-32 overflow-y-auto">
                    {filteredMembers.length === 0 ? <p className="text-xs text-[var(--ink-30)] px-3 py-2">없음</p> : filteredMembers.map((m) => (
                      <button key={m.id} onClick={() => { setSelectedHost(m); setShowHostList(false); setHostSearch(""); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--yellow-dim)] font-medium text-[var(--ink)]">{m.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label className={labelClass}>제목 <span className="text-red-500">*</span></label>
            <input type="text" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} className={`${inputClass} mb-3`} />

            <label className={labelClass}>설명</label>
            <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} rows={2} className={`${inputClass} mb-3 resize-none`} />

            <label className={labelClass}>카테고리</label>
            <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className={`${inputClass} mb-3`}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelClass}>날짜 <span className="text-red-500">*</span></label><input type="date" value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>시간</label><input type="time" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })} className={inputClass} /></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div><label className={labelClass}>가격 (셸)</label><input type="number" min={5} max={10} value={addForm.entry_cost} onChange={(e) => setAddForm({ ...addForm, entry_cost: parseInt(e.target.value) || 5 })} className={inputClass} /></div>
              <div><label className={labelClass}>길이 (분)</label><select value={addForm.duration} onChange={(e) => setAddForm({ ...addForm, duration: parseInt(e.target.value) })} className={inputClass}><option value={30}>30분</option><option value={60}>60분</option><option value={90}>90분</option><option value={120}>120분</option></select></div>
              <div><label className={labelClass}>정원</label><input type="number" value={addForm.capacity} onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })} placeholder="무제한" min={1} className={inputClass} /></div>
            </div>

            <label className={labelClass}>등록 상태</label>
            <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className={`${inputClass} mb-5`}>
              <option value="PENDING">신청 진행 중 (알림 신청 5명 모집)</option>
              <option value="APPROVED">진행 확정 (바로 참여 신청 받기)</option>
            </select>

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowAddModal(false); setAddError(""); }} className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium">취소</button>
              <button onClick={handleAdd} disabled={addLoading || !selectedHost || !addForm.title || !addForm.date} className="px-4 py-2.5 text-sm font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 disabled:opacity-40 transition-opacity">
                {addLoading ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
