"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Member {
  id: string;
  name: string;
  shell_balance: number;
  pin_changed: boolean;
}

interface Badge {
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
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

interface MyVideo {
  id: string;
  title: string;
  description: string | null;
  expires_at: string;
  embed_url: string | null;
  thumbnail_url: string | null;
}

const REASON_LABELS: Record<string, string> = {
  SIGNUP_BONUS: "가입 보너스",
  SESSION_HOST: "공유회 개최",
  SESSION_ATTEND: "공유회 참여",
  SESSION_REFUND: "공유회 환불",
  SNS_VERIFY: "SNS 인증",
  SKILL_SHARE: "써보고싶은 스킬",
  SKILL_TRIED: "써본 스킬",
  MEMBER_GIFT: "셸 선물 받음",
  GIFT_RECEIVED: "셸 선물 받음",
  GIFT_SENT: "셸 선물 보냄",
  TIP_RECEIVED: "팁 받음",
  ADMIN_ADJUSTMENT: "어드민 조정",
  VIDEO_GRANT: "영상 시청권",
  VIDEO_GRANT_REFUND: "영상 시청권 환불",
};

type TxTab = "all" | "earned" | "spent" | "gift";

export default function MyPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [txTab, setTxTab] = useState<TxTab>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const [memberList, setMemberList] = useState<MemberOption[]>([]);
  const [shellSearch, setShellSearch] = useState("");
  const [shellReceiver, setShellReceiver] = useState<MemberOption | null>(null);
  const [shellReason, setShellReason] = useState("");
  const [shellSending, setShellSending] = useState(false);
  const [shellMsg, setShellMsg] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [snsUrl, setSnsUrl] = useState("");
  const [snsLoading, setSnsLoading] = useState(false);
  const [snsMsg, setSnsMsg] = useState("");

