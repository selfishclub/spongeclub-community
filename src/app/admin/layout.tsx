"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/members", label: "멤버 관리" },
  { href: "/admin/sessions", label: "공유회" },
  { href: "/admin/missions", label: "미션" },
  { href: "/admin/videos", label: "영상" },
  { href: "/admin/requests", label: "신청 관리" },
  { href: "/admin/suggestions", label: "추천" },
  { href: "/admin/crewchat", label: "크루챗" },
  { href: "/admin/transactions", label: "트랜잭션 로그" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <nav className="bg-[var(--ink)] border-b-2 border-[var(--ink)] px-6 py-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/admin/members"
            className="text-base font-extrabold text-[var(--paper)] tracking-tight py-4"
          >
            스폰지클럽 어드민
          </Link>
          <div className="flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
                    isActive
                      ? "text-[var(--yellow)] border-[var(--yellow)]"
                      : "text-[var(--paper)]/60 border-transparent hover:text-[var(--paper)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
