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
import { SpongeVillageProgress, type Team as VillageTeam } from "./BikiniBottom";
import { TeamMembersModal } from "./TeamMembersModal";

function toVillageTeams(
  teams: TeamProgress[],
  onTeamClick: (team: TeamProgress) => void,
): VillageTeam[] {
  return teams.map((t) => ({
    name: t.team,
    weeklyAchievementRate:
      t.totalCount > 0 ? (t.submittedCount / t.totalCount) * 100 : 0,
    submittedCount: t.submittedCount,
    totalAssignments: t.totalCount,
    onClick: () => onTeamClick(t),
  }));
}

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
  const [openTeam, setOpenTeam] = useState<TeamProgress | null>(null);

  const weekInfo = weeks.find((w) => w.week === selectedWeek);
  const weekLabel = weekInfo?.label ?? `${selectedWeek}주차`;
  const teams = progressByWeek[selectedWeek] ?? [];

  const isCurrentWeek = selectedWeek === currentWeekNumber;

  return (
    <section className="rounded-2xl bg-[#FAFBFD] border border-[#E7E9EE] p-4 sm:p-5">
      <header className="mb-3">
        <h2 className="font-bold text-lg sm:text-xl text-[#2A2E35] tracking-tight">
          🏘️ 스폰지 빌리지 현황
          {isCurrentWeek && (
            <span className="ml-2 text-[11px] font-bold text-white bg-[#FFB800] rounded-full px-2 py-0.5 align-middle">
              이번주
            </span>
          )}
        </h2>
        <p className="text-xs text-[#5B6271] mt-1">
          아래에서 다른 주차를 선택해 그 주차의 과제 현황판을 볼 수 있어요.
        </p>
      </header>

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

      {teams.length > 0 ? (
        <SpongeVillageProgress
          teams={toVillageTeams(teams, setOpenTeam)}
        />
      ) : (
        <p className="text-center text-xs text-[#A7ADBA] py-10 leading-relaxed">
          vault에서 미션 노트를 가져오지 못했어요.
          <br />
          rate limit·일시 오류일 수 있어요. 5분 뒤 자동 재시도됩니다.
        </p>
      )}

      <p className="mt-3 text-[11px] text-[#A7ADBA] text-center leading-relaxed">
        집을 클릭하면 그 조의 멤버 목록이 열려요.
        <br />
        달성률 20%·40%·55%·70% 임계값마다 집이 한 단계 진화합니다.
      </p>

      {openTeam && (
        <TeamMembersModal
          team={openTeam}
          weekLabel={weekLabel}
          onClose={() => setOpenTeam(null)}
        />
      )}
    </section>
  );
}
