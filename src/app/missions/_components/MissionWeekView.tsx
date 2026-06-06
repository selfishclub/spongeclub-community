"use client";

/**
 * 주차 선택 + Hero 인라인 전환 래퍼.
 *
 * 타임라인 pill 을 누르면 모달이 아니라 *이 블록 아래에 보이는 내용*이
 * 그 주차의 미션 안내(Hero) + 다시보기/속기본 + 참고자료로 바뀐다.
 *
 * 기본 표시 주차(defaultWeek)는 현재 주차(currentWeekNumber)지만, 현재 주차에
 * 아직 어드민/vault 콘텐츠가 없으면 page.tsx 가 "콘텐츠가 있는 가장 최근 주차"로
 * defaultWeek 를 내려보낸다 (빈 '곧 공개' 대신 실제 내용을 보여주려고).
 * "이번주" 버튼은 항상 진짜 현재 주차(currentWeekNumber)를 가리킨다.
 *
 * 주차별 데이터(views)는 page.tsx(server)가 Supabase missions_weeks +
 * vault _missions.md 를 합쳐 주입한다.
 */
import { useState } from "react";
import type { WeekInfo } from "@/lib/missions/schedule-parser";
import type { MissionTitle, MissionReference } from "@/lib/missions/weeks-repo";
import { WeekTimeline } from "./WeekTimeline";
import { MissionHero } from "./MissionHero";
import { ReferencesSection } from "./ReferencesSection";

export type WeekView = {
  week: WeekInfo;
  heroTitle: string | null;
  heroSubtitle: string | null;
  missions: MissionTitle[];
  references: MissionReference[];
  replayUrl: string | null;
  transcriptUrl: string | null;
  dDay: number | null;
};

export function MissionWeekView({
  weeks,
  views,
  currentWeekNumber,
  defaultWeek,
}: {
  weeks: WeekInfo[];
  views: Record<number, WeekView>;
  currentWeekNumber: number;
  defaultWeek: number;
}) {
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const view = views[selectedWeek] ?? views[defaultWeek];

  if (!view) return null;

  const isViewingCurrent = selectedWeek === currentWeekNumber;
  const currentLabel = views[currentWeekNumber]?.week.label ?? "이번주";

  return (
    <div className="space-y-6">
      <WeekTimeline
        weeks={weeks}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
      />

      {!isViewingCurrent && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-[#FFF9E5] border border-[#FFE08A] px-4 py-2 text-xs text-[#A87400]">
          <span>
            📅 {view.week.label} 미션을 보고 있어요.
            {selectedWeek === defaultWeek &&
              ` (${currentLabel} 미션은 아직 준비 중)`}
          </span>
          <button
            type="button"
            onClick={() => setSelectedWeek(currentWeekNumber)}
            className="font-bold underline hover:opacity-80 shrink-0"
          >
            {currentLabel}로
          </button>
        </div>
      )}

      <MissionHero
        week={view.week}
        heroTitle={view.heroTitle}
        heroSubtitle={view.heroSubtitle}
        missions={view.missions}
        dDay={view.dDay}
        replayUrl={view.replayUrl}
        transcriptUrl={view.transcriptUrl}
      />

      <ReferencesSection references={view.references} />
    </div>
  );
}
