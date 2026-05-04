"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  shell_balance: number;
  pin_changed: boolean;
}

interface MemberOption {
  id: string;
  name: string;
  shell_balance: number;
  is_active: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  reason_detail: string;
  created_at: string;
}

const REASON_LABELS: Record<string, string> = {
  SIGNUP_BONUS: "가입 보너스",
  SESSION_HOST: "공유회 개최",
  SESSION_ATTEND: "공유회 참여",
  SESSION_REFUND: "공유회 환불",
  SNS_VERIFY: "SNS 인증",
  SKILL_SHARE: "스킬 공유",
  MEMBER_GIFT: "셸 선물 받음",
  GIFT_RECEIVED: "셸 선물 받음",
  GIFT_SENT: "셸 선물 보냄",
  TIP_RECEIVED: "팁 받음",
  ADMIN_ADJUSTMENT: "어드민 조정",
};

type TxTab = "all" | "earned" | "spent" | "gift";

export default function MyPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [txTab, setTxTab] = useState<TxTab>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  // PIN 변경
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  // 셸 보내기
  const [memberList, setMemberList] = useState<MemberOption[]>([]);
  const [shellSearch, setShellSearch] = useState("");
  const [shellReceiver, setShellReceiver] = useState<MemberOption | null>(null);
  const [shellReason, setShellReason] = useState("");
  const [shellSending, setShellSending] = useState(false);
  const [shellMsg, setShellMsg] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // SNS 인증
  const [snsUrl, setSnsUrl] = useState("");
  const [snsLoading, setSnsLoading] = useState(false);
  const [snsMsg, setSnsMsg] = useState("");

  // 스킬 공유
  const [skillUrl, setSkillUrl] = useState("");
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillMsg, setSkillMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.member) {
          router.push("/");
        } else {
          setMember(data.member);
          if (!data.member.pin_changed) {
            setShowPinModal(true);
          }
        }
        setLoading(false);
      });
  }, [router]);

  // 멤버 목록 로드
  useEffect(() => {
    if (!member) return;
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => {
        if (data.members) {
          setMemberList(data.members.filter((m: MemberOption) => m.id !== member.id && m.is_active));
        }
      })
      .catch(() => {});
  }, [member]);

  useEffect(() => {
    if (!member) return;
    setTxLoading(true);
    fetch(`/api/auth/my-transactions?type=${txTab}`)
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setTxLoading(false);
      });
  }, [member, txTab]);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePin = async () => {
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("숫자 4자리를 입력해주세요.");
      return;
    }
    if (newPin === "0000") {
      setPinError("0000 이외의 PIN을 설정해주세요.");
      return;
    }

    setPinLoading(true);
    setPinError("");

    const res = await fetch("/api/auth/change-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_pin: newPin }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPinError(data.error || "변경에 실패했어요.");
      setPinLoading(false);
      return;
    }

    setShowPinModal(false);
    setNewPin("");
    setPinLoading(false);
    if (member) setMember({ ...member, pin_changed: true });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // 셸 보내기
  const handleSendShell = async () => {
    if (!shellReceiver) return;
    setShellSending(true);
    setShellMsg("");

    try {
      const res = await fetch("/api/shell/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: shellReceiver.id, reason: shellReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setShellMsg("셸을 보냈어요! 🐚");
        setShellReceiver(null);
        setShellSearch("");
        setShellReason("");
        // 잔고 갱신
        if (member) {
          const meRes = await fetch("/api/auth/me");
          const meData = await meRes.json();
          if (meData.member) setMember(meData.member);
        }
      } else {
        setShellMsg(data.error || "보내기에 실패했어요.");
      }
    } catch {
      setShellMsg("네트워크 오류가 발생했어요.");
    }
    setShellSending(false);
  };

  // SNS 인증
  const handleSnsSubmit = async () => {
    if (!snsUrl.trim()) return;
    setSnsLoading(true);
    setSnsMsg("");

    try {
      const res = await fetch("/api/shell/sns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: snsUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSnsMsg("신청 완료! 어드민 승인 후 +2🐚");
        setSnsUrl("");
      } else {
        setSnsMsg(data.error || "신청에 실패했어요.");
      }
    } catch {
      setSnsMsg("네트워크 오류가 발생했어요.");
    }
    setSnsLoading(false);
  };

  // 스킬 공유
  const handleSkillSubmit = async () => {
    if (!skillUrl.trim()) return;
    setSkillLoading(true);
    setSkillMsg("");

    try {
      const res = await fetch("/api/shell/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: skillUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSkillMsg("신청 완료! 어드민 승인 후 +1🐚");
        setSkillUrl("");
      } else {
        setSkillMsg(data.error || "신청에 실패했어요.");
      }
    } catch {
      setSkillMsg("네트워크 오류가 발생했어요.");
    }
    setSkillLoading(false);
  };

  const filteredMembers = memberList.filter((m) =>
    m.name.toLowerCase().includes(shellSearch.toLowerCase())
  );

  const sessionAttendTx = transactions.filter((t) => t.reason === "SESSION_ATTEND");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-cyan-50 to-white flex items-center justify-center">
        <p className="text-cyan-500 animate-pulse">🫧 로딩 중...</p>
      </div>
    );
  }

  if (!member) return null;

  const totalEarned = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-cyan-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.push("/")} className="text-sm text-white/80 hover:text-white transition-colors">
              &larr; 홈
            </button>
            <button onClick={handleLogout} className="text-sm text-white/80 hover:text-white transition-colors">
              로그아웃
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/80 mb-1">🐠 {member.name}</p>
            <p className="text-4xl font-bold text-white">{member.shell_balance} 🐚</p>
            <p className="text-xs text-white/70 mt-1">현재 잔고</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-green-100 text-center shadow-sm">
            <p className="text-xs text-green-600 mb-1">🌿 총 적립</p>
            <p className="text-xl font-bold text-green-700">+{totalEarned}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-rose-100 text-center shadow-sm">
            <p className="text-xs text-rose-500 mb-1">🪸 총 지출</p>
            <p className="text-xl font-bold text-rose-600">-{totalSpent}</p>
          </div>
        </div>

        {/* 셸 보내기 카드 */}
        <div className="bg-white rounded-2xl p-5 border border-cyan-100 shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-3">🐚 셸 보내기</h3>
          <p className="text-xs text-slate-500 mb-3">하루 1회, 다른 멤버에게 셸을 보낼 수 있어요.</p>

          {/* 멤버 검색 */}
          <div className="relative mb-3" ref={dropdownRef}>
            <input
              type="text"
              placeholder="멤버 이름 검색"
              value={shellReceiver ? shellReceiver.name : shellSearch}
              onChange={(e) => {
                setShellSearch(e.target.value);
                setShellReceiver(null);
                setShowMemberDropdown(true);
              }}
              onFocus={() => setShowMemberDropdown(true)}
              className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
            {showMemberDropdown && shellSearch && !shellReceiver && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-cyan-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-400">결과 없음</p>
                ) : (
                  filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setShellReceiver(m);
                        setShellSearch(m.name);
                        setShowMemberDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 transition-colors"
                    >
                      {m.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 이유 입력 */}
          <input
            type="text"
            placeholder="이유 (선택)"
            value={shellReason}
            onChange={(e) => setShellReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 mb-3"
          />

          <button
            onClick={handleSendShell}
            disabled={!shellReceiver || shellSending}
            className="w-full py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors text-sm"
          >
            {shellSending ? "보내는 중..." : "보내기 🐚"}
          </button>

          {shellMsg && (
            <p className={`text-sm mt-2 text-center ${shellMsg.includes("보냈") ? "text-green-600" : "text-red-500"}`}>
              {shellMsg}
            </p>
          )}
        </div>

        {/* SNS 인증 */}
        <div className="bg-white rounded-2xl p-5 border border-cyan-100 shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-2">SNS 인증</h3>
          <p className="text-xs text-slate-500 mb-3">하루 1회, 승인 시 +2🐚</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="게시물 URL"
              value={snsUrl}
              onChange={(e) => setSnsUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-cyan-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <button
              onClick={handleSnsSubmit}
              disabled={!snsUrl.trim() || snsLoading}
              className="px-4 py-2 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors text-sm flex-shrink-0"
            >
              {snsLoading ? "..." : "신청"}
            </button>
          </div>
          {snsMsg && (
            <p className={`text-xs mt-2 ${snsMsg.includes("완료") ? "text-green-600" : "text-red-500"}`}>
              {snsMsg}
            </p>
          )}
        </div>

        {/* 스킬 공유 */}
        <div className="bg-white rounded-2xl p-5 border border-cyan-100 shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-2">스킬 공유</h3>
          <p className="text-xs text-slate-500 mb-3">승인 시 +1🐚</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="공유 URL"
              value={skillUrl}
              onChange={(e) => setSkillUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-cyan-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <button
              onClick={handleSkillSubmit}
              disabled={!skillUrl.trim() || skillLoading}
              className="px-4 py-2 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors text-sm flex-shrink-0"
            >
              {skillLoading ? "..." : "신청"}
            </button>
          </div>
          {skillMsg && (
            <p className={`text-xs mt-2 ${skillMsg.includes("완료") ? "text-green-600" : "text-red-500"}`}>
              {skillMsg}
            </p>
          )}
        </div>

        {/* 참여 공유회 */}
        {sessionAttendTx.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-cyan-100 shadow-md">
            <h3 className="text-sm font-bold text-slate-800 mb-3">📅 참여 공유회</h3>
            <div className="space-y-2">
              {sessionAttendTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-3 py-2 bg-cyan-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {tx.reason_detail || "공유회 참여"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-red-500 ml-2">{tx.amount}🐚</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 트랜잭션 탭 */}
        <div className="flex rounded-2xl bg-cyan-100 p-1">
          {([
            ["all", "전체"],
            ["earned", "적립"],
            ["spent", "지출"],
            ["gift", "선물"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTxTab(key)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                txTab === key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-cyan-700 hover:text-cyan-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 트랜잭션 목록 */}
        {txLoading ? (
          <p className="text-center py-8 text-cyan-500 animate-pulse">🫧 로딩 중...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center py-8 text-slate-400">내역이 없어요</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-cyan-100 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {REASON_LABELS[tx.reason] || tx.reason}
                  </p>
                  {tx.reason_detail && (
                    <p className="text-xs text-slate-500 truncate">{tx.reason_detail}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(tx.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ml-3 ${
                    tx.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PIN 변경 버튼 */}
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-2xl text-sm text-slate-600 hover:bg-cyan-50 transition-colors shadow-sm"
        >
          🔑 PIN 변경하기
        </button>
      </div>

      {/* PIN 변경 모달 */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {member.pin_changed ? "🔑 PIN 변경" : "🔑 PIN을 설정해주세요"}
            </h2>
            {!member.pin_changed && (
              <p className="text-sm text-slate-600 mb-4">
                초기 PIN(0000)을 변경해주세요.
              </p>
            )}

            <label className="block text-sm text-slate-600 mb-1">새 PIN (숫자 4자리)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="0000"
              className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-center text-lg tracking-widest"
            />

            {pinError && <p className="text-sm text-red-500 mt-2">{pinError}</p>}

            <button
              onClick={handleChangePin}
              disabled={pinLoading || newPin.length !== 4}
              className="w-full mt-4 py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50"
            >
              {pinLoading ? "변경 중..." : "PIN 변경"}
            </button>

            {member.pin_changed && (
              <button
                onClick={() => { setShowPinModal(false); setNewPin(""); setPinError(""); }}
                className="mt-2 w-full text-center text-sm text-cyan-500"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
