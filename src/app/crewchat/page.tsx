"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CrewCard {
  id: string;
  name: string;
  profile_image: string | null;
  group_number: number | null;
  has_profile: boolean;
  job_title?: string;
  field?: string;
  want_to_meet?: string;
  sns_instagram?: string;
  sns_blog?: string;
  sns_linkedin?: string;
  sns_threads?: string;
  sns_portfolio?: string;
}

// ─── SNS Icons (진한 색상) ──────────────────────────────────────────────────

function SnsIcons({ card }: { card: CrewCard }) {
  const links = [
    { value: card.sns_instagram, href: (v: string) => v.startsWith("http") ? v : `https://instagram.com/${v.replace(/^@/, "")}`, label: "Instagram",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { value: card.sns_blog, href: (v: string) => v.startsWith("http") ? v : `https://${v}`, label: "Blog",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg> },
    { value: card.sns_linkedin, href: (v: string) => v.startsWith("http") ? v : `https://linkedin.com/in/${v}`, label: "LinkedIn",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { value: card.sns_threads, href: (v: string) => v.startsWith("http") ? v : `https://threads.net/@${v.replace(/^@/, "")}`, label: "Threads",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.749-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.168.408-2.209 1.332-2.933.88-.69 2.062-1.088 3.395-1.146.96-.042 1.83.043 2.605.196-.075-.472-.21-.879-.405-1.207-.363-.608-1.002-.916-1.901-.92h-.036c-.698.004-1.29.222-1.71.629l-1.433-1.452c.738-.73 1.74-1.128 2.903-1.157h.06c1.508.013 2.657.592 3.318 1.69.43.716.688 1.607.77 2.6.59.282 1.126.634 1.593 1.057 1.168 1.057 1.847 2.51 1.96 4.203.126 1.876-.456 3.704-1.735 5.14-1.792 2.013-4.406 3.07-7.769 3.145zm-.36-8.882c-.9.04-1.59.27-2.003.593-.34.267-.504.6-.483.993.035.632.554 1.217 1.665 1.5.517.131 1.07.17 1.635.102.844-.101 1.49-.474 1.92-1.108.33-.487.555-1.12.67-1.885-.555-.128-1.166-.21-1.81-.21-.2 0-.4.005-.594.015z"/></svg> },
    { value: card.sns_portfolio, href: (v: string) => v.startsWith("http") ? v : `https://${v}`, label: "Portfolio",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> },
  ];

  const activeLinks = links.filter((l) => l.value);
  if (activeLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5 mt-2">
      {activeLinks.map((l) => (
        <a
          key={l.label}
          href={l.href(l.value!)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--ink)] hover:text-[var(--yellow)] transition-colors"
          title={l.label}
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}

// ─── Detail Modal ───────────────────────────────────────────────────────────

function DetailModal({ card, onClose }: { card: CrewCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-5">
          {card.profile_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={card.profile_image} alt={card.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--yellow)] flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--yellow)] flex items-center justify-center text-xl font-extrabold text-[var(--ink)] flex-shrink-0">
              {card.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-lg font-extrabold text-[var(--ink)]">{card.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {card.job_title && (
                <span className="text-[10px] font-bold bg-[var(--ink-05)] text-[var(--ink-50)] px-1.5 py-0.5">
                  {card.job_title}
                </span>
              )}
              {card.field && (
                <span className="text-[10px] font-bold bg-[var(--yellow-dim)] text-[var(--ink)] px-1.5 py-0.5">
                  {card.field}
                </span>
              )}
            </div>
            <SnsIcons card={card} />
          </div>
        </div>

        {card.want_to_meet && (
          <div className="bg-[var(--ink-05)] p-4 mb-5">
            <p className="text-[10px] font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-1.5">
              이런 크루와 얘기하고 싶어요
            </p>
            <p className="text-sm text-[var(--ink)] font-medium leading-relaxed whitespace-pre-wrap">
              {card.want_to_meet}
            </p>
          </div>
        )}

        <button onClick={onClose}
          className="w-full py-3 bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 transition-opacity">
          닫기
        </button>
      </div>
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface GroupData {
  group_number: number;
  members: CrewCard[];
}

interface Member {
  id: string;
  name: string;
}

// ─── Login Modal ─────────────────────────────────────────────────────────────

function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "로그인에 실패했어요.");
      else onSuccess();
    } catch { setError("네트워크 오류가 발생했어요."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold text-[var(--ink)] mb-2">로그인</h2>
        <p className="text-xs text-[var(--ink-30)] mb-6 font-medium">프로필을 작성하려면 로그인이 필요해요</p>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-bold text-[var(--ink-50)] mb-1.5 uppercase tracking-wider">이름</label>
            <input type="text" value={name}
              onChange={(e) => { setName(e.target.value); setSelected(false); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="이름을 입력하세요" autoComplete="off"
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors" />
            {showDropdown && !selected && filtered.length > 0 && (
              <div className="absolute left-0 right-0 z-10 mt-1 bg-[var(--paper)] border-2 border-[var(--ink-10)] shadow-lg max-h-48 overflow-y-auto">
                {filtered.slice(0, 20).map((m) => (
                  <button key={m.id} type="button" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setName(m.name); setSelected(true); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--ink)] font-medium hover:bg-[var(--yellow-dim)] transition-colors border-b border-[var(--ink-05)] last:border-0">
                    {m.name}
                  </button>
                ))}
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

// ─── Card Height & Clamp ────────────────────────────────────────────────────

const CARD_HEIGHT = "h-[200px]";
const WANT_TO_MEET_LIMIT = 40;

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CrewChatPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [detailCard, setDetailCard] = useState<CrewCard | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [requestModalTarget, setRequestModalTarget] = useState<CrewCard | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  // partner_id → { pending: boolean, completedCount: number }
  const [chatStatuses, setChatStatuses] = useState<Record<string, { pending: boolean; completedCount: number }>>({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setMember(data.member || null);
        setAuthChecked(true);
        if (data.member) {
          fetch("/api/crewchat/my-status")
            .then((r) => r.json())
            .then((d) => setChatStatuses(d.statuses || {}))
            .catch(() => {});
        }
      })
      .catch(() => setAuthChecked(true));
    fetch("/api/crewchat")
      .then((r) => r.json())
      .then((data) => {
        setGroups(data.groups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openRequestModal = (card: CrewCard) => {
    if (!member) {
      setShowLoginModal(true);
      return;
    }
    setRequestModalTarget(card);
    setRequestMessage("");
  };

  const handleRequest = async () => {
    if (!requestModalTarget) return;
    const partnerId = requestModalTarget.id;
    setRequestingId(partnerId);
    try {
      const res = await fetch("/api/crewchat/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_id: partnerId, message: requestMessage.trim() }),
      });
      if (res.ok) {
        setChatStatuses((prev) => ({
          ...prev,
          [partnerId]: { pending: true, completedCount: prev[partnerId]?.completedCount || 0 },
        }));
        setRequestModalTarget(null);
      }
    } catch {
      // 실패 시 무시
    } finally {
      setRequestingId(null);
    }
  };

  const handleComplete = async (partnerId: string) => {
    setCompletingId(partnerId);
    try {
      const res = await fetch("/api/crewchat/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_id: partnerId }),
      });
      if (res.ok) {
        setChatStatuses((prev) => ({
          ...prev,
          [partnerId]: { pending: false, completedCount: (prev[partnerId]?.completedCount || 0) + 1 },
        }));
      }
    } catch {
      // 실패 시 무시
    } finally {
      setCompletingId(null);
    }
  };

  const handleCancel = async (partnerId: string) => {
    setCancellingId(partnerId);
    try {
      const res = await fetch("/api/crewchat/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner_id: partnerId }),
      });
      if (res.ok) {
        setChatStatuses((prev) => ({
          ...prev,
          [partnerId]: { pending: false, completedCount: prev[partnerId]?.completedCount || 0 },
        }));
      }
    } catch {
      // 실패 시 무시
    } finally {
      setCancellingId(null);
    }
  };

  const handleProfileClick = () => {
    if (member) {
      router.push("/mypage");
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--ink)]">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-[var(--paper)]/60 hover:text-[var(--paper)] transition-colors font-medium"
          >
            &larr; 홈
          </Link>
          <h1 className="text-base font-extrabold text-[var(--paper)] tracking-tight">
            💬 스폰지 크루챗
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-8 pb-20">
        {/* 소개 */}
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-[var(--ink)] tracking-tight">
            크루를 알아가고, 크루챗하세요
          </h2>
          <p className="text-xs text-[var(--ink-30)] mt-1 font-medium leading-relaxed">
            프로필을 보고 관심 가는 크루에게 슬랙 DM을 보내보세요.
            <br />
            크루챗 후 마이페이지에서 기록하면 슬랙에 자동 알림이 가요!
          </p>
        </div>

        {/* 내 프로필 작성 CTA */}
        {authChecked && (
          <button
            onClick={handleProfileClick}
            className="block w-full py-3.5 mb-8 bg-[var(--yellow)] text-[var(--ink)] text-sm font-extrabold text-center hover:opacity-80 transition-opacity border-2 border-[var(--ink)]"
          >
            내 프로필 작성하러 가기 →
          </button>
        )}

        {/* 조별 카드 */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[var(--ink-30)] text-sm">로딩 중...</p>
          </div>
        ) : groups.length === 0 ? (
          <p className="text-center py-12 text-[var(--ink-30)] text-sm">
            표시할 크루가 없어요
          </p>
        ) : (
          <div className="space-y-10">
            {groups.filter((g) => g.group_number !== 0).map((group) => (
              <section key={group.group_number}>
                {/* 조 헤더 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[var(--ink)] px-3 py-1">
                    <span className="text-xs font-extrabold text-[var(--paper)] uppercase tracking-wider">
                      {`${group.group_number}조`}
                    </span>
                  </div>
                  <div className="flex-1 h-[2px] bg-[var(--ink-10)]" />
                  <span className="text-xs font-bold text-[var(--ink-30)]">
                    {group.members.length}명
                  </span>
                </div>

                {/* 카드 목록 — 데스크탑 3열, 높이 통일 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {group.members.map((card) =>
                    card.has_profile ? (
                      // ── 완성된 카드 ──
                      <div
                        key={card.id}
                        className={`border-2 border-[var(--ink)] flex flex-col min-h-[200px]`}
                      >
                        {/* 상단: 프로필 */}
                        <div className="flex items-center gap-3 p-4 flex-shrink-0">
                          {card.profile_image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={card.profile_image}
                              alt={card.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--yellow)] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[var(--yellow)] flex items-center justify-center text-base font-extrabold text-[var(--ink)] flex-shrink-0">
                              {card.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold text-[var(--ink)]">
                              {card.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {card.job_title && (
                                <span className="text-[10px] font-bold bg-[var(--ink-05)] text-[var(--ink-50)] px-1.5 py-0.5">
                                  {card.job_title}
                                </span>
                              )}
                              {card.field && (
                                <span className="text-[10px] font-bold bg-[var(--yellow-dim)] text-[var(--ink)] px-1.5 py-0.5">
                                  {card.field}
                                </span>
                              )}
                            </div>
                            <SnsIcons card={card} />
                          </div>
                        </div>

                        {/* 하단: want_to_meet 항상 표시 */}
                        {card.want_to_meet && (
                          <div className="border-t-2 border-[var(--ink-10)] px-4 py-3 bg-[var(--ink-05)] flex-1 flex flex-col min-h-0">
                            <p className="text-[10px] font-extrabold text-[var(--ink-30)] uppercase tracking-widest mb-1">
                              이런 크루와 얘기하고 싶어요
                            </p>
                            <p className="text-xs text-[var(--ink)] font-medium leading-relaxed flex-1 overflow-hidden">
                              {card.want_to_meet.length > WANT_TO_MEET_LIMIT
                                ? card.want_to_meet.slice(0, WANT_TO_MEET_LIMIT) + "..."
                                : card.want_to_meet}
                            </p>
                            {card.want_to_meet.length > WANT_TO_MEET_LIMIT && (
                              <button
                                onClick={() => setDetailCard(card)}
                                className="text-[11px] font-extrabold text-[var(--ink-50)] hover:text-[var(--ink)] mt-1 text-left transition-colors"
                              >
                                더보기
                              </button>
                            )}
                          </div>
                        )}

                        {/* 크루챗 신청/완료 버튼 */}
                        {(!member || member.id !== card.id) && (() => {
                          const status = chatStatuses[card.id];
                          const isPending = status?.pending;
                          const count = status?.completedCount || 0;

                          return (
                            <div className="border-t-2 border-[var(--ink-10)] px-4 py-2 flex-shrink-0">
                              {isPending ? (
                                /* 2단계: 신청 완료 + 두 개 버튼 */
                                <div className="space-y-1.5">
                                  <p className="text-xs font-extrabold text-center text-[var(--ink-30)]">
                                    신청 완료 ☕
                                  </p>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleCancel(card.id)}
                                      disabled={cancellingId === card.id}
                                      className="flex-1 py-2 bg-[var(--ink-05)] text-[var(--ink-50)] text-xs font-extrabold hover:bg-[var(--ink-10)] disabled:opacity-40 transition-colors"
                                    >
                                      {cancellingId === card.id ? "취소 중..." : "다음에 하기로"}
                                    </button>
                                    <button
                                      onClick={() => handleComplete(card.id)}
                                      disabled={completingId === card.id}
                                      className="flex-1 py-2 bg-[var(--ink)] text-[var(--paper)] text-xs font-extrabold hover:opacity-90 disabled:opacity-40 transition-opacity"
                                    >
                                      {completingId === card.id ? "처리 중..." : "크루챗 했어요!"}
                                    </button>
                                  </div>
                                </div>
                              ) : count > 0 ? (
                                /* 3단계: 완료 표시 + 다시 신청하기 */
                                <div className="space-y-1.5">
                                  <p className="text-xs font-extrabold text-center text-green-600">
                                    ✅ 크루챗 완료 ({count}회)
                                  </p>
                                  <button
                                    onClick={() => openRequestModal(card)}
                                    disabled={requestingId === card.id}
                                    className="w-full py-2 bg-[var(--yellow)] text-[var(--ink)] text-xs font-extrabold hover:opacity-80 disabled:opacity-40 transition-opacity"
                                  >
                                    {requestingId === card.id ? "신청 중..." : "☕ 다시 신청하기"}
                                  </button>
                                </div>
                              ) : (
                                /* 1단계: 최초 신청 */
                                <button
                                  onClick={() => openRequestModal(card)}
                                  disabled={requestingId === card.id}
                                  className="w-full py-2 bg-[var(--yellow)] text-[var(--ink)] text-xs font-extrabold hover:opacity-80 disabled:opacity-40 transition-opacity"
                                >
                                  {requestingId === card.id ? "신청 중..." : "☕ 크루챗 신청하기"}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      // ── 미완성 카드 (흑백, 같은 높이) ──
                      <div
                        key={card.id}
                        className={`flex items-center gap-3 p-4 border-2 border-[var(--ink-10)] grayscale opacity-40 ${CARD_HEIGHT}`}
                      >
                        {card.profile_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={card.profile_image}
                            alt={card.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[var(--ink-10)] flex items-center justify-center text-base font-extrabold text-[var(--ink-30)] flex-shrink-0">
                            {card.name.charAt(0)}
                          </div>
                        )}
                        <p className="text-sm font-extrabold text-[var(--ink)]">
                          {card.name}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* 더보기 팝업 */}
      {detailCard && (
        <DetailModal card={detailCard} onClose={() => setDetailCard(null)} />
      )}

      {/* 크루챗 신청 모달 */}
      {requestModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-sm px-4" onClick={() => setRequestModalTarget(null)}>
          <div className="bg-[var(--paper)] w-full max-w-sm p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold text-[var(--ink)] mb-1">
              ☕ {requestModalTarget.name}님에게 크루챗 신청
            </h2>
            <p className="text-xs text-[var(--ink-30)] mb-5 font-medium">
              간단한 메시지를 남겨주세요 (슬랙으로 전달돼요)
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="예: 마케팅 관련 이야기 나눠보고 싶어요!"
              rows={3}
              className="w-full px-4 py-3 bg-[var(--ink-05)] border-2 border-transparent focus:border-[var(--yellow)] focus:outline-none text-sm font-medium transition-colors resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRequestModalTarget(null)}
                className="flex-1 py-3 border-2 border-[var(--ink-10)] text-[var(--ink-50)] font-bold text-sm hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRequest}
                disabled={requestingId === requestModalTarget.id}
                className="flex-1 py-3 bg-[var(--yellow)] text-[var(--ink)] font-bold text-sm hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                {requestingId === requestModalTarget.id ? "신청 중..." : "신청하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            router.push("/mypage");
          }}
        />
      )}
    </div>
  );
}
