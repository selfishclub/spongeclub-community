"use client";

/**
 * "📊 과제 현황판" 버튼 — MissionHero 의 D-day 박스 왼쪽에 놓인다.
 *
 * 클릭 시 ProgressBoardProvider context 의 openModal(weekNumber)을 호출해
 * 현재 주차 기준 과제 현황판 모달을 연다.
 */
import { useProgressBoard } from "./ProgressBoardProvider";

export function ProgressBoardButton({ weekNumber }: { weekNumber: number }) {
  const { openModal } = useProgressBoard();

  return (
    <button
      type="button"
      onClick={() => openModal(weekNumber)}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FFB800] text-[#0F1115] text-xs sm:text-sm font-bold px-3 sm:px-4 min-h-[68px] shadow-sm hover:bg-[#E89E00] transition cursor-pointer shrink-0"
    >
      📊 과제 현황판
    </button>
  );
}
