"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
  shell_balance: number;
  is_admin: boolean;
}

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: HomeIcon },
  { href: "/missions", label: "과제", icon: MissionIcon },
  // { href: "/crewchat", label: "크루챗", icon: ChatIcon }, // 종료
  { href: "/sessions/new", label: "공유회 열기", icon: PlusIcon },
  { href: "/mypage", label: "마이", icon: UserIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const [member, setMember] = useState<Member | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMember(data.member || null))
      .catch(() => {});
  }, []);

  // admin 페이지에서는 네비게이션 숨기기
  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Top Bar (로고 + 로그인/마이페이지만) ── */}
      <header className="hidden md:block sticky top-0 z-40 bg-[var(--paper)] border-b-2 border-[var(--ink)]">
        <div className="max-w-6xl mx-auto px-6 flex items-center h-14">
          <Link href="/" className="text-base font-extrabold text-[var(--ink)] tracking-tight flex-shrink-0">
            🧽 이기적인 스폰지들
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {member && (
              <span className="text-xs font-bold text-[var(--ink-50)]">
                {member.shell_balance} 🐚
              </span>
            )}
            {member ? (
              <a
                href="/mypage"
                className="px-4 py-1.5 border-2 border-[var(--ink)] text-[var(--ink)] text-xs font-extrabold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
              >
                마이페이지
              </a>
            ) : (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-login"));
                }}
                className="px-4 py-1.5 border-2 border-[var(--ink)] text-[var(--ink)] text-xs font-extrabold hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
              >
                로그인
              </button>
            )}
            {member?.is_admin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-xs font-bold text-[var(--ink-30)] hover:text-[var(--ink)] transition-colors"
              >
                어드민
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--paper)] border-b-2 border-[var(--ink)]">
        <div className="px-4 flex items-center h-12 justify-between">
          <Link href="/" className="text-sm font-extrabold text-[var(--ink)] tracking-tight">
            🧽 이기적인 스폰지들
          </Link>
          <div className="flex items-center gap-2">
            {member && (
              <span className="text-xs font-bold text-[var(--ink-50)]">
                {member.shell_balance} 🐚
              </span>
            )}
            {!member && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
                className="px-3 py-1 border-2 border-[var(--ink)] text-[var(--ink)] text-[11px] font-extrabold"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

    </>
  );
}

// ── Icons ──

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MissionIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function PlusIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
