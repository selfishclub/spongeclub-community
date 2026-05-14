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
}

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
  const [vodRequested, setVodRequested] = useState(false);
  const [vodLoading, setVodLoading] = useState(false);
  const [vodError, setVodError] = useState("");
  const [vodSuccess, setVodSuccess] = useState(false);

  // 본인이 이 세션 VOD 를 이미 신청했는지 체크
  useEffect(() => {
    if (!member) { setVodRequested(false); return; }
    fetch(`/api/sessions/${session.id}/vod-request`)
      .then((r) => r.json())
      .then((data) => setVodRequested(!!data.requested))
      .catch(() => {});
  }, [member, session.id]);

  const handleVodRequest = async () => {
    if (!member) { onLoginRequired(); return; }
    setVodLoading(true); setVodError("");
    try {
      const res = await fetch(`/api/sessions/${session.id}/vod-request`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setVodError(data.error || "신청에 실패했어요.");
        if (res.status === 409) setVodRequested(true);
      } else {
        setVodSuccess(true);
        setVodRequested(true);
      }
    } catch { setVodError("네트워크 오류가 발생했어요."); }
    finally { setVodLoading(false); }
  };

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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
        <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[var(--yellow)] text-[var(--ink)] mb-3">
            {CATEGORY_LABELS[session.category]}
          </span>
          <h2 className="text-xl font-extrabold text-[var(--ink)] mb-2 leading-tight">{session.title}</h2>
          {session.description && <p className="text-sm text-[var(--ink-50)] mb-5 leading-relaxed">{session.description}</p>}
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
          {session.status === "COMPLETED" ? (
            <div className="text-center py-4 bg-[var(--ink-05)]"><p className="text-[var(--ink-50)] font-extrabold">완료된 공유회입니다</p></div>
          ) : success ? (
            <div className="text-center py-4 bg-[var(--yellow)]"><p className="text-[var(--ink)] font-extrabold">신청 완료!</p></div>
          ) : (
            <button onClick={() => member ? handleRegister(member.id) : setShowPicker(true)} disabled={registering}
              className="w-full py-3.5 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity">
              {registering ? "신청 중..." : `${session.entry_cost}셸로 공유회 참여 신청하기`}
            </button>
          )}

          {/* VOD 구매 신청 */}
          <div className="mt-3 pt-3 border-t border-[var(--ink-10)]">
            {vodError && <p className="text-xs text-red-500 font-medium mb-2">{vodError}</p>}
            {vodRequested || vodSuccess ? (
              <div className="text-center py-3 bg-[var(--ink-05)]">
                <p className="text-[var(--ink-50)] text-xs font-extrabold">📼 VOD 신청 완료 — 어드민 검토 중</p>
              </div>
            ) : (
              <button
                onClick={handleVodRequest}
                disabled={vodLoading}
                className="w-full py-3 bg-[var(--paper)] border-2 border-[var(--ink)] text-[var(--ink)] font-bold text-sm hover:bg-[var(--ink-05)] disabled:opacity-40 transition-colors"
              >
                {vodLoading ? "신청 중..." : `(참여 불가한 경우) VOD구매 신청하기`}
              </button>
            )}
            <p className="mt-2 text-[10px] text-[var(--ink-30)] text-center leading-snug">
              신청만 무료. 어드민이 영상 권한을 부여할 때 셸이 차감됩니다.
            </p>
          </div>

          <button onClick={onClose} className="mt-3 w-full text-center text-sm text-[var(--ink-30)] hover:text-[var(--ink)]">닫기</button>
        </div>
      </div>
      {showPicker && <MemberPickerModal title="본인 이름을 선택하세요" onClose={() => setShowPicker(false)} onSelect={(m) => handleRegister(m.id)} />}
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

// ─── Badge Ticker ───────────────────────────────────────────────────────────

