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
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RankingEntry {
  rank: number;
  member_id: string;
  name: string;
  total: number;
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

// no rank tabs needed

// ─── Category Helpers ────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  AI: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  CAREER: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  FINANCE: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  LIFESTYLE: { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
};

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

  const handleLogin = async () => {
    if (!name.trim() || !pin) {
      setError("이름과 PIN을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "로그인에 실패했어요.");
      } else {
        onSuccess(data.member);
      }
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">로그인</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">PIN (숫자 4자리)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="0000"
              className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm text-center tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <p className="text-xs text-slate-400 text-center">초기 PIN은 0000이에요</p>
        </div>
        <button onClick={onClose} className="mt-3 w-full text-center text-sm text-cyan-500">
          닫기
        </button>
      </div>
    </div>
  );
}

// ─── Member Picker Modal ────────────────────────────────────────────────────

function MemberPickerModal({
  onClose,
  onSelect,
  title,
}: {
  onClose: () => void;
  onSelect: (member: MemberOption) => void;
  title: string;
}) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((data) => {
        setMembers(
          (data.members || [])
            .filter((m: MemberOption & { is_active: boolean }) => m.is_active)
            .map((m: MemberOption) => ({ id: m.id, name: m.name, shell_balance: m.shell_balance }))
        );
        setLoading(false);
      });
  }, []);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-800 mb-3">{title}</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름을 입력하세요..."
          autoFocus
          className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm mb-3"
        />
        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-center py-4 text-cyan-500 text-sm">로딩 중...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-4 text-slate-400 text-sm">검색 결과가 없어요</p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cyan-50 transition-colors flex justify-between items-center"
              >
                <span className="text-sm text-slate-800 font-medium">{m.name}</span>
                <span className="text-xs text-cyan-500">{m.shell_balance}셸</span>
              </button>
            ))
          )}
        </div>
        <button onClick={onClose} className="mt-3 w-full text-center text-sm text-cyan-500">닫기</button>
      </div>
    </div>
  );
}

// ─── Session Detail Modal ────────────────────────────────────────────────────