  const [skillUrl, setSkillUrl] = useState("");
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillMsg, setSkillMsg] = useState("");

  const [badges, setBadges] = useState<Badge[]>([]);
  const [txExpanded, setTxExpanded] = useState(false);

  // 영상
  const [myVideos, setMyVideos] = useState<MyVideo[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (!data.member) router.push("/");
      else { setMember(data.member); if (!data.member.pin_changed) setShowPinModal(true); }
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!member) return;
    fetch(`/api/achievements?member_id=${member.id}`).then((r) => r.json()).then((data) => setBadges(data.badges || [])).catch(() => {});
  }, [member]);

  useEffect(() => {
    if (!member) return;
    fetch("/api/admin/members").then((r) => r.json()).then((data) => {
      if (data.members) setMemberList(data.members.filter((m: MemberOption) => m.id !== member.id && m.is_active));
    }).catch(() => {});
  }, [member]);

  useEffect(() => {
    if (!member) return;
    setTxLoading(true);
    setTxExpanded(false);
    fetch(`/api/auth/my-transactions?type=${txTab}`).then((r) => r.json()).then((data) => { setTransactions(data.transactions || []); setTxLoading(false); });
  }, [member, txTab]);

  // 내 영상
  useEffect(() => {
    if (!member) return;
    fetch("/api/me/videos")
      .then((r) => r.json())
      .then((data) => setMyVideos(data.videos || []))
      .catch(() => {});
  }, [member]);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowMemberDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePin = async () => {
    if (!/^\d{4}$/.test(newPin)) { setPinError("숫자 4자리를 입력해주세요."); return; }
    if (newPin === "0000") { setPinError("0000 이외의 PIN을 설정해주세요."); return; }
    setPinLoading(true); setPinError("");
    const res = await fetch("/api/auth/change-pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ new_pin: newPin }) });
    if (!res.ok) { const data = await res.json(); setPinError(data.error || "변경에 실패했어요."); setPinLoading(false); return; }
    setShowPinModal(false); setNewPin(""); setPinLoading(false);
    if (member) setMember({ ...member, pin_changed: true });
  };

  const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); };

  const handleSendShell = async () => {
    if (!shellReceiver) return;
    setShellSending(true); setShellMsg("");
    try {
      const res = await fetch("/api/shell/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiver_id: shellReceiver.id, reason: shellReason }) });
      const data = await res.json();
      if (res.ok) { setShellMsg("셸을 보냈어요!"); setShellReceiver(null); setShellSearch(""); setShellReason(""); if (member) { const meRes = await fetch("/api/auth/me"); const meData = await meRes.json(); if (meData.member) setMember(meData.member); } }
      else setShellMsg(data.error || "보내기에 실패했어요.");
    } catch { setShellMsg("네트워크 오류가 발생했어요."); }
    setShellSending(false);
  };

  const handleSnsSubmit = async () => {
    if (!snsUrl.trim()) return;
    setSnsLoading(true); setSnsMsg("");
    try {
      const res = await fetch("/api/shell/sns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: snsUrl.trim() }) });
      const data = await res.json();
      if (res.ok) { setSnsMsg("신청 완료! 어드민 승인 후 +2셸"); setSnsUrl(""); } else setSnsMsg(data.error || "신청에 실패했어요.");
    } catch { setSnsMsg("네트워크 오류가 발생했어요."); }
    setSnsLoading(false);
  };

  const handleSkillSubmit = async () => {
    if (!skillUrl.trim()) return;
    setSkillLoading(true); setSkillMsg("");
    try {
      const res = await fetch("/api/shell/skill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: skillUrl.trim() }) });
      const data = await res.json();
      if (res.ok) { setSkillMsg("신청 완료! 어드민 승인 후 +1셸"); setSkillUrl(""); } else setSkillMsg(data.error || "신청에 실패했어요.");
    } catch { setSkillMsg("네트워크 오류가 발생했어요."); }
    setSkillLoading(false);
  };

  const filteredMembers = memberList.filter((m) => m.name.toLowerCase().includes(shellSearch.toLowerCase()));
  const sessionAttendTx = transactions.filter((t) => t.reason === "SESSION_ATTEND");

  if (loading) return <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center"><p className="text-[var(--ink-30)] text-sm">로딩 중...</p></div>;
  if (!member) return null;

  const isCancelled = (t: Transaction) => t.reason_detail?.startsWith("[취소됨]") || t.reason_detail?.startsWith("[취소]");
  const totalEarned = transactions.filter((t) => t.amount > 0 && !isCancelled(t)).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.amount < 0 && !isCancelled(t)).reduce((s, t) => s + Math.abs(t.amount), 0);

  const inputClass = "w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors";

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <div className="bg-[var(--ink)]">
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => router.push("/")} className="text-sm text-[var(--paper)]/60 hover:text-[var(--paper)] transition-colors font-medium">
              &larr; 홈
            </button>
            <button onClick={handleLogout} className="text-sm text-[var(--paper)]/60 hover:text-[var(--paper)] transition-colors font-medium">
              로그아웃
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-[var(--paper)]/60 mb-2 font-medium">{member.name}</p>
            <p className="text-5xl font-extrabold text-[var(--paper)] tracking-tight">{member.shell_balance}</p>
            <p className="text-xs text-[var(--paper)]/40 mt-1 font-medium uppercase tracking-wider">현재 잔고 (셸)</p>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-5 py-8 space-y-8">

        {/* 배지 섹션 */}
        {badges.length > 0 && (
          <section>
            <h3 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">획득한 배지</h3>
            <div className="flex flex-wrap gap-4">
              {badges.map((badge) => (
                <div key={badge.slug} className="flex flex-col items-center w-[72px] group relative">
                  <div className="w-14 h-14 bg-[var(--yellow-dim)] border-2 border-[var(--ink-10)] flex items-center justify-center p-1.5">
                    {badge.icon.startsWith("/") ? (
                      <Image src={badge.icon} alt={badge.name} width={40} height={40} className="w-full h-full" />
                    ) : (
                      <span className="text-2xl">{badge.icon}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--ink-50)] text-center mt-1.5 leading-tight font-semibold">{badge.name}</p>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-[var(--paper)] text-[10px] px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 요약 카드 */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--ink-05)] p-5 text-center">
            <p className="text-xs text-[var(--ink-30)] mb-1 font-bold uppercase tracking-wider">총 적립</p>
            <p className="text-2xl font-extrabold text-[var(--ink)]">+{totalEarned}</p>
          </div>
          <div className="bg-[var(--ink-05)] p-5 text-center">
            <p className="text-xs text-[var(--ink-30)] mb-1 font-bold uppercase tracking-wider">총 지출</p>
            <p className="text-2xl font-extrabold text-[var(--ink)]">-{totalSpent}</p>
          </div>
        </section>

        {/* 셸 보내기 */}
        <section className="border-2 border-[var(--ink-10)] p-5">
          <h3 className="text-sm font-extrabold text-[var(--ink)] mb-1">셸 보내기</h3>
          <p className="text-xs text-[var(--ink-30)] mb-4 font-medium">하루 1회, 다른 멤버에게 셸을 보낼 수 있어요.</p>
          <div className="relative mb-3" ref={dropdownRef}>
            <input type="text" placeholder="멤버 이름 검색"
              value={shellReceiver ? shellReceiver.name : shellSearch}
              onChange={(e) => { setShellSearch(e.target.value); setShellReceiver(null); setShowMemberDropdown(true); }}
              onFocus={() => setShowMemberDropdown(true)}
              className={inputClass} />
            {showMemberDropdown && shellSearch && !shellReceiver && (
              <div className="absolute z-10 mt-1 w-full bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg max-h-40 overflow-y-auto">
                {filteredMembers.length === 0 ? <p className="px-4 py-3 text-xs text-[var(--ink-30)]">결과 없음</p>
                  : filteredMembers.map((m) => (
                    <button key={m.id} onClick={() => { setShellReceiver(m); setShellSearch(m.name); setShowMemberDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--yellow-dim)] transition-colors border-b border-[var(--ink-05)] last:border-0 font-medium">
                      {m.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <input type="text" placeholder="이유 (선택)" value={shellReason} onChange={(e) => setShellReason(e.target.value)} className={`${inputClass} mb-3`} />
          <button onClick={handleSendShell} disabled={!shellReceiver || shellSending}
            className="w-full py-3 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
            {shellSending ? "보내는 중..." : "보내기"}
          </button>
          {shellMsg && <p className={`text-sm mt-3 text-center font-medium ${shellMsg.includes("보냈") ? "text-[var(--ink)]" : "text-red-500"}`}>{shellMsg}</p>}
        </section>

        {/* 시청 가능한 영상 */}
        {myVideos.length > 0 && (
          <section className="border-2 border-[var(--ink-10)] p-5">
            <h3 className="text-sm font-extrabold text-[var(--ink)] mb-3">내 영상</h3>
            <div className="space-y-3">
              {myVideos.map((v) => {
                const expiresAt = new Date(v.expires_at);
                const daysLeft = Math.ceil((expiresAt.getTime() - nowMs) / (1000 * 60 * 60 * 24));
                const isPlaying = playingVideoId === v.id;
                return (
                  <div key={v.id} className="border-2 border-[var(--ink-10)] overflow-hidden">
                    {isPlaying && v.embed_url ? (
                      <div className="aspect-video bg-[var(--ink)]">
                        <iframe
                          src={v.embed_url}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setPlayingVideoId(v.id)}
                        className="block w-full relative aspect-video bg-[var(--ink-05)] group"
                      >
                        {v.thumbnail_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-[var(--ink)]/30 group-hover:bg-[var(--ink)]/40 flex items-center justify-center transition-colors">
                          <div className="w-14 h-14 bg-[var(--paper)]/90 flex items-center justify-center">
                            <span className="text-[var(--ink)] text-2xl ml-1">▶</span>
                          </div>
                        </div>
                      </button>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-bold text-[var(--ink)]">{v.title}</p>
                      {v.description && (
                        <p className="text-xs text-[var(--ink-50)] mt-1 line-clamp-2">{v.description}</p>
                      )}
                      <p className="text-xs text-[var(--ink-50)] mt-1 font-medium">
                        {daysLeft > 0 ? `${daysLeft}일 남음` : "오늘 만료"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SNS 인증 — 숨김 (Slack 제출 유도, 기능은 유지) */}
        {false && (
        <section className="border-2 border-[var(--ink-10)] p-5">
          <h3 className="text-sm font-extrabold text-[var(--ink)] mb-1">SNS 인증</h3>
          <p className="text-xs text-[var(--ink-30)] mb-4 font-medium">승인 시 +2셸</p>
          <div className="flex gap-2">
            <input type="url" placeholder="게시물 URL" value={snsUrl} onChange={(e) => setSnsUrl(e.target.value)} className={`flex-1 ${inputClass}`} />
            <button onClick={handleSnsSubmit} disabled={!snsUrl.trim() || snsLoading}
              className="px-5 py-3 bg-[var(--yellow)] text-[var(--ink)] font-bold text-sm hover:opacity-80 disabled:opacity-40 transition-opacity flex-shrink-0">
              {snsLoading ? "..." : "신청"}
            </button>
          </div>
          {snsMsg && <p className={`text-xs mt-3 font-medium ${snsMsg.includes("완료") ? "text-[var(--ink)]" : "text-red-500"}`}>{snsMsg}</p>}
        </section>
        )}

        {/* 스킬 공유 — 숨김 (Slack 제출 유도, 기능은 유지) */}
        {false && (
        <section className="border-2 border-[var(--ink-10)] p-5">
          <h3 className="text-sm font-extrabold text-[var(--ink)] mb-1">스킬 공유</h3>
          <p className="text-xs text-[var(--ink-30)] mb-4 font-medium">승인 시 +1셸</p>
          <div className="flex gap-2">
            <input type="url" placeholder="공유 URL" value={skillUrl} onChange={(e) => setSkillUrl(e.target.value)} className={`flex-1 ${inputClass}`} />
            <button onClick={handleSkillSubmit} disabled={!skillUrl.trim() || skillLoading}
              className="px-5 py-3 bg-[var(--yellow)] text-[var(--ink)] font-bold text-sm hover:opacity-80 disabled:opacity-40 transition-opacity flex-shrink-0">
              {skillLoading ? "..." : "신청"}
            </button>
          </div>
          {skillMsg && <p className={`text-xs mt-3 font-medium ${skillMsg.includes("완료") ? "text-[var(--ink)]" : "text-red-500"}`}>{skillMsg}</p>}
        </section>
        )}

        {/* 참여 공유회 */}
        {sessionAttendTx.length > 0 && (
          <section>
            <h3 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">참여 공유회</h3>
            <div className="border-t-2 border-[var(--ink-10)]">
              {sessionAttendTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-[var(--ink-10)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--ink)] font-medium truncate">{tx.reason_detail || "공유회 참여"}</p>
                    <p className="text-xs text-[var(--ink-30)]">{new Date(tx.created_at).toLocaleString("ko-KR")}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--ink)] ml-2">{tx.amount} 셸</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 트랜잭션 탭 */}
        <section>
          <div className="flex border-2 border-[var(--ink)] mb-4">
            {([["all", "전체"], ["earned", "적립"], ["spent", "지출"], ["gift", "선물"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTxTab(key)}
                className={`flex-1 py-2.5 text-xs font-extrabold transition-colors border-r border-[var(--ink)] last:border-r-0 ${
                  txTab === key ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {txLoading ? (
            <p className="text-center py-12 text-[var(--ink-30)] text-sm">로딩 중...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-12 text-[var(--ink-30)] text-sm">내역이 없어요</p>
          ) : (
            <div className="border-t-2 border-[var(--ink-10)]">
              {(txExpanded ? transactions : transactions.slice(0, 3)).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--ink)]">{REASON_LABELS[tx.reason] || tx.reason}</p>
                    {tx.reason_detail && <p className="text-xs text-[var(--ink-30)] truncate">{tx.reason_detail}</p>}
                    <p className="text-[11px] text-[var(--ink-30)] mt-0.5">{new Date(tx.created_at).toLocaleString("ko-KR")}</p>
                  </div>
                  <span className={`text-sm font-extrabold ml-3 tabular-nums ${tx.amount > 0 ? "text-[var(--ink)]" : "text-[var(--ink-50)]"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </div>
              ))}
              {transactions.length > 3 && (
                <button onClick={() => setTxExpanded(!txExpanded)}
                  className="w-full py-3 text-xs font-bold text-[var(--ink-50)] hover:text-[var(--ink)] hover:bg-[var(--ink-05)] transition-colors">
                  {txExpanded ? "접기" : `더보기 (${transactions.length - 3}건)`}
                </button>
              )}
            </div>
          )}
        </section>

        {/* PIN 변경 */}
        <button onClick={() => setShowPinModal(true)}
          className="w-full px-4 py-3 border-2 border-[var(--ink-10)] text-sm text-[var(--ink-50)] font-bold hover:bg-[var(--ink-05)] transition-colors">
          PIN 변경하기
        </button>
      </main>

      {/* PIN 모달 */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4">
          <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl">
            <h2 className="text-xl font-extrabold text-[var(--ink)] mb-2">
              {member.pin_changed ? "PIN 변경" : "PIN을 설정해주세요"}
            </h2>
            {!member.pin_changed && <p className="text-sm text-[var(--ink-50)] mb-5">초기 PIN(0000)을 변경해주세요.</p>}
            <label className="block text-xs font-bold text-[var(--ink-30)] mb-1.5 uppercase tracking-wider">새 PIN (숫자 4자리)</label>
            <input type="text" inputMode="numeric" maxLength={4} value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="0000"
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-center text-lg tracking-[0.5em] font-bold" />
            {pinError && <p className="text-sm text-red-500 mt-2 font-medium">{pinError}</p>}
            <button onClick={handleChangePin} disabled={pinLoading || newPin.length !== 4}
              className="w-full mt-4 py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
              {pinLoading ? "변경 중..." : "PIN 변경"}
            </button>
            {member.pin_changed && (
              <button onClick={() => { setShowPinModal(false); setNewPin(""); setPinError(""); }}
                className="mt-3 w-full text-center text-sm text-[var(--ink-30)] hover:text-[var(--ink)]">닫기</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
