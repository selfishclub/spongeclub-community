"use client";

import { useEffect, useState, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  formatDistanceToNow,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RankingEntry {
  rank: number;
  member_id: string;
  name: string;
  profile_image?: string | null;
  total: number;
  earned?: number;
  spent?: number;
  member_count?: number;
  avg?: number;
}

interface BadgeTop3Entry {
  rank: number;
  member_id: string;
  name: string;
  profile_image: string | null;
  count: number;
  badges: { slug: string; name: string; icon: string }[];
}

interface BadgeFeedEntry {
  name: string;
  profile_image: string | null;
  badge_name: string;
  badge_slug: string;
  badge_icon: string;
  earned_at: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  category: "AI" | "CAREER" | "FINANCE" | "LIFESTYLE";
  scheduled_at: string;
  duration_minutes: number;
  entry_cost: number;
  capacity: number | null;
  attendee_count: number;
  host_name: string;
  status: string;
}

interface SessionDetail extends Session {
  host_id: string;
  notify_count: number;
  my_status: "REGISTERED" | "ATTENDED" | "NOTIFY_REQUESTED" | null;
  cancel_deadline: string;
}

const NOTIFY_THRESHOLD = 5;

interface Member {
  id: string;
  name: string;
  shell_balance: number;
  is_admin: boolean;
  pin_changed: boolean;
}

interface MemberOption {
  id: string;
  name: string;
  shell_balance: number;
}

// ─── Category Helpers ────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  AI: "AI",
  CAREER: "커리어/성장",
  FINANCE: "재테크",
  LIFESTYLE: "일상/취미",
};

// ─── Login Modal ─────────────────────────────────────────────────────────────

function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (member: Member) => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    fetch("/api/auth/members")
      .then((r) => r.json())
      .then((data) => setMemberOptions(data.members || []))
      .catch(() => {});
  }, []);

  const filtered = name.trim()
    ? memberOptions.filter((m) =>
        m.name.toLowerCase().includes(name.toLowerCase().trim())
      )
    : [];

  const handleLogin = async () => {
    if (!name.trim() || !pin) { setError("이름과 PIN을 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "로그인에 실패했어요.");
      else onSuccess(data.member);
    } catch { setError("네트워크 오류가 발생했어요."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl" style={{ borderRadius: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold text-[var(--ink)] mb-6">로그인</h2>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelected(false);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="이름 일부를 입력하면 검색돼요"
              autoComplete="off"
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors"
            />
            {showDropdown && !selected && filtered.length > 0 && (
              <div className="absolute left-0 right-0 z-10 mt-1 bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg max-h-48 overflow-y-auto">
                {filtered.slice(0, 20).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setName(m.name);
                      setSelected(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--ink)] font-medium hover:bg-[var(--yellow-dim)] transition-colors border-b border-[var(--ink-05)] last:border-0"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
            {showDropdown && !selected && name.trim() && filtered.length === 0 && (
              <div className="absolute left-0 right-0 z-10 mt-1 bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg px-4 py-2.5 text-xs text-[var(--ink-30)] font-medium">
                일치하는 멤버가 없어요
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">PIN</label>
            <input type="password" inputMode="numeric" maxLength={4} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="0000"
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm text-center tracking-[0.5em] font-bold transition-colors" />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <p className="text-xs text-[var(--ink-30)] text-center">초기 PIN은 0000이에요</p>
        </div>
        <button onClick={onClose} className="mt-4 w-full text-center text-sm text-[var(--ink-30)] hover:text-[var(--ink)] transition-colors">닫기</button>
      </div>
    </div>
  );
}

// ─── Member Picker Modal ────────────────────────────────────────────────────

function MemberPickerModal({ onClose, onSelect, title }: { onClose: () => void; onSelect: (member: MemberOption) => void; title: string }) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/members").then((r) => r.json()).then((data) => {
      setMembers((data.members || []).filter((m: MemberOption & { is_active: boolean }) => m.is_active).map((m: MemberOption) => ({ id: m.id, name: m.name, shell_balance: m.shell_balance })));
      setLoading(false);
    });
  }, []);

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-[var(--paper)] w-full max-w-sm p-6 shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-extrabold text-[var(--ink)] mb-3">{title}</h2>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름을 입력하세요..." autoFocus
          className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm mb-3" />
        <div className="flex-1 overflow-y-auto">
          {loading ? <p className="text-center py-4 text-[var(--ink-30)] text-sm">로딩 중...</p>
            : filtered.length === 0 ? <p className="text-center py-4 text-[var(--ink-30)] text-sm">검색 결과가 없어요</p>
            : filtered.map((m) => (
              <button key={m.id} onClick={() => onSelect(m)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--yellow-dim)] transition-colors flex justify-between items-center border-b border-[var(--ink-05)] last:border-0">
                <span className="text-sm text-[var(--ink)] font-semibold">{m.name}</span>
                <span className="text-xs text-[var(--ink-30)]">{m.shell_balance} 셸</span>
              </button>
            ))}
        </div>
        <button onClick={onClose} className="mt-3 w-full text-center text-sm text-[var(--ink-30)] hover:text-[var(--ink)]">닫기</button>
      </div>
    </div>
  );
}

