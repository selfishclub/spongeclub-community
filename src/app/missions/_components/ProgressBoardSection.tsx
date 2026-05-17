"use client";

/**
 * 과제 현황판 — /missions 페이지 인라인 섹션.
 *
 * 기존 ProgressModal(버튼 → 팝업)은 그대로 두고, 같은 진척 매트릭스를
 * 페이지에 항상 보이는 섹션으로도 노출한다.
 * 주차 전환은 이 섹션의 로컬 state 로 관리 — 모달과 독립적이다.
 *
 * 데이터(progressByWeek/weeks)는 page.tsx(server)가 props 로 주입.
 */
import { useState } from "react";
import type { TeamProgress } from "@/lib/missions/types";
import type { WeekInfo } from "@/lib/missions/schedule-parser";
import { TeamProgressMatrix } from "./TeamProgressMatrix";

export function ProgressBoardSection({
  progressByWeek,
  weeks,
  currentWeekNumber,
}: {
  progressByWeek: Record<number, TeamProgress[]>;
  weeks: WeekInfo[];
  currentWeekNumber: number;
}) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeekNumber);

  const weekInfo = weeks.find((w) => w.week === selectedWeek);
  const weekLabel = weekInfo?.label ?? `${selectedWeek}주차`;
  const teams = progressByWeek[selectedWeek] ?? [];

  return (
    <section className="rounded-2xl bg-[#FAFBFD] border border-[#E7E9EE] p-4 sm:p-5">
      {/* 주차 전환 pill */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto mb-4"
        aria-label="주차 선택"
      >
        {weeks.map((w) => {
          const active = w.week === selectedWeek;
          return (
            <button
              key={w.week}
              type="button"
              onClick={() => setSelectedWeek(w.week)}
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

      <TeamProgressMatrix teams={teams} weekLabel={weekLabel} />
    </section>
  );
}
