"use client";

/**
 * 주차 선택 + Hero 인라인 전환 래퍼.
 *
 * 타임라인 pill 을 누르면 모달이 아니라 *이 블록 아래에 보이는 내용*이
 * 그 주차의 미션 안내(Hero) + 다시보기/속기본 + 참고자료로 바뀐다.
 * 기본 선택은 현재 주차(initialWeek). 현황판/공지 배너 등 다른 섹션은
 * page.tsx 에서 그대로 두고, 여기서는 "그 주차의 콘텐츠"만 전환한다.
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
  initialWeek,
}: {
  weeks: WeekInfo[];
  views: Record<number, WeekView>;
  initialWeek: number;
}) {
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const view = views[selectedWeek] ?? views[initialWeek];
  const isViewingOther = selectedWeek !== initialWeek;

  if (!view) return null;

  return (
    <div className="space-y-6">
      <WeekTimeline
        weeks={weeks}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
      />

      {isViewingOther && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-[#FFF9E5] border border-[#FFE08A] px-4 py-2 text-xs text-[#A87400]">
          <span>📅 {view.week.label} 미션을 보고 있어요.</span>
          <button
            type="button"
            onClick={() => setSelectedWeek(initialWeek)}
            className="font-bold underline hover:opacity-80 shrink-0"
          >
            이번주로 돌아가기
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
