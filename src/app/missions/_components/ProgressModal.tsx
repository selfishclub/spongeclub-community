"use client";

/**
 * 과제 현황판 모달 — 6개 조 진척 매트릭스 팝업.
 *
 * 트리거 버튼은 MissionHero(📊 과제 현황판) / WeekTimeline(주차 pill)에 있고,
 * 열림 상태·선택 주차는 ProgressBoardProvider context 가 관리한다.
 * 모달은 그 context 를 소비해 렌더만 한다.
 *
 * 모달 상단에 주차 전환 pill(0~6주차)을 두어 모달 안에서도 주차를 바꿀 수 있다.
 * 데이터(주차별 TeamProgress[])는 page.tsx(server)가 provider 에 주입한다.
 */
import { useEffect } from "react";
import { useProgressBoard } from "./ProgressBoardProvider";
import { TeamProgressMatrix } from "./TeamProgressMatrix";

export function ProgressModal() {
  const { progressByWeek, weeks, selectedWeek, open, closeModal, selectWeek } =
    useProgressBoard();

  // ESC 로 닫기 + 모달 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeModal]);

  if (!open) return null;

  const selectedWeekInfo = weeks.find((w) => w.week === selectedWeek);
  const weekLabel = selectedWeekInfo?.label ?? `${selectedWeek}주차`;
  const teams = progressByWeek[selectedWeek] ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="6개 조 과제 현황판"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6"
    >
      {/* 딤 배경 — 바깥 클릭으로 닫힘 */}
      <div
        className="absolute inset-0 bg-[#0F1115]/60"
        onClick={closeModal}
        aria-hidden
      />

      {/* 모달 본문 */}
      <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#FAFBFD] border border-[#E7E9EE] shadow-xl">
        <div className="sticky top-0 z-10 bg-[#FAFBFD]/95 backdrop-blur px-5 py-3 border-b border-[#E7E9EE]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#2A2E35]">
              과제 현황판
            </span>
            <button
              type="button"
              onClick={closeModal}
              aria-label="닫기"
              className="w-8 h-8 grid place-items-center rounded-lg text-[#5B6271] hover:bg-[#E7E9EE] transition cursor-pointer"
            >
              ✕
            </button>
          </div>
          {/* 주차 전환 pill — 모달 안에서 주차 변경 */}
          <div
            className="mt-2 flex items-center gap-1.5 overflow-x-auto"
            aria-label="주차 선택"
          >
            {weeks.map((w) => {
              const active = w.week === selectedWeek;
              return (
                <button
                  key={w.week}
                  type="button"
                  onClick={() => selectWeek(w.week)}
                  aria-pressed={active}
                  className={`shrink-0 px-2.5 h-7 inline-flex items-center rounded-lg text-xs font-medium transition cursor-pointer ${
                    active
                      ? "bg-[#FFB800] text-white"
                      : "bg-white text-[#5B6271] border border-[#E7E9EE] hover:border-[#A7ADBA]"
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-5">
          <TeamProgressMatrix teams={teams} weekLabel={weekLabel} />
        </div>
      </div>
    </div>
  );
}
