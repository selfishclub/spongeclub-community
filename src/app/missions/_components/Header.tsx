/**
 * /missions 페이지 헤더 — "데굴데굴" 레퍼런스 Header 룩.
 *
 * 데굴데굴 원본은 /teams, /skills 같은 자체 라우트로 링크하지만
 * 타깃 레포엔 그 라우트들이 없다. nav 링크를 타깃 실제 라우트로 맞춘다:
 *   - "🧽 스폰지클럽" → /
 *   - 현재 페이지 라벨 "주차별 미션" (활성, 링크 아님)
 *   - "이기적인 스폰지들 ↗" → /
 */
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-[#E7E9EE] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        {/* Left: 워드마크 + breadcrumb */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 shrink-0"
        >
          <span className="text-xl leading-none">🧽</span>
          <span className="font-semibold">스폰지클럽</span>
          <span className="hidden sm:inline text-[#A7ADBA]">/</span>
          <span className="hidden sm:inline text-[#2A2E35]">주차별 미션</span>
        </Link>

        {/* Center: 메인 nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <span className="text-[#0F1115] font-medium">주차별 미션</span>
        </nav>

        {/* Right: 외부 바로가기 */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="hidden sm:inline-flex text-xs text-[#5B6271] hover:text-[#0F1115] items-center gap-1"
            title="이기적인 스폰지들 커뮤니티"
          >
            🧽 이기적인 스폰지들 <span className="text-[10px]">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
