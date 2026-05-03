"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
  phone_last4: string;
  email: string | null;
  slack_user_id: string | null;
  shell_balance: number;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [adjustModal, setAdjustModal] = useState<Member | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [loading, setLoading] = useState(false);

  // 멤버 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    phone_last4: "",
    email: "",
    slack_user_id: "",
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

  const filtered = members.filter(
    (m) =>
      m.name.includes(search) ||
      m.phone_last4.includes(search) ||
      m.slack_user_id?.includes(search)
  );

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
      body: JSON.stringify(addForm),
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
      body: JSON.stringify({ id: editModal.id, ...editForm }),
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

      <input
        type="text"
        placeholder="이름, 전화번호, Slack ID로 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-80 px-4 py-2 border border-amber-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />

      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="text-left px-4 py-3 text-amber-800">이름</th>
              <th className="text-left px-4 py-3 text-amber-800">뒷4자리</th>
              <th className="text-left px-4 py-3 text-amber-800">Slack ID</th>
              <th className="text-right px-4 py-3 text-amber-800">🐚 잔고</th>
              <th className="text-center px-4 py-3 text-amber-800">상태</th>
              <th className="text-center px-4 py-3 text-amber-800">액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id} className="border-t border-amber-100">
                <td className="px-4 py-3 font-medium text-amber-900">
                  {member.name}
                  {member.is_admin && (
                    <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                      어드민
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-amber-700">
                  {member.phone_last4}
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
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(member)}
                      className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded border border-amber-200 hover:bg-amber-100"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setAdjustModal(member)}
                      className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200"
                    >
                      셸 조정
                    </button>
                  </div>
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
