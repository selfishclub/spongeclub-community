"use client";

/**
 * 7주 커리큘럼 타임라인 — "데굴데굴" 레퍼런스 WeekTimeline 룩.
 *
 * 각 주차 pill 은 클릭 가능한 <button> 으로, 클릭 시 그 주차의 과제 현황판
 * 모달이 열린다(ProgressBoardProvider context 의 openModal).
 * pill 의 시각 스타일(m-week-pill, data-active/data-done)은 그대로 유지.
 * 데이터는 타깃 실데이터(`getAllWeeks()` 결과 WeekInfo[])를 그대로 사용.
 */
import type { WeekInfo } from "@/lib/missions/schedule-parser";
import { useProgressBoard } from "./ProgressBoardProvider";

/** "2026-05-10" → "5/10" */
function shortDate(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${parseInt(m[1], 10)}/${parseInt(m[2], 10)}`;
}

function WeekPill({ week }: { week: WeekInfo }) {
  const isCurrent = week.status === "current";
  const isPast = week.status === "past";
  const { openModal } = useProgressBoard();

  return (
    <button
      type="button"
      onClick={() => openModal(week.week)}
      data-active={isCurrent}
      data-done={isPast}
      className="m-week-pill shrink-0 px-3 h-9 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80 transition"
      title={`${week.label} 제출 현황 보기${isCurrent ? " · 현재 주차" : ""}`}
    >
      <span>{week.label}</span>
      <span className="text-[10px] opacity-70">{shortDate(week.startDate)}</span>
    </button>
  );
}

export function WeekTimeline({ weeks }: { weeks: WeekInfo[] }) {
  const currentIdx = weeks.findIndex((w) => w.status === "current");
  // 진행 표시: 현재 주차가 몇 번째인지 (1-base). 없으면 마지막 past 개수.
  const progressCurrent =
    currentIdx >= 0
      ? currentIdx + 1
      : weeks.filter((w) => w.status === "past").length;

  return (
    <section className="bg-white rounded-2xl border border-[#E7E9EE] px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold">{weeks.length}주 커리큘럼</span>
          <span className="text-[11px] text-[#5B6271]">
            진행{" "}
            <span className="font-bold text-[#E89E00]">
              {progressCurrent}/{weeks.length}
            </span>
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="flex items-center gap-1.5 overflow-x-auto"
            aria-label="주차 타임라인"
          >
            {weeks.map((w) => (
              <WeekPill key={w.week} week={w} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