// ─── Session Detail Modal ────────────────────────────────────────────────────

function SessionDetailModal({ session, member, onClose, onLoginRequired, onRegistered }: {
  session: SessionDetail; member: Member | null; onClose: () => void; onLoginRequired: () => void; onRegistered: () => void;
}) {
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pendingAction, setPendingAction] = useState<"register" | "notify">("register");
  const [notifyConfirmMemberId, setNotifyConfirmMemberId] = useState<string | null>(null);
  const handleRegister = async (memberId: string) => {
    setShowPicker(false); setRegistering(true); setError("");
    try {
      const res = await fetch(`/api/sessions/${session.id}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ member_id: memberId }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "신청에 실패했어요.");
      else { setSuccess(true); onRegistered(); }
    } catch { setError("네트워크 오류가 발생했어요."); }
    finally { setRegistering(false); }
  };

  const handleNotify = async (memberId: string) => {
    setRegistering(true); setError("");
    try {
      const res = await fetch(`/api/sessions/${session.id}/notify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ member_id: memberId }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "알림 신청에 실패했어요.");
      else { setSuccess(true); onRegistered(); }
    } catch { setError("네트워크 오류가 발생했어요."); }
    finally { setRegistering(false); setNotifyConfirmMemberId(null); }
  };

  const handleCancel = async () => {
    if (!member) return;
    if (!confirm(session.my_status === "REGISTERED" ? `정말 취소할까요? ${session.entry_cost}셸이 환불됩니다.` : "알림 신청을 취소할까요?")) return;
    setRegistering(true); setError("");
    try {
      const res = await fetch(`/api/sessions/${session.id}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ member_id: member.id }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "취소에 실패했어요.");
      else { onRegistered(); onClose(); }
    } catch { setError("네트워크 오류가 발생했어요."); }
    finally { setRegistering(false); }
  };

  // 알림 신청 버튼 클릭 → 로그인 안 됐으면 picker, 됐으면 바로 confirm 모달
  const startNotifyFlow = () => {
    if (member) { setNotifyConfirmMemberId(member.id); }
    else { setPendingAction("notify"); setShowPicker(true); }
  };

  // 참여 신청 버튼 클릭 → 로그인 안 됐으면 picker, 됐으면 바로 신청
  const startRegisterFlow = () => {
    if (member) { handleRegister(member.id); }
    else { setPendingAction("register"); setShowPicker(true); }
  };

  const handlePickerSelect = (memberId: string) => {
    setShowPicker(false);
    if (pendingAction === "notify") setNotifyConfirmMemberId(memberId);
    else handleRegister(memberId);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
        <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[var(--yellow)] text-[var(--ink)] mb-3">
            {CATEGORY_LABELS[session.category]}
          </span>
          <h2 className="text-xl font-extrabold text-[var(--ink)] mb-2 leading-tight">{session.title}</h2>
          {session.description && (
            <div className="text-sm text-[var(--ink-80)] mb-5 leading-[1.8] space-y-2">
              {session.description.split(/[·\n]/).filter(Boolean).length > 1
                ? session.description.split(/[·\n]/).filter(Boolean).map((line, i) => (
                    <p key={i} className={line.trim().startsWith('-') || line.trim().startsWith('·') ? "pl-2 border-l-2 border-[var(--yellow)] ml-1" : ""}>
                      {line.trim()}
                    </p>
                  ))
                : <p>{session.description}</p>
              }
            </div>
          )}
          <div className="space-y-3 text-sm mb-6 bg-[var(--ink-05)] p-4">
            {[
              ["진행자", session.host_name],
              ["일시", format(parseISO(session.scheduled_at), "M월 d일 (EEE) HH:mm", { locale: ko })],
              ["가격", `${session.entry_cost} 셸`],
              ["참석자", `${session.attendee_count}명${session.capacity ? ` / ${session.capacity}명` : ""}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[var(--ink-30)]">{label}</span>
                <span className="text-[var(--ink)] font-semibold">{value}</span>
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-500 font-medium mb-3">{error}</p>}
          {(session.status === "COMPLETED" || parseISO(session.scheduled_at) < new Date()) ? (
            <div className="text-center py-4 bg-[var(--ink-05)]"><p className="text-[var(--ink-50)] font-extrabold">완료된 공유회입니다</p></div>
          ) : session.status === "CANCELLED" ? (
            <div className="text-center py-4 bg-[var(--ink-05)]"><p className="text-[var(--ink-50)] font-extrabold">취소된 공유회입니다</p></div>
          ) : success ? (
            <div className="text-center py-4 bg-[var(--yellow)]"><p className="text-[var(--ink)] font-extrabold">신청 완료!</p></div>
          ) : session.my_status === "REGISTERED" || session.my_status === "ATTENDED" ? (
            <>
              <div className="mb-3 px-4 py-3 bg-[var(--yellow-dim)] text-center">
                <p className="text-sm font-extrabold text-[var(--ink)]">✅ 참여 확정</p>
                <p className="text-[11px] text-[var(--ink-50)] mt-1">취소 가능: {format(parseISO(session.cancel_deadline), "M월 d일 (EEE) HH:mm", { locale: ko })} 까지</p>
              </div>
              <button onClick={handleCancel} disabled={registering || parseISO(session.cancel_deadline) < new Date()}
                className="w-full py-3 bg-[var(--paper)] border-2 border-[var(--ink-10)] text-[var(--ink-50)] font-bold text-sm hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40">
                {parseISO(session.cancel_deadline) < new Date() ? "취소 기한이 지났어요" : registering ? "취소 중..." : `신청 취소 (${session.entry_cost}셸 환불)`}
              </button>
            </>
          ) : session.my_status === "NOTIFY_REQUESTED" ? (
            <>
              <div className="mb-3 px-4 py-2.5 bg-[var(--ink-05)] text-center">
                <p className="text-xs font-extrabold text-[var(--ink-50)] tracking-wider uppercase">알림 신청</p>
                <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{session.notify_count} / {NOTIFY_THRESHOLD}명</p>
                <p className="text-[11px] text-[var(--ink-30)] mt-1">🔔 알림 신청 완료. 5명 모이면 자동 확정돼요.</p>
              </div>
              <button onClick={handleCancel} disabled={registering}
                className="w-full py-3 bg-[var(--paper)] border-2 border-[var(--ink-10)] text-[var(--ink-50)] font-bold text-sm hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40">
                {registering ? "취소 중..." : "알림 신청 취소"}
              </button>
            </>
          ) : session.status === "PENDING" ? (
            <>
              <div className="mb-3 px-4 py-2.5 bg-[var(--ink-05)] text-center">
                <p className="text-xs font-extrabold text-[var(--ink-50)] tracking-wider uppercase">알림 신청</p>
                <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{session.notify_count} / {NOTIFY_THRESHOLD}명</p>
              </div>
              <button onClick={startNotifyFlow} disabled={registering}
                className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
                {registering ? "신청 중..." : "🔔 알림 신청하기"}
              </button>
            </>
          ) : (
            <button onClick={startRegisterFlow} disabled={registering}
              className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
              {registering ? "신청 중..." : `${session.entry_cost}셸로 공유회 참여 신청하기`}
            </button>
          )}

          <button onClick={onClose} className="mt-3 w-full text-center text-sm text-[var(--ink-30)] hover:text-[var(--ink)]">닫기</button>
        </div>
      </div>
      {showPicker && <MemberPickerModal title="본인 이름을 선택하세요" onClose={() => setShowPicker(false)} onSelect={(m) => handlePickerSelect(m.id)} />}
      {notifyConfirmMemberId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--ink)]/70 backdrop-blur-sm px-4" onClick={() => !registering && setNotifyConfirmMemberId(null)}>
          <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-3xl mb-3 text-center">🔔</p>
            <h3 className="text-base font-extrabold text-[var(--ink)] mb-3 text-center">알림 신청 안내</h3>
            <p className="text-sm text-[var(--ink-50)] leading-relaxed mb-5">
              지금은 셸이 차감되지 않아요. <b className="text-[var(--ink)]">알림 신청자가 {NOTIFY_THRESHOLD}명 이상</b> 모이면 공유회가 자동으로 확정되고,
              그때 자동으로 <b className="text-[var(--ink)]">참여자 목록에 포함되며 {session.entry_cost}셸이 차감</b>됩니다.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setNotifyConfirmMemberId(null)} disabled={registering}
                className="flex-1 py-3 bg-[var(--paper)] border-2 border-[var(--ink-10)] text-[var(--ink-50)] font-bold text-sm hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-40">
                취소
              </button>
              <button onClick={() => handleNotify(notifyConfirmMemberId)} disabled={registering}
                className="flex-1 py-3 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40">
                {registering ? "신청 중..." : "확인 후 신청"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Suggest Modal ──────────────────────────────────────────────────────────

function SuggestModal({ onClose }: { onClose: () => void }) {
  const [suggesterName, setSuggesterName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!suggesterName.trim() || !targetName.trim() || !topic.trim()) { setError("모든 항목을 입력해주세요."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/sessions/suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggester_name: suggesterName.trim(), target_name: targetName.trim(), topic: topic.trim() }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error || "제출에 실패했어요."); }
      else setDone(true);
    } catch { setError("네트워크 오류가 발생했어요."); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <div className="bg-[var(--yellow)] inline-block px-4 py-2 mb-4"><span className="text-sm font-extrabold text-[var(--ink)]">제출 완료!</span></div>
            <p className="text-sm text-[var(--ink-50)]">추천이 전달됐어요. 감사합니다!</p>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 transition-opacity">닫기</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-[var(--ink)] mb-2">공유회 추천하기</h2>
            <p className="text-xs text-[var(--ink-30)] mb-6 font-medium">듣고 싶은 공유회를 추천해주세요</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--ink-30)] mb-1.5 uppercase tracking-wider">내 이름</label>
                <input type="text" value={suggesterName} onChange={(e) => setSuggesterName(e.target.value)} placeholder="추천하는 사람" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--ink-30)] mb-1.5 uppercase tracking-wider">누구한테 듣고 싶은지</label>
                <input type="text" value={targetName} onChange={(e) => setTargetName(e.target.value)} placeholder="진행자 이름" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--ink-30)] mb-1.5 uppercase tracking-wider">어떤 주제</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="듣고 싶은 내용을 간략하게"
                  className={`${inputClass} resize-none h-20`} />
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
                {loading ? "제출 중..." : "추천하기"}
              </button>
            </div>
            <button onClick={onClose} className="mt-4 w-full text-center text-sm text-[var(--ink-30)] hover:text-[var(--ink)] transition-colors">닫기</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── VOD Section ────────────────────────────────────────────────────────────

