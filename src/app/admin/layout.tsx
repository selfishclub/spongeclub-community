import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-amber-50">
      <nav className="bg-white border-b border-amber-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-amber-900">
            🐚 스폰지클럽 어드민
          </Link>
          <div className="flex gap-6 text-sm">
            <Link
              href="/admin/members"
              className="text-amber-700 hover:text-amber-900"
            >
              멤버 관리
            </Link>
            <Link
              href="/admin/members/import"
              className="text-amber-700 hover:text-amber-900"
            >
              CSV 등록
            </Link>
            <Link
              href="/admin/sessions"
              className="text-amber-700 hover:text-amber-900"
            >
              공유회
            </Link>
            <Link
              href="/admin/requests"
              className="text-amber-700 hover:text-amber-900"
            >
              신청 관리
            </Link>
            <Link
              href="/admin/transactions"
              className="text-amber-700 hover:text-amber-900"
            >
              트랜잭션 로그
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
