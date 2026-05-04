"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
  phone_last4: string;
  email: string | null;
  slack_user_id: string | null;
  shell_balance: number;
  group_number: number | null;
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
      return matchSearch && matchGroup && matchActive && matchSlack;
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
        <h1 className="text-2xl font-bold text-amber-900">멤버 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
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
          className="px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">전체 조</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={String(n)}>{n}조</option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
        <select
          value={slackFilter}
          onChange={(e) => setSlackFilter(e.target.value)}
          className="px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Slack 전체</option>
          <option value="linked">연결됨</option>
          <option value="unlinked">미연결</option>
        </select>
      </div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-amber-600">
          총 <strong>{filtered.length}</strong>명 / 전체 {members.length}명
          {selectedIds.size > 0 && (
            <span className="ml-2 text-amber-800 font-medium">
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
              className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100"
            >
              수정
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
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
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              PIN 초기화
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs text-amber-500 hover:text-amber-700"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id))}
                  onChange={toggleSelectAll}
                  className="rounded border-amber-300"
                />
              </th>
              <th className="text-left px-4 py-3 text-amber-800 cursor-pointer select-none" onClick={() => handleSort("name")}>이름{sortIndicator("name")}</th>
              <th className="text-center px-4 py-3 text-amber-800 cursor-pointer select-none" onClick={() => handleSort("group_number")}>조{sortIndicator("group_number")}</th>
              <th className="text-left px-4 py-3 text-amber-800">Slack ID</th>
              <th className="text-right px-4 py-3 text-amber-800 cursor-pointer select-none" onClick={() => handleSort("shell_balance")}>🐚 잔고{sortIndicator("shell_balance")}</th>
              <th className="text-center px-4 py-3 text-amber-800">상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id} className={`border-t border-amber-100 ${selectedIds.has(member.id) ? "bg-amber-50" : ""}`}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => toggleSelect(member.id)}
                    className="rounded border-amber-300"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-amber-900">
                  {member.name}
                  {member.is_admin && (
                    <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                      어드민
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-amber-700">
                  {member.group_number ? `${member.group_number}조` : "-"}
                </td>
                <td className="px-4 py-3 text-amber-700 text-xs font-mono">
                  {member.slack_user_id || "-"}
                </td>
                <td className="px-4 py-3 text-right font-bold text-amber-900">
                  {member.shell_balance}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${member.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {member.is_active ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-amber-500">멤버가 없습니다.</p>
        )}
      </div>

      {/* 멤버 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-amber-900 mb-4">
              멤버 추가
            </h2>

            {addError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">
                {addError}
              </p>
            )}

            <label className="block text-sm text-amber-800 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) =>
                setAddForm({ ...addForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="홍길동"
            />

            <label className="block text-sm text-amber-800 mb-1">
              전화번호 뒷4자리 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={4}
              value={addForm.phone_last4}
              onChange={(e) =>
                setAddForm({ ...addForm, phone_last4: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="1234"
            />

            <label className="block text-sm text-amber-800 mb-1">
              이메일 (선택)
            </label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm({ ...addForm, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="example@email.com"
            />

            <label className="block text-sm text-amber-800 mb-1">
              Slack User ID (선택)
            </label>
            <input
              type="text"
              value={addForm.slack_user_id}
              onChange={(e) =>
                setAddForm({ ...addForm, slack_user_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="U0123456789"
            />

            <label className="block text-sm text-amber-800 mb-1">
              조 (선택)
            </label>
            <select
              value={addForm.group_number}
              onChange={(e) =>
                setAddForm({ ...addForm, group_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">선택 안 함</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={String(n)}>
                  {n}조
                </option>
              ))}
            </select>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.survey_completed}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      survey_completed: e.target.checked,
                    })
                  }
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                />
                사전 설문 완료
              </label>
              <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.is_admin}
                  onChange={(e) =>
                    setAddForm({ ...addForm, is_admin: e.target.checked })
                  }
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                />
                어드민
              </label>
            </div>

            {addForm.survey_completed && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-4">
                🐚 사전 설문 완료 시 가입 보너스 10셸이 자동 지급됩니다.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddError("");
                }}
                className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={loading || !addForm.name || !addForm.phone_last4}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "처리 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 수정 모달 */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-amber-900 mb-4">
              멤버 수정 — {editModal.name}
            </h2>

            {editError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">
                {editError}
              </p>
            )}

            <label className="block text-sm text-amber-800 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <label className="block text-sm text-amber-800 mb-1">
              전화번호 뒷4자리 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={4}
              value={editForm.phone_last4}
              onChange={(e) =>
                setEditForm({ ...editForm, phone_last4: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <label className="block text-sm text-amber-800 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <label className="block text-sm text-amber-800 mb-1">
              Slack User ID
            </label>
            <input
              type="text"
              value={editForm.slack_user_id}
              onChange={(e) =>
                setEditForm({ ...editForm, slack_user_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <label className="block text-sm text-amber-800 mb-1">조</label>
            <select
              value={editForm.group_number}
              onChange={(e) =>
                setEditForm({ ...editForm, group_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-amber-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">선택 안 함</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={String(n)}>
                  {n}조
                </option>
              ))}
            </select>

            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_admin}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_admin: e.target.checked })
                  }
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                />
                어드민
              </label>
              <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                />
                활성
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setEditModal(null);
                  setEditError("");
                }}
                className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={loading || !editForm.name || !editForm.phone_last4}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "처리 중..." : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 셸 조정 모달 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-amber-900 mb-4">
              셸 일괄 조정 — {selectedIds.size}명 선택됨
            </h2>
            <p className="text-xs text-amber-600 mb-4">
              {members.filter((m) => selectedIds.has(m.id)).map((m) => m.name).join(", ")}
            </p>

            <label className="block text-sm text-amber-800 mb-1">
              조정 수량 (양수: 지급 / 음수: 차감)
            </label>
            <input
              type="number"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="예: 10 또는 -5"
            />

            <label className="block text-sm text-amber-800 mb-1">
              사유 (필수)
            </label>
            <input
              type="text"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="예: 1주차 활동 보너스"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowBulkModal(false); setBulkAmount(""); setBulkReason(""); }}
                className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900"
              >
                취소
              </button>
              <button
                onClick={handleBulkAdjust}
                disabled={bulkLoading || !bulkAmount || !bulkReason}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {bulkLoading ? "처리 중..." : `${selectedIds.size}명 일괄 조정`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 셸 조정 모달 */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-amber-900 mb-4">
              🐚 셸 조정 — {adjustModal.name}
            </h2>
            <p className="text-sm text-amber-600 mb-4">
              현재 잔고: {adjustModal.shell_balance}개
            </p>

            <label className="block text-sm text-amber-800 mb-1">
              조정 수량 (양수: 지급 / 음수: 차감)
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="예: 10 또는 -5"
            />

            <label className="block text-sm text-amber-800 mb-1">
              사유 (필수)
            </label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="예: 가입 보너스 추가 지급"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAdjustModal(null)}
                className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900"
              >
                취소
              </button>
              <button
                onClick={handleAdjust}
                disabled={loading || !adjustAmount || !adjustReason}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
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
