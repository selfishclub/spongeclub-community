"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
  phone_last4: string;
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">멤버 관리</h1>

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
                  <button
                    onClick={() => setAdjustModal(member)}
                    className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200"
                  >
                    셸 조정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-amber-500">멤버가 없습니다.</p>
        )}
      </div>

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