interface ListedVideo {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  thumbnail_url: string | null;
}

function VodSection({ member, onLoginRequired }: { member: Member | null; onLoginRequired: () => void }) {
  const [videos, setVideos] = useState<ListedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedMap, setRequestedMap] = useState<Record<string, string | null>>({});
  const [requesting, setRequesting] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/videos/listed")
      .then((r) => r.json())
      .then((data) => { setVideos(data.videos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // 로그인 유저의 각 영상 신청 상태 확인
  useEffect(() => {
    if (!member || videos.length === 0) return;
    videos.forEach((v) => {
      fetch(`/api/videos/${v.id}/purchase-request`)
        .then((r) => r.json())
        .then((data) => {
          if (data.requested) {
            setRequestedMap((prev) => ({ ...prev, [v.id]: data.status || "PENDING" }));
          }
        })
        .catch(() => {});
    });
  }, [member, videos]);

  const handlePurchase = async (videoId: string) => {
    if (!member) { onLoginRequired(); return; }
    setRequesting(videoId);
    try {
      const res = await fetch(`/api/videos/${videoId}/purchase-request`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setRequestedMap((prev) => ({ ...prev, [videoId]: "PENDING" }));
      } else if (res.status === 409) {
        setRequestedMap((prev) => ({ ...prev, [videoId]: "PENDING" }));
      } else {
        alert(data.error || "신청에 실패했어요.");
      }
    } catch { alert("네트워크 오류가 발생했어요."); }
    finally { setRequesting(null); }
  };

  if (loading || videos.length === 0) return null;

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-[var(--ink)] tracking-tight">VOD 구매 가능한 지난 공유회</h2>
        <p className="text-xs text-[var(--ink-30)] mt-1 font-medium">놓친 공유회를 셸로 구매하세요</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(showAll ? videos : videos.slice(0, 6)).map((v) => {
          const isRequested = !!requestedMap[v.id];
          const status = requestedMap[v.id];
          return (
            <div key={v.id} className="border-2 border-[var(--ink-10)] overflow-hidden hover:border-[var(--ink-30)] transition-colors">
              {v.thumbnail_url ? (
                <div className="relative aspect-[16/9] bg-[var(--ink-05)]">
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[var(--ink)]/80 text-[var(--paper)] text-[10px] font-extrabold">
                    {v.cost} 셸
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] bg-[var(--ink-05)] flex items-center justify-center">
                  <span className="text-xl">🎬</span>
                </div>
              )}
              <div className="p-2.5">
                <h3 className="text-xs font-bold text-[var(--ink)] leading-snug line-clamp-2 mb-1.5">{v.title}</h3>
                {isRequested ? (
                  <div className="py-1.5 text-center bg-[var(--ink-05)]">
                    <p className="text-[11px] font-extrabold text-[var(--ink-50)]">
                      {status === "RESOLVED" ? "✅ 구매 완료" : "📼 구매 신청 완료"}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(v.id)}
                    disabled={requesting === v.id}
                    className="w-full py-1.5 bg-[var(--ink)] text-[var(--paper)] text-[11px] font-extrabold hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    {requesting === v.id ? "신청 중..." : `${v.cost}셸 구매하기`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {videos.length > 6 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full py-2.5 text-xs font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)] uppercase tracking-widest border border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors"
        >
          더보기 ({videos.length - 6}개)
        </button>
      )}
    </section>
  );
}

// ─── Live Ticker ────────────────────────────────────────────────────────────

interface LiveItem {
  name: string;
  profile_image: string | null;
  message: string;
  badge_icon?: string;
  timestamp?: string;
}

function LiveTicker({ badgeFeed, activityFeed }: { badgeFeed: BadgeFeedEntry[]; activityFeed: { name: string; profile_image: string | null; message: string; created_at?: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 배지 피드 + 개인 활동 피드 합치기
  const items: LiveItem[] = [
    ...activityFeed.map((e) => ({
      name: e.name,
      profile_image: e.profile_image,
      message: e.message,
      timestamp: e.created_at,
    })),
    ...badgeFeed.map((e) => ({
      name: e.name,
      profile_image: e.profile_image,
      message: `${e.badge_name} 배지 획득!`,
      badge_icon: e.badge_icon,
      timestamp: e.earned_at,
    })),
  ];

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => { setCurrentIndex((prev) => (prev + 1) % items.length); setIsAnimating(false); }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

  const entry = items[currentIndex];
  if (!entry) return null;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-[var(--ink)] tracking-tight">스폰지크루 활동 알림</h2>
        <p className="text-xs text-[var(--ink-30)] mt-1 font-medium">크루들의 실시간 활동을 확인하세요</p>
      </div>
      <div className="bg-[var(--yellow)] border-2 border-[var(--ink-10)] overflow-hidden">
        <div className={`flex items-center gap-3 px-5 py-4 transition-all duration-400 ${isAnimating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}`}>
          <div className="flex-shrink-0 relative">
            {entry.profile_image ? (
              <img src={entry.profile_image} alt={entry.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--ink-10)]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--ink-05)] flex items-center justify-center text-sm font-extrabold text-[var(--ink-50)]">{entry.name.charAt(0)}</div>
            )}
            {entry.badge_icon && (
              <Image src={entry.badge_icon} alt="" width={18} height={18}
                className="w-4.5 h-4.5 absolute -bottom-0.5 -right-0.5 bg-[var(--paper)] rounded-full border border-[var(--ink-10)] p-0.5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-extrabold text-[var(--ink)]">{entry.name}</span>
              <span className="text-[var(--ink-30)]"> — </span>
              <span className="font-bold text-[var(--ink)]">{entry.message}</span>
            </p>
            {entry.timestamp && (
              <p className="text-[11px] text-[var(--ink-30)] mt-0.5">
                {formatDistanceToNow(parseISO(entry.timestamp), { addSuffix: true, locale: ko })}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-[var(--ink-30)]">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Section ────────────────────────────────────────────────────────

function CalendarSection({ member, onLoginRequired }: { member: Member | null; onLoginRequired: () => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions?year=${currentMonth.getFullYear()}&month=${currentMonth.getMonth() + 1}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch { setSessions([]); }
    finally { setLoading(false); }
  }, [currentMonth]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleSessionClick = async (session: Session) => {
    setDetailLoading(true);
    try {
      const url = member ? `/api/sessions/${session.id}?member_id=${member.id}` : `/api/sessions/${session.id}`;
      const res = await fetch(url);
      const data = await res.json();
      setSelectedSession(data.session);
    } catch { /* */ } finally { setDetailLoading(false); }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (day: Date) => sessions.filter((s) => isSameDay(parseISO(s.scheduled_at), day));

  return (
    <section>
      <div className="md:grid md:grid-cols-5 md:gap-10 md:items-start">

        {/* 캘린더 그리드 */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--ink-05)] text-[var(--ink-30)] hover:text-[var(--ink)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h2 className="text-lg font-extrabold text-[var(--ink)]">{format(currentMonth, "yyyy년 M월")}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--ink-05)] text-[var(--ink-30)] hover:text-[var(--ink)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16"><p className="text-[var(--ink-30)] text-sm">로딩 중...</p></div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-1">
                {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                  <div key={d} className="text-center text-[11px] font-bold text-[var(--ink-30)] py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-t-2 border-l-2 border-[var(--ink-10)]">
                {days.map((day) => {
                  const daySessions = getSessionsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const hasCompletedSession = daySessions.some((s) => s.status === "COMPLETED");
                  const hasUpcomingSession = !isToday && daySessions.some((s) => s.status === "APPROVED" || s.status === "PENDING");
                  const dayBoxClass = isToday
                    ? "bg-[var(--yellow)] text-[var(--ink)] w-6 h-6 flex items-center justify-center mx-auto"
                    : hasUpcomingSession
                    ? "border-2 border-[var(--yellow)] text-[var(--ink)] w-6 h-6 flex items-center justify-center mx-auto"
                    : hasCompletedSession
                    ? "bg-[var(--ink-10)] text-[var(--ink-50)] w-6 h-6 flex items-center justify-center mx-auto"
                    : "text-[var(--ink-50)]";
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => daySessions.length > 0 && handleSessionClick(daySessions[0])}
                      className={`min-h-[60px] p-1.5 border-r-2 border-b-2 border-[var(--ink-10)] ${!isCurrentMonth ? "opacity-20" : ""} ${daySessions.length > 0 ? "cursor-pointer hover:bg-[var(--yellow-dim)] transition-colors" : ""}`}
                    >
                      <div className={`text-[11px] text-center mb-1 font-bold ${dayBoxClass}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5">
                        {daySessions.slice(0, 2).map((s) => {
                          const isCompleted = s.status === "COMPLETED";
                          return (
                            <div key={s.id} onClick={(e) => { e.stopPropagation(); handleSessionClick(s); }} className={`w-full text-left px-1 py-0.5 ${isCompleted ? "opacity-50" : ""}`} title={s.title}>
                              <span className={`text-[9px] font-semibold text-[var(--ink)] truncate block leading-tight ${isCompleted ? "line-through" : ""}`}>{s.title}</span>
                            </div>
                          );
                        })}
                        {daySessions.length > 2 && <p className="text-[9px] text-[var(--ink-30)] text-center font-bold">+{daySessions.length - 2}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 이번 달 공유회 리스트 */}
        <div className="md:col-span-2 mt-8 md:mt-0">
          {!loading && sessions.length > 0 && (
            <>
              <h3 className="text-lg font-extrabold text-[var(--ink)] mb-4">이번 달 공유회</h3>
              <div className="border-2 border-[var(--ink-10)] bg-[var(--paper)]">
                {(() => {
                  const sortedDesc = [...sessions].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
                  return (showAll ? sortedDesc : sortedDesc.slice(0, 5));
                })().map((s, i, arr) => {
                  const now = new Date();
                  const sessionDate = parseISO(s.scheduled_at);
                  const isPast = sessionDate < now;
                  const isFull = s.capacity !== null && s.attendee_count >= s.capacity;
                  const isCompleted = s.status === "COMPLETED";
                  const isCollecting = s.status === "PENDING";
                  const isConfirmed = s.status === "APPROVED";
                  const displayCompleted = isCompleted || (isPast && isConfirmed);

                  return (
                    <button key={s.id} onClick={() => handleSessionClick(s)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-[var(--yellow-dim)] transition-colors ${i < arr.length - 1 ? "border-b border-[var(--ink-10)]" : ""} ${isPast || isCompleted ? "opacity-40" : ""}`}>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--ink)] text-[var(--paper)] px-1.5 py-0.5">{CATEGORY_LABELS[s.category]}</span>
                            {displayCompleted && <span className="text-[10px] font-extrabold text-[var(--ink-50)] px-1.5 py-0.5 bg-[var(--ink-05)]">완료</span>}
                            {!displayCompleted && isCollecting && <span className="text-[10px] font-extrabold text-[var(--ink-50)] bg-[var(--ink-05)] px-1.5 py-0.5">알림 신청 진행 중</span>}
                            {!displayCompleted && isConfirmed && !isFull && (
                              <>
                                <span className="text-[10px] font-extrabold text-[var(--ink)] bg-[var(--yellow)] px-1.5 py-0.5">🎉 오픈 확정</span>
                                <span className="text-[10px] font-extrabold text-[var(--ink-50)] px-1.5 py-0.5">지금 신청하세요</span>
                              </>
                            )}
                            {!displayCompleted && isConfirmed && isFull && <span className="text-[10px] font-extrabold text-[var(--ink-50)] px-1.5 py-0.5 bg-[var(--ink-05)]">마감</span>}
                          </div>
                          <p className="text-sm font-bold text-[var(--ink)] leading-snug">{s.title}</p>
                          <p className="text-xs text-[var(--ink-30)] mt-0.5">{s.host_name}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-xs font-bold text-[var(--ink-50)] block">{format(sessionDate, "M/d (EEE)", { locale: ko })}</span>
                          <span className="text-xs text-[var(--ink-30)] block">{format(sessionDate, "HH:mm")}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {sessions.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 w-full py-2.5 text-xs font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)] uppercase tracking-widest border border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors"
                >
                  {showAll ? "접기" : `더보기 (${sessions.length - 5}개)`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/20 backdrop-blur-sm">
          <div className="bg-[var(--paper)] px-6 py-4 shadow-lg"><p className="text-[var(--ink-50)] text-sm">로딩 중...</p></div>
        </div>
      )}

      {selectedSession && (
        <SessionDetailModal session={selectedSession} member={member} onClose={() => setSelectedSession(null)} onLoginRequired={onLoginRequired} onRegistered={fetchSessions} />
      )}
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [rankTab, setRankTab] = useState<"ranking" | "group">("ranking");
  const [badgeTop3, setBadgeTop3] = useState<BadgeTop3Entry[]>([]);
  const [badgeFeed, setBadgeFeed] = useState<BadgeFeedEntry[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [teamMessages, setTeamMessages] = useState<string[]>([]);
  const [teamIndex, setTeamIndex] = useState(0);
  const [teamAnimating, setTeamAnimating] = useState(false);
  const [activityFeed, setActivityFeed] = useState<{ name: string; profile_image: string | null; message: string }[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => { setMember(data.member || null); setAuthChecked(true); }).catch(() => setAuthChecked(true));
    fetch("/api/achievements/feed").then((r) => r.json()).then((data) => { setBadgeTop3(data.top3 || []); setBadgeFeed(data.recent || []); }).catch(() => {});
    fetch("/api/activity/today").then((r) => r.json()).then((data) => { setTeamMessages(data.team || []); setActivityFeed(data.individual || []); }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ranking?type=${rankTab}`).then((r) => r.json()).then((data) => { setRanking(data.ranking || []); setLoading(false); }).catch(() => setLoading(false));
  }, [rankTab]);

  // 팀 메시지 로테이션
  useEffect(() => {
    if (teamMessages.length <= 1) return;
    const interval = setInterval(() => {
      setTeamAnimating(true);
      setTimeout(() => { setTeamIndex((prev) => (prev + 1) % teamMessages.length); setTeamAnimating(false); }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [teamMessages.length]);

  const openLogin = (redirect?: string) => {
    setLoginRedirect(redirect || null);
    setShowLoginModal(true);
  };

  // Navbar의 로그인 버튼 이벤트 수신
  useEffect(() => {
    const handler = () => openLogin();
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <main>

        {/* ── Hero 섹션 ── */}
        <section className="bg-[var(--yellow)]">
          <div className="max-w-6xl mx-auto px-5 md:px-6 pt-16 md:pt-24">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink)] tracking-tight leading-tight">
              이기적으로 공유하고,<br />
              함께 성장하는 스폰지들
            </h2>

            {/* 팀 실시간 활동 피드 */}
            {teamMessages.length > 0 && (
              <div className="mt-8 md:mt-10 inline-flex items-center gap-3 bg-[var(--paper)] px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <p className={`text-sm md:text-base font-extrabold text-[var(--ink)] transition-all duration-400 ${teamAnimating ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"}`}>
                  {teamMessages[teamIndex]}
                </p>
              </div>
            )}

          </div>
          <div className="pb-16 md:pb-24" />
        </section>

        {/* ── 퀵 액션 ── */}
        <section className="border-b border-[var(--ink-10)]">
          <div className="max-w-6xl mx-auto px-5 md:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {member ? (
                <Link href="/missions"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] hover:border-[var(--ink-30)] transition-colors">
                  <span>🎯</span>
                  <span className="text-sm font-extrabold text-[var(--ink)]">과제현황판</span>
                </Link>
              ) : (
                <button onClick={() => openLogin("/missions")}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] hover:border-[var(--ink-30)] transition-colors">
                  <span>🎯</span>
                  <span className="text-sm font-extrabold text-[var(--ink)]">과제현황판</span>
                </button>
              )}
              <div
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] opacity-30 cursor-not-allowed">
                <span>💬</span>
                <span className="text-sm font-extrabold text-[var(--ink)]">크루챗 종료</span>
              </div>
              {member ? (
                <a href="https://sponge-dressup.vercel.app/"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] hover:border-[var(--ink-30)] transition-colors">
                  <span>🧽</span>
                  <span className="text-sm font-extrabold text-[var(--ink)]">캐릭터 만들기</span>
                </a>
              ) : (
                <button onClick={() => openLogin("https://sponge-dressup.vercel.app/")}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] hover:border-[var(--ink-30)] transition-colors">
                  <span>🧽</span>
                  <span className="text-sm font-extrabold text-[var(--ink)]">캐릭터 만들기</span>
                </button>
              )}
              <button onClick={() => member ? setShowSuggestModal(true) : openLogin()}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] hover:border-[var(--ink-30)] transition-colors">
                <span>📣</span>
                <span className="text-sm font-extrabold text-[var(--ink)]">공유자 추천</span>
              </button>
              <Link href="/sessions/new"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[var(--ink-10)] bg-[var(--paper)] hover:border-[var(--ink-30)] transition-colors">
                <span>🎙️</span>
                <span className="text-sm font-extrabold text-[var(--ink)]">공유회 직접 열기</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 캘린더 + 이번 달 공유회 ── */}
        <section className="border-b border-[var(--ink-10)]">
          <div className="max-w-6xl mx-auto px-5 md:px-6 py-10 md:py-14">
            <CalendarSection member={member} onLoginRequired={() => openLogin()} />
          </div>
        </section>

        {/* ── 스폰지크루 활동 알림 + 배지 랭킹 + 활동 랭킹 ── */}
        <section className="border-b border-[var(--ink-10)] bg-[var(--ink-05)]">
          <div className="max-w-6xl mx-auto px-5 md:px-6 py-10 md:py-14">

            {/* 라이브 티커 */}
            {(badgeFeed.length > 0 || activityFeed.length > 0) && (
              <div className="mb-10">
                <LiveTicker badgeFeed={badgeFeed} activityFeed={activityFeed} />
              </div>
            )}

            <div className="md:grid md:grid-cols-2 md:gap-12">

              {/* 배지 랭킹 */}
              {badgeTop3.length > 0 && (
                <div>
                  <div className="mb-5">
                    <h2 className="text-xl font-extrabold text-[var(--ink)] tracking-tight">배지 랭킹</h2>
                    <p className="text-xs text-[var(--ink-30)] mt-1 font-medium">활동으로 바다 친구들을 모아보세요</p>
                  </div>
                  <div className="bg-[var(--paper)] border-2 border-[var(--ink-10)] flex flex-col">
                    {badgeTop3.map((entry, i) => (
                      <div key={entry.member_id} className={`flex items-center gap-4 px-5 py-5 flex-1 hover:bg-[var(--yellow-dim)] transition-colors ${i < badgeTop3.length - 1 ? "border-b border-[var(--ink-10)]" : ""}`}>
                        <div className="flex-shrink-0 relative">
                          {entry.profile_image ? (
                            <img src={entry.profile_image} alt={entry.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[var(--ink-05)] flex items-center justify-center text-sm font-extrabold text-[var(--ink-50)]">{entry.name.charAt(0)}</div>
                          )}
                          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[var(--yellow)] text-[10px] font-extrabold text-[var(--ink)]">
                            {entry.rank}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--ink)] text-sm">{entry.name}</p>
                          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                            {entry.badges.map((b) => (
                              <div key={b.slug} className="flex items-center gap-1 border border-[var(--ink-10)] bg-[var(--paper)] pl-0.5 pr-2 py-0.5">
                                <Image src={b.icon} alt={b.name} width={18} height={18} className="w-4.5 h-4.5" />
                                <span className="text-[10px] text-[var(--ink-50)] font-semibold">{b.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xl font-extrabold text-[var(--ink)] tabular-nums">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 활동 랭킹 */}
              <div className={badgeTop3.length > 0 ? "mt-10 md:mt-0" : ""}>
                <div className="mb-5">
                  <h2 className="text-xl font-extrabold text-[var(--ink)] tracking-tight">활동 랭킹</h2>
                  <p className="text-xs text-[var(--ink-30)] mt-1 font-medium">많이 벌고 많이 쓸수록 올라가요</p>
                </div>

                <div className="flex border-2 border-[var(--ink)] mb-5">
                  <button onClick={() => setRankTab("ranking")}
                    className={`flex-1 py-2.5 text-xs font-extrabold transition-colors ${rankTab === "ranking" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"}`}>
                    누적
                  </button>
                  <button onClick={() => setRankTab("group")}
                    className={`flex-1 py-2.5 text-xs font-extrabold transition-colors border-l-2 border-[var(--ink)] ${rankTab === "group" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink-05)]"}`}>
                    조별 누적
                  </button>
                </div>

                {rankTab === "group" && (
                  <p className="text-[11px] text-[var(--ink-30)] mb-3 leading-snug">
                    조별 인원수 차이 보정을 위해 <b>1인 평균(총합 ÷ 조 인원)</b> 기준으로 순위가 매겨져요.
                  </p>
                )}

                {loading ? (
                  <div className="text-center py-16"><p className="text-[var(--ink-30)] text-sm">로딩 중...</p></div>
                ) : ranking.length === 0 ? (
                  <p className="text-center py-12 text-[var(--ink-30)] text-sm">아직 기록이 없어요</p>
                ) : (
                  <div className="bg-[var(--paper)] border-2 border-[var(--ink-10)]">
                    {ranking.map((entry, i) => (
                      <div key={entry.member_id} className={`flex items-center gap-4 px-5 py-4.5 hover:bg-[var(--yellow-dim)] transition-colors ${i < ranking.length - 1 ? "border-b border-[var(--ink-10)]" : ""}`}>
                        <div className="flex-shrink-0 relative">
                          {entry.profile_image ? (
                            <img src={entry.profile_image} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--ink-05)] flex items-center justify-center text-sm font-extrabold text-[var(--ink-50)]">{entry.name.charAt(0)}</div>
                          )}
                          {entry.rank <= 3 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[var(--yellow)] text-[9px] font-extrabold text-[var(--ink)]">{entry.rank}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--ink)] truncate">{entry.name}</p>
                          {rankTab === "group" && entry.member_count !== undefined ? (
                            <p className="text-[11px] text-[var(--ink-30)] mt-0.5 tabular-nums font-medium">
                              전체 {entry.total}🐚 / {entry.member_count}명
                            </p>
                          ) : (entry.earned !== undefined || entry.spent !== undefined) && (
                            <p className="text-[11px] text-[var(--ink-30)] mt-0.5 tabular-nums font-medium">
                              +{entry.earned ?? 0} / -{entry.spent ?? 0}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-baseline gap-0.5">
                          {rankTab === "group" && entry.avg !== undefined ? (
                            <>
                              <span className="text-lg font-extrabold text-[var(--ink)] tabular-nums">{entry.avg}</span>
                              <span className="text-[10px] text-[var(--ink-30)] font-bold">/인</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-extrabold text-[var(--ink)] tabular-nums">{entry.total}</span>
                              <span className="text-[10px] text-[var(--ink-30)] font-bold">셸</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── VOD ── */}
        <section>
          <div className="max-w-6xl mx-auto px-5 md:px-6 py-10 md:py-14">
            <VodSection member={member} onLoginRequired={() => openLogin()} />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[var(--ink-10)] py-8">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <p className="text-center text-xs text-[var(--ink-30)] font-medium">셸은 멤버들의 인정의 표시에요</p>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal onClose={() => { setShowLoginModal(false); setLoginRedirect(null); }} onSuccess={(m) => { setMember(m); setShowLoginModal(false); window.location.href = loginRedirect || "/mypage"; setLoginRedirect(null); }} />
      )}

      {showSuggestModal && (
        <SuggestModal onClose={() => setShowSuggestModal(false)} />
      )}
    </div>
  );
}