function BadgeTicker({ feed }: { feed: BadgeFeedEntry[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (feed.length <= 1) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => { setCurrentIndex((prev) => (prev + 1) % feed.length); setIsAnimating(false); }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [feed.length]);

  const entry = feed[currentIndex];
  if (!entry) return null;

  return (
    <div className="border-2 border-[var(--ink-10)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--yellow)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink)] animate-pulse" />
        <span className="text-[10px] font-extrabold text-[var(--ink)] uppercase tracking-widest">Live</span>
        <div className="flex gap-1 ml-auto">
          {feed.slice(0, 5).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-[var(--ink)]" : "bg-[var(--ink-30)]"}`} />
          ))}
        </div>
      </div>
      <div className={`flex items-center gap-3 px-4 py-3.5 bg-[var(--paper)] transition-all duration-400 ${isAnimating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}`}>
        <div className="flex-shrink-0 relative">
          {entry.profile_image ? (
            <img src={entry.profile_image} alt={entry.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--ink-10)]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--ink-05)] flex items-center justify-center text-sm font-extrabold text-[var(--ink-50)]">{entry.name.charAt(0)}</div>
          )}
          <Image src={entry.badge_icon} alt={entry.badge_name} width={20} height={20}
            className="w-5 h-5 absolute -bottom-0.5 -right-0.5 bg-[var(--paper)] rounded-full border border-[var(--ink-10)] p-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-extrabold text-[var(--ink)]">{entry.name}</span>
            <span className="text-[var(--ink-30)]"> — </span>
            <span className="font-bold" style={{ color: "#0A0A0A" }}>{entry.badge_name}</span>
          </p>
          <p className="text-[11px] text-[var(--ink-30)] mt-0.5">
            {formatDistanceToNow(parseISO(entry.earned_at), { addSuffix: true, locale: ko })}
          </p>
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
    try { const res = await fetch(`/api/sessions/${session.id}`); const data = await res.json(); setSelectedSession(data.session); }
    catch { /* */ } finally { setDetailLoading(false); }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (day: Date) => sessions.filter((s) => isSameDay(parseISO(s.scheduled_at), day));

  return (
    <section>
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
              const hasUpcomingSession = !isToday && daySessions.some((s) => s.status === "APPROVED");
              const dayBoxClass = isToday
                ? "bg-[var(--yellow)] text-[var(--ink)] w-6 h-6 flex items-center justify-center mx-auto"
                : hasUpcomingSession
                ? "border-2 border-[var(--yellow)] text-[var(--ink)] w-6 h-6 flex items-center justify-center mx-auto"
                : hasCompletedSession
                ? "bg-[var(--ink-10)] text-[var(--ink-50)] w-6 h-6 flex items-center justify-center mx-auto"
                : "text-[var(--ink-50)]";
              return (
                <div key={day.toISOString()} className={`min-h-[60px] p-1.5 border-r-2 border-b-2 border-[var(--ink-10)] ${!isCurrentMonth ? "opacity-20" : ""}`}>
                  <div className={`text-[11px] text-center mb-1 font-bold ${dayBoxClass}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {daySessions.slice(0, 2).map((s) => {
                      const isCompleted = s.status === "COMPLETED";
                      return (
                        <button key={s.id} onClick={() => handleSessionClick(s)} className={`w-full text-left px-1 py-0.5 hover:bg-[var(--yellow-dim)] transition-colors ${isCompleted ? "opacity-50" : ""}`} title={s.title}>
                          <span className={`text-[9px] font-semibold text-[var(--ink)] truncate block leading-tight ${isCompleted ? "line-through" : ""}`}>{s.title}</span>
                        </button>
                      );
                    })}
                    {daySessions.length > 2 && <p className="text-[9px] text-[var(--ink-30)] text-center font-bold">+{daySessions.length - 2}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {sessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-4">이번 달 공유회</h3>
              <div className="space-y-1">
                {(() => {
                  const sortedDesc = [...sessions].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
                  return (showAll ? sortedDesc : sortedDesc.slice(0, 3));
                })().map((s) => {
                  const now = new Date();
                  const sessionDate = parseISO(s.scheduled_at);
                  const isPast = sessionDate < now;
                  const isFull = s.capacity !== null && s.attendee_count >= s.capacity;
                  const isCompleted = s.status === "COMPLETED";

                  return (
                    <button key={s.id} onClick={() => handleSessionClick(s)}
                      className={`w-full text-left px-4 py-3.5 border-b border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors ${isPast || isCompleted ? "opacity-40" : ""}`}>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--ink)] text-[var(--paper)] px-1.5 py-0.5">{CATEGORY_LABELS[s.category]}</span>
                            {isCompleted && <span className="text-[10px] font-extrabold text-[var(--ink-50)] px-1.5 py-0.5 bg-[var(--ink-05)]">완료</span>}
                            {!isCompleted && !isPast && !isFull && <span className="text-[10px] font-extrabold text-[var(--ink)] bg-[var(--yellow)] px-1.5 py-0.5">모집 중</span>}
                            {!isCompleted && isFull && <span className="text-[10px] font-extrabold text-[var(--ink-50)] px-1.5 py-0.5 bg-[var(--ink-05)]">마감</span>}
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
              {sessions.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 w-full py-2.5 text-xs font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)] uppercase tracking-widest border border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors"
                >
                  {showAll ? "접기" : `더보기 (${sessions.length - 3}개)`}
                </button>
              )}
            </div>
          )}
        </>
      )}

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
  const [authChecked, setAuthChecked] = useState(false);
  const [rankTab, setRankTab] = useState<"ranking" | "group">("ranking");
  const [badgeTop3, setBadgeTop3] = useState<BadgeTop3Entry[]>([]);
  const [badgeFeed, setBadgeFeed] = useState<BadgeFeedEntry[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => { setMember(data.member || null); setAuthChecked(true); }).catch(() => setAuthChecked(true));
    fetch("/api/achievements/feed").then((r) => r.json()).then((data) => { setBadgeTop3(data.top3 || []); setBadgeFeed(data.recent || []); }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ranking?type=${rankTab}`).then((r) => r.json()).then((data) => { setRanking(data.ranking || []); setLoading(false); }).catch(() => setLoading(false));
  }, [rankTab]);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[var(--paper)] border-b-2 border-[var(--ink)]">
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between">
          <h1 className="text-base font-extrabold text-[var(--ink)] tracking-tight">🧽 이기적인 스폰지들</h1>
          {authChecked && (
            member ? (
              <Link href="/mypage"
                className="px-4 py-2 border-2 border-[var(--ink)] text-[var(--ink)] text-xs font-extrabold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
                마이페이지
              </Link>
            ) : (
              <button onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 border-2 border-[var(--ink)] text-[var(--ink)] text-xs font-extrabold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
                로그인
              </button>
            )
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-10 pb-20 space-y-14">

        {/* ── 주차별 미션 현황판 진입 카드 (강조 CTA) ── */}
        <Link
          href="/missions"
          className="block border-2 border-[var(--ink)] bg-[var(--yellow)] hover:opacity-80 transition-opacity p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold text-[var(--ink)] tracking-wider uppercase opacity-70">
                스폰지클럽 1기
              </div>
              <div className="text-base font-extrabold text-[var(--ink)] mt-1 leading-tight">
                🎯 주차별 미션 현황판
              </div>
              <div className="text-xs text-[var(--ink)] mt-1.5 font-medium opacity-70">
                공지 · 미션 · 진척 · 질문을 한 화면에서
              </div>
            </div>
            <span aria-hidden className="text-xl font-extrabold text-[var(--ink)]">→</span>
          </div>
        </Link>

        {/* ── 캘린더 ── */}
        <CalendarSection member={member} onLoginRequired={() => setShowLoginModal(true)} />

        {/* ── 공유회 액션 ── */}
        <div className="flex gap-0">
          <button onClick={() => setShowSuggestModal(true)}
            className="flex-1 py-3.5 border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm font-extrabold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
            공유자 추천하기
          </button>
          <Link href="/sessions/new"
            className="flex-1 py-3.5 border-2 border-l-0 border-[var(--ink)] bg-[var(--yellow)] text-[var(--ink)] text-sm font-extrabold hover:opacity-80 transition-opacity text-center">
            공유회 직접 열기
          </Link>
        </div>

        {/* ── 배지 랭킹 ── */}
        {(badgeTop3.length > 0 || badgeFeed.length > 0) && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-[var(--ink)] tracking-tight">배지 랭킹</h2>
              <p className="text-xs text-[var(--ink-30)] mt-1 font-medium">활동으로 바다 친구들을 모아보세요</p>
            </div>

            {badgeTop3.length > 0 && (
              <div className="space-y-0 mb-5 border-t-2 border-[var(--ink-10)]">
                {badgeTop3.map((entry) => (
                  <div key={entry.member_id} className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors">
                    <div className="flex-shrink-0 relative">
                      {entry.profile_image ? (
                        <img src={entry.profile_image} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--ink-05)] flex items-center justify-center text-sm font-extrabold text-[var(--ink-50)]">{entry.name.charAt(0)}</div>
                      )}
                      <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[var(--yellow)] text-[10px] font-extrabold text-[var(--ink)]">
                        {entry.rank}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--ink)] text-sm">{entry.name}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                        {entry.badges.map((b) => (
                          <div key={b.slug} className="flex items-center gap-1 border border-[var(--ink-10)] pl-0.5 pr-2 py-0.5">
                            <Image src={b.icon} alt={b.name} width={16} height={16} className="w-4 h-4" />
                            <span className="text-[10px] text-[var(--ink-50)] font-semibold">{b.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--ink)] tabular-nums">{entry.count}</span>
                  </div>
                ))}
              </div>
            )}

            {badgeFeed.length > 0 && <BadgeTicker feed={badgeFeed} />}
          </section>
        )}

        {/* ── 활동 랭킹 ── */}
        <section>
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
            <div className="border-t-2 border-[var(--ink-10)]">
              {ranking.map((entry) => (
                <div key={entry.member_id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--ink-10)] hover:bg-[var(--yellow-dim)] transition-colors">
                  <div className="flex-shrink-0 relative">
                    {entry.profile_image ? (
                      <img src={entry.profile_image} alt={entry.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[var(--ink-05)] flex items-center justify-center text-sm font-extrabold text-[var(--ink-50)]">{entry.name.charAt(0)}</div>
                    )}
                    {entry.rank <= 3 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[var(--yellow)] text-[8px] font-extrabold text-[var(--ink)]">{entry.rank}</span>
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
        </section>
      </main>

      <footer className="border-t-2 border-[var(--ink-10)] py-8">
        <p className="text-center text-xs text-[var(--ink-30)] font-medium">셸은 멤버들의 인정의 표시에요</p>
      </footer>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={(m) => { setMember(m); setShowLoginModal(false); window.location.href = "/mypage"; }} />
      )}

      {showSuggestModal && (
        <SuggestModal onClose={() => setShowSuggestModal(false)} />
      )}
    </div>
  );
}
