/**
 * 미션 관련 질문 & 공유 — "데굴데굴" 레퍼런스 MissionDiscussion 룩.
 *
 * 데굴데굴 원본은 mock discussion 목록(질문/노하우/사이트)을 렌더하지만,
 * 타깃은 질문 데이터 소스(Slack 자동 수집 + 관련도 게이팅)가 아직 없다.
 * mock 데이터 하드코딩을 피하고 데굴데굴 카드 룩의 "준비 중" 상태로 렌더.
 */
export function MissionDiscussion() {
  return (
    <section className="rounded-2xl bg-white border border-[#E7E9EE]">
      <header className="p-5 pb-3">
        <h3 className="font-bold text-lg">💬 미션 관련 질문 &amp; 공유</h3>
        <p className="text-xs text-[#5B6271] mt-0.5">
          Slack 자동 수집 · 미션 관련도 ≥ 70% 자동 게이팅
        </p>
      </header>
      <div className="px-5 pb-5">
        <div className="grid place-items-center rounded-xl border border-dashed border-[#E7E9EE] py-10 text-center">
          <p className="text-sm text-[#5B6271] leading-relaxed">
            미션 관련 질문 &amp; 공유 게시판은 준비 중입니다.
            <br />
            <span className="text-xs text-[#A7ADBA]">
              Slack 자동 수집 + 관련도 게이팅은 후속 PR에서 연동됩니다.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