function SessionDetailModal({
  session,
  member,
  onClose,
  onLoginRequired,
  onRegistered,
}: {
  session: SessionDetail;
  member: Member | null;
  onClose: () => void;
  onLoginRequired: () => void;
  onRegistered: () => void;
}) {
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const cat = CATEGORY_COLORS[session.category] || CATEGORY_COLORS.AI;

  const handleRegister = async (memberId: string) => {
    setShowPicker(false);
    setRegistering(true);
    setError("");

    try {
      const res = await fetch(`/api/sessions/${session.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "신청에 실패했어요.");
      } else {
        setSuccess(true);
        onRegistered();
      }
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setRegistering(false);
    }
  };

  const handleApplyClick = () => {
    if (member) {
      handleRegister(member.id);
    } else {
      setShowPicker(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>
              {CATEGORY_LABELS[session.category]}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">{session.title}</h2>
          {session.description && <p className="text-sm text-slate-600 mb-4">{session.description}</p>}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">진행자</span>
              <span className="text-slate-800 font-medium">{session.host_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">일시</span>
              <span className="text-slate-800 font-medium">
                {format(parseISO(session.scheduled_at), "M월 d일 (EEE) HH:mm", { locale: ko })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">가격</span>
              <span className="text-slate-800 font-medium">{session.entry_cost}셸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">참석자</span>
              <span className="text-slate-800 font-medium">
                {session.attendee_count}명{session.capacity ? ` / ${session.capacity}명` : ""}
              </span>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          {success ? (
            <div className="text-center py-3 bg-green-50 rounded-xl">
              <p className="text-green-700 font-medium">🎉 신청 완료!</p>
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              disabled={registering}
              className="w-full py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {registering ? "신청 중..." : `${session.entry_cost}셸 신청하기`}
            </button>
          )}
          <button onClick={onClose} className="mt-3 w-full text-center text-sm text-cyan-500">닫기</button>
        </div>
      </div>
      {showPicker && (
        <MemberPickerModal
          title="본인 이름을 선택하세요"
          onClose={() => setShowPicker(false)}
          onSelect={(m) => handleRegister(m.id)}
        />
      )}
    </>
  );
}

// ─── Calendar Section ────────────────────────────────────────────────────────

function CalendarSection({ member, onLoginRequired }: { member: Member | null; onLoginRequired: () => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    try {
      const res = await fetch(`/api/sessions?year=${year}&month=${month}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleSessionClick = async (session: Session) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}`);
      const data = await res.json();
      setSelectedSession(data.session);
    } catch { /* */ } finally {
      setDetailLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (day: Date) =>
    sessions.filter((s) => isSameDay(parseISO(s.scheduled_at), day));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-cyan-100 text-cyan-600 transition-colors">&lt;</button>
        <h2 className="text-lg font-bold text-slate-800">{format(currentMonth, "yyyy년 M월")}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-cyan-100 text-cyan-600 transition-colors">&gt;</button>
      </div>

      {loading ? (
        <div className="text-center py-8"><p className="text-cyan-500 animate-pulse">로딩 중...</p></div>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-1">
            {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-cyan-100 rounded-2xl overflow-hidden shadow-sm">
            {days.map((day) => {
              const daySessions = getSessionsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`min-h-[60px] p-1 bg-white ${!isCurrentMonth ? "opacity-40" : ""}`}>
                  <div className={`text-xs text-center mb-0.5 ${isToday ? "bg-cyan-500 text-white w-5 h-5 rounded-full flex items-center justify-center mx-auto font-bold" : "text-slate-700"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {daySessions.slice(0, 3).map((s) => (
                      <button key={s.id} onClick={() => handleSessionClick(s)} className="w-full flex items-center gap-0.5 px-0.5 py-0.5 rounded hover:bg-cyan-50" title={s.title}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[s.category]?.dot || "bg-gray-400"}`} />
                        <span className="text-[10px] text-slate-700 truncate leading-tight">{s.title}</span>
                      </button>
                    ))}
                    {daySessions.length > 3 && <p className="text-[9px] text-slate-400 text-center">+{daySessions.length - 3}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {sessions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-bold text-slate-800">이번 달 공유회</h3>
              {sessions.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).map((s) => {
                const cat = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.AI;
                const now = new Date();
                const sessionDate = parseISO(s.scheduled_at);
                const isPast = sessionDate < now;
                const isFull = s.capacity !== null && s.attendee_count >= s.capacity;
                const statusTag = isPast
                  ? { label: "종료", bg: "bg-gray-100", text: "text-gray-500" }
                  : isFull
                    ? { label: "신청 마감", bg: "bg-red-50", text: "text-red-500" }
                    : { label: "신청 중", bg: "bg-green-50", text: "text-green-600" };

                return (
                  <button key={s.id} onClick={() => handleSessionClick(s)} className="w-full text-left px-4 py-3 bg-white border border-cyan-100 rounded-2xl hover:border-cyan-300 hover:shadow-md transition-all shadow-sm">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
                          <span className={`text-xs font-medium ${cat.text}`}>{CATEGORY_LABELS[s.category]}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{s.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.host_name}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs text-slate-400 block">{format(sessionDate, "M/d (EEE)", { locale: ko })}</span>
                        <span className="text-xs text-slate-400 block">{format(sessionDate, "HH:mm")}</span>
                        <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded mt-1 ${statusTag.bg} ${statusTag.text}`}>{statusTag.label}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-lg"><p className="text-cyan-600 animate-pulse">로딩 중...</p></div>
        </div>
      )}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          member={member}
          onClose={() => setSelectedSession(null)}
          onLoginRequired={onLoginRequired}
          onRegistered={fetchSessions}
        />
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [rankType, setRankType] = useState<"weekly" | "ranking" | "group">("weekly");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { setMember(data.member || null); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ranking?type=${rankType}`)
      .then((r) => r.json())
      .then((data) => { setRanking(data.ranking || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [rankType]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMember(null);
  };

  const getMedal = (rank: number) => {
    if (rank === 1) return "\uD83E\uDD47";
    if (rank === 2) return "\uD83E\uDD48";
    if (rank === 3) return "\uD83E\uDD49";
    return `${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-50 to-cyan-50">
      {/* Header */}
      <div style={{ backgroundColor: "#E9ED12" }} className="shadow-md">
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">이기적인 스폰지들</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/sessions/new"
                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
              >
                공유회 열기
              </Link>
              {authChecked && (
                member ? (
                  <Link
                    href="/mypage"
                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    마이페이지
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    로그인
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 공유회 캘린더 */}
        <CalendarSection member={member} onLoginRequired={() => setShowLoginModal(true)} />

        {/* 구분선 */}
        <div className="border-t border-cyan-200 my-2" />

        {/* 활동 랭킹 */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1">활동 랭킹</h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            잔고가 아닌, 적립하고 사용한 🐚의 총합입니다. 많이 벌고 많이 쓸수록 높아져요. 이기적공유에 활발히 참여해보세요!
          </p>
          <div className="mb-4">
            <div className="flex rounded-xl bg-cyan-100 p-0.5">
              <button
                onClick={() => setRankType("weekly")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  rankType === "weekly" ? "bg-white text-slate-800 shadow-sm" : "text-cyan-700"
                }`}
              >
                이번 주
              </button>
              <button
                onClick={() => setRankType("ranking")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  rankType === "ranking" ? "bg-white text-slate-800 shadow-sm" : "text-cyan-700"
                }`}
              >
                누적
              </button>
              <button
                onClick={() => setRankType("group")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  rankType === "group" ? "bg-white text-slate-800 shadow-sm" : "text-cyan-700"
                }`}
              >
                조별 누적
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8"><p className="text-cyan-500 animate-pulse">로딩 중...</p></div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🐚</p>
              <p className="text-slate-500">아직 기록이 없어요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.map((entry) => (
                <div
                  key={entry.member_id}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                    entry.rank <= 3 ? "bg-white shadow-md border border-cyan-100" : "bg-white/60 border border-cyan-50 shadow-sm"
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                    entry.rank === 1 ? "bg-yellow-100 text-yellow-700 text-lg"
                      : entry.rank === 2 ? "bg-gray-100 text-gray-600 text-lg"
                        : entry.rank === 3 ? "bg-orange-100 text-orange-600 text-lg"
                          : "bg-cyan-50 text-cyan-600"
                  }`}>
                    {getMedal(entry.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${entry.rank <= 3 ? "text-slate-800" : "text-slate-700 text-sm"}`}>
                      {entry.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`font-bold ${entry.rank <= 3 ? "text-slate-800" : "text-slate-600 text-sm"}`}>
                      {entry.total}
                    </span>
                    <span className="ml-0.5 text-xs">🐚</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 pb-8">셸은 멤버들의 인정의 표시에요</p>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={(m) => { setMember(m); setShowLoginModal(false); window.location.href = "/mypage"; }} />
      )}
    </div>
  );
}
