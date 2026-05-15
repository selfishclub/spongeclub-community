/**
 * 커뮤니티 CTA — "데굴데굴" 레퍼런스 CommunityCTA 룩(잉크 그라데이션 카드).
 *
 * 데굴데굴 원본은 외부 커뮤니티 URL로 링크하지만, 타깃은 이 사이트 자체가
 * 커뮤니티이므로 홈("/")으로 링크한다.
 */
import Link from "next/link";

export function CommunityCTA() {
  return (
    <Link
      href="/"
      className="block rounded-2xl bg-gradient-to-br from-[#0F1115] to-[#2A2E35] text-white p-6 hover:shadow-lg transition relative overflow-hidden"
    >
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#FFB800]/30 blur-3xl" />
      <div className="absolute -left-10 -bottom-16 w-56 h-56 rounded-full bg-[#FFD84D]/20 blur-3xl" />
      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[#FFD84D] text-xs font-semibold tracking-wider uppercase">
            커뮤니티 · 활동 공간
          </div>
          <h3 className="mt-1 text-2xl font-bold">🧽 이기적인 스폰지들</h3>
          <p className="mt-2 text-sm text-[#E7E9EE]/80 max-w-xl">
            활동 랭킹과 공유회 신청은 여기서. 멤버들의 활동·인정의 표시가 한곳에
            모입니다.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-center">
            <div className="text-2xl">🏆</div>
            <div className="text-[11px] text-[#E7E9EE]/70 mt-1">활동 랭킹</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">🎙️</div>
            <div className="text-[11px] text-[#E7E9EE]/70 mt-1">공유회</div>
          </div>
          <span className="text-[#FFD84D] text-2xl ml-2">↗</span>
        </div>
      </div>
    </Link>
  );
}
