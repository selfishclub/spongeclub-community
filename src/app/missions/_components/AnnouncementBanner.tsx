/**
 * 공지사항 배너 — "데굴데굴" 레퍼런스 AnnouncementBanner 룩.
 *
 * 데굴데굴 원본은 mock 공지를 캐러셀로 회전시키지만, 타깃은 공지 데이터
 * 소스(Slack 연동)가 아직 없다. mock 공지를 진짜처럼 보여주면 멤버를
 * 오도하므로, 데굴데굴 카드 룩의 "준비 중" 빈 상태로 렌더한다.
 */
export function AnnouncementBanner() {
  return (
    <section className="rounded-2xl bg-white border border-[#FFD84D] px-5 py-4">
      <header className="flex items-center gap-2 mb-2">
        <span className="text-base">📢</span>
        <h3 className="font-bold text-sm">공지사항</h3>
        <span className="text-[11px] text-[#A7ADBA]">준비 중</span>
      </header>
      <div className="min-h-[44px] grid place-items-center rounded-xl border border-dashed border-[#E7E9EE] py-4 text-center">
        <p className="text-xs text-[#5B6271] leading-relaxed">
          Slack #0-공지사항 자동 수집(최근 3–5건)은 후속 PR에서 연동됩니다.
        </p>
      </div>
    </section>
  );
}
