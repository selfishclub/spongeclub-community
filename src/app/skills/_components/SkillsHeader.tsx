import Link from "next/link";

export function SkillsHeader() {
  return (
    <header className="bg-white border-b border-[#E7E9EE] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 shrink-0"
        >
          <span className="text-xl leading-none">🧽</span>
          <span className="font-semibold">스폰지클럽</span>
          <span className="hidden sm:inline text-[#A7ADBA]">/</span>
          <span className="hidden sm:inline text-[#2A2E35]">
            스킬 &amp; 인사이트
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/missions"
            className="text-[#5B6271] hover:text-[#0F1115]"
          >
            주차별 미션
          </Link>
          <span className="text-[#0F1115] font-medium">스킬 &amp; 인사이트</span>
        </nav>

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
