"use client";

import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  reason: string;
  reason_detail: string;
  related_member_name: string | null;
  created_at: string;
}

const REASON_LABELS: Record<string, string> = {
  SIGNUP_BONUS: "가입 보너스",
  SESSION_HOST: "공유회 개최",
  SESSION_ATTEND: "공유회 입장",
  SESSION_REFUND: "공유회 환불",
  SNS_VERIFY: "SNS 인증",
  SKILL_SHARE: "스킬 공유",
  MEMBER_GIFT: "셸 선물",
  TIP_GIVEN: "팁 보냄",
  TIP_RECEIVED: "팁 받음",
  ADMIN_ADJUSTMENT: "어드민 조정",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reasonFilter, setReasonFilter] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchTransactions = () => {
    const params = reasonFilter ? `?reason=${reasonFilter}` : "";
    fetch(`/api/admin/transactions${params}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []));
  };

  useEffect(() => {
    fetchTransactions();
  }, [reasonFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm("이 트랜잭션을 취소할까요? 반대 금액이 생성되고 잔고가 복구됩니다.")) return;
    setCancelling(id);
    await fetch("/api/admin/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    setCancelling(null);
    fetchTransactions();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">
        트랜잭션 로그
      </h1>

      <div className="mb-6">
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="px-4 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">전체 사유</option>
          {Object.entries(REASON_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="text-left px-4 py-3 text-amber-800">시간</th>
              <th className="text-left px-4 py-3 text-amber-800">멤버</th>
              <th className="text-right px-4 py-3 text-amber-800">셸</th>
              <th className="text-left px-4 py-3 text-amber-800">사유</th>
              <th className="text-left px-4 py-3 text-amber-800">상세</th>
              <th className="text-center px-4 py-3 text-amber-800">액션</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-amber-100">
                <td className="px-4 py-3 text-amber-600 text-xs">
                  {new Date(tx.created_at).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 font-medium text-amber-900">
                  {tx.member_name}
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </td>
                <td className="px-4 py-3 text-amber-700">
                  <span className="bg-amber-50 px-2 py-0.5 rounded text-xs">
                    {REASON_LABELS[tx.reason] || tx.reason}
                  </span>
                </td>
                <td className="px-4 py-3 text-amber-600 text-xs">
                  {tx.reason_detail}
                  {tx.related_member_name && (
                    <span className="ml-1 text-amber-400">
                      ({tx.related_member_name})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {tx.reason_detail?.startsWith("[취소됨]") ? (
                    <span className="text-xs text-gray-400">취소됨</span>
                  ) : tx.reason_detail?.startsWith("[취소]") ? (
                    <span className="text-xs text-gray-400">취소 건</span>
                  ) : (
                    <button
                      onClick={() => handleCancel(tx.id)}
                      disabled={cancelling === tx.id}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {cancelling === tx.id ? "..." : "취소"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="text-center py-8 text-amber-500">
            트랜잭션이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
