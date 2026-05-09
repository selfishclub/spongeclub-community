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

interface MemberOption {
  id: string;
  name: string;
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

  // 멤버 필터
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [memberFilter, setMemberFilter] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState("");

  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(
          (data.members || []).map((m: MemberOption) => ({ id: m.id, name: m.name }))
        );
      });
  }, []);

  const fetchTransactions = () => {
    const params = new URLSearchParams();
    if (reasonFilter) params.set("reason", reasonFilter);
    if (memberFilter) params.set("member_id", memberFilter);
    const qs = params.toString();
    fetch(`/api/admin/transactions${qs ? `?${qs}` : ""}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []));
  };

  useEffect(() => {
    fetchTransactions();
  }, [reasonFilter, memberFilter]);

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

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--ink)] mb-6">
        트랜잭션 로그
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm"
        >
          <option value="">전체 사유</option>
          {Object.entries(REASON_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* 멤버 필터 */}
        <div className="relative">
          {memberFilter ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--yellow-dim)] border-2 border-[var(--yellow)] text-sm">
              <span className="font-bold text-[var(--ink)]">{selectedMemberName}</span>
              <button
                onClick={() => { setMemberFilter(""); setSelectedMemberName(""); setMemberSearch(""); }}
                className="text-[var(--ink-30)] hover:text-[var(--ink)] font-extrabold"
              >
                x
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => { setMemberSearch(e.target.value); setShowMemberDropdown(true); }}
                onFocus={() => setShowMemberDropdown(true)}
                onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                placeholder="멤버 이름으로 필터..."
                className="px-4 py-2.5 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm w-52"
              />
              {showMemberDropdown && memberSearch && (
                <div className="absolute z-10 w-full mt-1 bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg max-h-48 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-[var(--ink-30)] px-3 py-2">검색 결과 없음</p>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setMemberFilter(m.id);
                          setSelectedMemberName(m.name);
                          setMemberSearch("");
                          setShowMemberDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--yellow-dim)] font-medium text-[var(--ink)] border-b border-[var(--ink-05)] last:border-b-0"
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
      </div>

      <p className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">
        {transactions.length}건
      </p>

      <div className="border-2 border-[var(--ink-10)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--ink-05)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">시간</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">멤버</th>
              <th className="text-right px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">셸</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">사유</th>
              <th className="text-left px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">상세</th>
              <th className="text-center px-4 py-3 text-xs font-extrabold text-[var(--ink-50)] uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors">
                <td className="px-4 py-3 text-[var(--ink-30)] text-xs tabular-nums">
                  {new Date(tx.created_at).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 font-bold text-[var(--ink)]">
                  {tx.member_name}
                </td>
                <td
                  className={`px-4 py-3 text-right font-extrabold tabular-nums ${tx.amount > 0 ? "text-[var(--ink)]" : "text-red-500"}`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-extrabold bg-[var(--ink-05)] text-[var(--ink-50)] px-2 py-0.5 uppercase tracking-wider">
                    {REASON_LABELS[tx.reason] || tx.reason}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--ink-50)] text-xs">
                  {tx.reason_detail}
                  {tx.related_member_name && (
                    <span className="ml-1 text-[var(--ink-30)]">
                      ({tx.related_member_name})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {tx.reason_detail?.startsWith("[취소됨]") ? (
                    <span className="text-[10px] font-extrabold text-[var(--ink-30)] bg-[var(--ink-05)] px-2 py-0.5 uppercase tracking-wider">취소됨</span>
                  ) : tx.reason_detail?.startsWith("[취소]") ? (
                    <span className="text-[10px] font-extrabold text-[var(--ink-30)] bg-[var(--ink-05)] px-2 py-0.5 uppercase tracking-wider">취소 건</span>
                  ) : (
                    <button
                      onClick={() => handleCancel(tx.id)}
                      disabled={cancelling === tx.id}
                      className="text-xs text-red-400 hover:text-red-600 font-bold disabled:opacity-40"
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
          <p className="text-center py-8 text-[var(--ink-30)] text-sm">
            트랜잭션이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
