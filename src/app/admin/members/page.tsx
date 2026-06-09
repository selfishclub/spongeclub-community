"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  phone_last4: string;
  email: string | null;
  slack_user_id: string | null;
  shell_balance: number;
  group_number: number | null;
  cohort: number | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [slackFilter, setSlackFilter] = useState("");
  const [cohortFilter, setCohortFilter] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "group_number" | "shell_balance" | "created_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [adjustModal, setAdjustModal] = useState<Member | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [loading, setLoading] = useState(false);

  // 일괄 선택
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allFilteredIds = filtered.map((m) => m.id);
    const allSelected = allFilteredIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allFilteredIds.forEach((id) => next.delete(id));
      } else {
        allFilteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkAdjust = async () => {
    if (!bulkAmount || !bulkReason || selectedIds.size === 0) return;
    setBulkLoading(true);

    const promises = Array.from(selectedIds).map((memberId) =>
      fetch("/api/admin/members/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount: parseInt(bulkAmount),
          reason: bulkReason,
        }),
      })
    );

    await Promise.all(promises);
    setShowBulkModal(false);
    setBulkAmount("");
    setBulkReason("");
    setBulkLoading(false);
    setSelectedIds(new Set());
    fetchMembers();
  };

  // 멤버 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    phone_last4: "",
    email: "",
    slack_user_id: "",
    group_number: "" as string,
    cohort: "2" as string,
    survey_completed: false,
    is_admin: false,
  });
  const [addError, setAddError] = useState("");

  // 멤버 수정 모달
  const [editModal, setEditModal] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone_last4: "",
    email: "",
    slack_user_id: "",
    group_number: "" as string,
    cohort: "" as string,
    is_admin: false,
    is_active: true,
  });
  const [editError, setEditError] = useState("");

  const fetchMembers = () => {
    fetch("/api/admin/members")
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: typeof sortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const filtered = members
    .filter((m) => {
      const matchSearch =
        !search ||
        m.name.includes(search) ||
        m.slack_user_id?.includes(search);
      const matchGroup =
        !groupFilter || String(m.group_number) === groupFilter;
      const matchActive =
        !activeFilter ||
        (activeFilter === "active" ? m.is_active : !m.is_active);
      const matchSlack =
        !slackFilter ||
        (slackFilter === "linked" ? !!m.slack_user_id : !m.slack_user_id);
      const matchCohort =
        !cohortFilter || String(m.cohort ?? 1) === cohortFilter;
      return matchSearch && matchGroup && matchActive && matchSlack && matchCohort;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "shell_balance") return (a.shell_balance - b.shell_balance) * dir;
      if (sortKey === "group_number") return ((a.group_number ?? 99) - (b.group_number ?? 99)) * dir;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });

  const handleAdjust = async () => {
    if (!adjustModal || !adjustAmount || !adjustReason) return;
    setLoading(true);

    await fetch("/api/admin/members/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: adjustModal.id,
        amount: parseInt(adjustAmount),
        reason: adjustReason,
      }),
    });

    setAdjustModal(null);
    setAdjustAmount("");
    setAdjustReason("");
    setLoading(false);
    fetchMembers();
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.phone_last4) {
      setAddError("이름과 전화번호 뒷4자리는 필수입니다.");
      return;
    }
    if (addForm.phone_last4.length !== 4) {
      setAddError("전화번호 뒷4자리는 정확히 4자리여야 합니다.");
      return;
    }

    setLoading(true);
    setAddError("");

    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addForm,
        group_number: addForm.group_number ? parseInt(addForm.group_number) : null,
        cohort: addForm.cohort ? parseInt(addForm.cohort) : 2,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAddError(data.error || "등록에 실패했습니다.");
      setLoading(false);
      return;
    }

    setShowAddModal(false);
    setAddForm({
      name: "",
      phone_last4: "",
      email: "",
      slack_user_id: "",
      group_number: "",
      cohort: "2",
      survey_completed: false,
      is_admin: false,
    });
    setLoading(false);
    fetchMembers();
  };

  const openEditModal = (member: Member) => {
    setEditModal(member);
    setEditForm({
      name: member.name,
      phone_last4: member.phone_last4,
      email: member.email || "",
      slack_user_id: member.slack_user_id || "",
      group_number: member.group_number ? String(member.group_number) : "",
      cohort: member.cohort != null ? String(member.cohort) : "1",
      is_admin: member.is_admin,
      is_active: member.is_active,
    });
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editModal) return;
    if (!editForm.name || !editForm.phone_last4) {
      setEditError("이름과 전화번호 뒷4자리는 필수입니다.");
      return;
    }
    if (editForm.phone_last4.length !== 4) {
      setEditError("전화번호 뒷4자리는 정확히 4자리여야 합니다.");
      return;
    }

    setLoading(true);
    setEditError("");

    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editModal.id,
        ...editForm,
        group_number: editForm.group_number ? parseInt(editForm.group_number) : null,
        cohort: editForm.cohort ? parseInt(editForm.cohort) : 1,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setEditError(data.error || "수정에 실패했습니다.");
      setLoading(false);
      return;
    }

    setEditModal(null);
    setLoading(false);
    fetchMembers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">멤버 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-xs font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition-opacity"
        >
          + 멤버 추가
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="이름, Slack ID 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm"
        >
          <option value="">전체 조</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={String(n)}>{n}조</option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-3 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm"
        >
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
        <select
          value={slackFilter}
          onChange={(e) => setSlackFilter(e.target.value)}
          className="px-3 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm"
        >
          <option value="">Slack 전체</option>
          <option value="linked">연결됨</option>
          <option value="unlinked">미연결</option>
        </select>
        <select
          value={cohortFilter}
          onChange={(e) => setCohortFilter(e.target.value)}
          className="px-3 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm"
        >
          <option value="">전체 기수</option>
          <option value="0">운영진</option>
          <option value="1">1기</option>
          <option value="2">2기</option>
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest">
          {filtered.length}명 / 전체 {members.length}명
          {selectedIds.size > 0 && (
            <span className="ml-2 text-[var(--ink)]">
              ({selectedIds.size}명 선택됨)
            </span>
          )}
        </p>
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (selectedIds.size === 1) {
                  const m = members.find((m) => selectedIds.has(m.id));
                  if (m) openEditModal(m);
                } else {
                  alert("수정은 1명만 선택해주세요.");
                }
              }}
              className="px-3 py-1.5 text-xs font-bold border-2 border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            >
              수정
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[var(--yellow)] text-[var(--ink)] hover:opacity-80 transition-opacity"
            >
              셸 조정
            </button>
            <button
              onClick={async () => {
                const names = members.filter((m) => selectedIds.has(m.id)).map((m) => m.name).join(", ");
                if (!confirm(`${names}의 PIN을 0000으로 초기화할까요?`)) return;
                await Promise.all(
                  Array.from(selectedIds).map((id) =>
                    fetch("/api/admin/members", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id, pin: "0000", pin_changed: false }),
                    })
                  )
                );
                alert("PIN이 초기화되었습니다.");
              }}
              className="px-3 py-1.5 text-xs font-bold bg-[var(--ink-05)] text-[var(--ink-50)] hover:bg-[var(--ink-10)] transition-colors"
            >
              PIN 초기화
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs text-[var(--ink-30)] hover:text-[var(--ink)]"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      <div className="border-2 border-[var(--ink-10)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--ink-05)]">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id))}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("name")}>이름{sortIndicator("name")}</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">기수</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("group_number")}>조{sortIndicator("group_number")}</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">Slack ID</th>
              <th className="text-right px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort("shell_balance")}>잔고{sortIndicator("shell_balance")}</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id} className={`border-t border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors ${selectedIds.has(member.id) ? "bg-[var(--yellow-dim)]" : ""}`}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => toggleSelect(member.id)}
                  />
                </td>
                <td className="px-4 py-3 font-bold text-[var(--ink)]">
                  <Link href={`/admin/members/${member.id}`} className="hover:underline">
                    {member.name}
                  </Link>
                  {member.is_admin && (
                    <span className="ml-2 text-[10px] font-extrabold bg-[var(--yellow)] text-[var(--ink)] px-1.5 py-0.5 uppercase tracking-wider">
                      어드민
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {member.cohort === 0 ? (
                    <span className="text-[10px] font-extrabold bg-[var(--ink)] text-[var(--paper)] px-1.5 py-0.5">운영</span>
                  ) : (
                    <span className="text-[var(--ink-50)]">{member.cohort ?? 1}기</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-[var(--ink-50)]">
                  {member.group_number ? `${member.group_number}조` : "-"}
                </td>
                <td className="px-4 py-3 text-[var(--ink-50)] text-xs font-mono">
                  {member.slack_user_id || "-"}
                </td>
                <td className="px-4 py-3 text-right font-extrabold text-[var(--ink)] tabular-nums">
                  {member.shell_balance}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider ${member.is_active ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--ink-10)] text-[var(--ink-30)]"}`}
                  >
                    {member.is_active ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-[var(--ink-30)] text-sm">멤버가 없습니다.</p>
        )}
      </div>

      {/* 멤버 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-5">
              멤버 추가
            </h2>

            {addError && (
              <p className="text-sm text-red-500 font-medium bg-red-50 px-3 py-2 mb-4">
                {addError}
              </p>
            )}

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
              placeholder="홍길동"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              전화번호 뒷4자리 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={4}
              value={addForm.phone_last4}
              onChange={(e) => setAddForm({ ...addForm, phone_last4: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
              placeholder="1234"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              이메일 (선택)
            </label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
              placeholder="example@email.com"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              Slack User ID (선택)
            </label>
            <input
              type="text"
              value={addForm.slack_user_id}
              onChange={(e) => setAddForm({ ...addForm, slack_user_id: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
              placeholder="U0123456789"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              조 (선택)
            </label>
            <select
              value={addForm.group_number}
              onChange={(e) => setAddForm({ ...addForm, group_number: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            >
              <option value="">선택 안 함</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={String(n)}>{n}조</option>
              ))}
            </select>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-[var(--ink-50)] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={addForm.survey_completed}
                  onChange={(e) => setAddForm({ ...addForm, survey_completed: e.target.checked })}
                />
                사전 설문 완료
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--ink-50)] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={addForm.is_admin}
                  onChange={(e) => setAddForm({ ...addForm, is_admin: e.target.checked })}
                />
                어드민
              </label>
            </div>

            {addForm.survey_completed && (
              <p className="text-xs text-[var(--ink-50)] bg-[var(--yellow-dim)] px-3 py-2 mb-4 font-medium">
                사전 설문 완료 시 가입 보너스 10셸이 자동 지급됩니다.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowAddModal(false); setAddError(""); }}
                className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={loading || !addForm.name || !addForm.phone_last4}
                className="px-4 py-2.5 text-sm font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {loading ? "처리 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 수정 모달 */}
      {editModal && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-5">
              멤버 수정 -- {editModal.name}
            </h2>

            {editError && (
              <p className="text-sm text-red-500 font-medium bg-red-50 px-3 py-2 mb-4">
                {editError}
              </p>
            )}

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              전화번호 뒷4자리 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={4}
              value={editForm.phone_last4}
              onChange={(e) => setEditForm({ ...editForm, phone_last4: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              이메일
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              Slack User ID
            </label>
            <input
              type="text"
              value={editForm.slack_user_id}
              onChange={(e) => setEditForm({ ...editForm, slack_user_id: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">기수</label>
            <select
              value={editForm.cohort}
              onChange={(e) => setEditForm({ ...editForm, cohort: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            >
              <option value="0">운영진</option>
              <option value="1">1기</option>
              <option value="2">2기</option>
            </select>

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">조</label>
            <select
              value={editForm.group_number}
              onChange={(e) => setEditForm({ ...editForm, group_number: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-3"
            >
              <option value="">선택 안 함</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={String(n)}>{n}조</option>
              ))}
            </select>

            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2 text-sm text-[var(--ink-50)] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                />
                어드민
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--ink-50)] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
                활성
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setEditModal(null); setEditError(""); }}
                className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={loading || !editForm.name || !editForm.phone_last4}
                className="px-4 py-2.5 text-sm font-extrabold bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {loading ? "처리 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 셸 조정 모달 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-2">
              셸 일괄 조정
            </h2>
            <p className="text-xs text-[var(--ink-30)] mb-5 font-medium">
              {selectedIds.size}명 선택됨: {members.filter((m) => selectedIds.has(m.id)).map((m) => m.name).join(", ")}
            </p>

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              조정 수량 (양수: 지급 / 음수: 차감)
            </label>
            <input
              type="number"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-4"
              placeholder="예: 10 또는 -5"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              사유 (필수)
            </label>
            <input
              type="text"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-6"
              placeholder="예: 1주차 활동 보너스"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowBulkModal(false); setBulkAmount(""); setBulkReason(""); }}
                className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium"
              >
                취소
              </button>
              <button
                onClick={handleBulkAdjust}
                disabled={bulkLoading || !bulkAmount || !bulkReason}
                className="px-4 py-2.5 text-sm font-extrabold bg-[var(--yellow)] text-[var(--ink)] hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                {bulkLoading ? "처리 중..." : `${selectedIds.size}명 일괄 조정`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 셸 조정 모달 */}
      {adjustModal && (
        <div className="fixed inset-0 bg-[var(--ink)]/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-7 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-2">
              셸 조정 -- {adjustModal.name}
            </h2>
            <p className="text-sm text-[var(--ink-30)] mb-5 font-medium">
              현재 잔고: {adjustModal.shell_balance}개
            </p>

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              조정 수량 (양수: 지급 / 음수: 차감)
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-4"
              placeholder="예: 10 또는 -5"
            />

            <label className="block text-xs font-extrabold text-[var(--ink-30)] mb-1.5 uppercase tracking-widest">
              사유 (필수)
            </label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium mb-6"
              placeholder="예: 가입 보너스 추가 지급"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAdjustModal(null)}
                className="px-4 py-2.5 text-sm text-[var(--ink-30)] hover:text-[var(--ink)] font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAdjust}
                disabled={loading || !adjustAmount || !adjustReason}
                className="px-4 py-2.5 text-sm font-extrabold bg-[var(--yellow)] text-[var(--ink)] hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                {loading ? "처리 중..." : "조정하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
