/**
 * 이번주 미션 Hero — "데굴데굴" 레퍼런스 MissionHero 룩(sponge 그라데이션 카드).
 *
 * 데굴데굴 원본은 mock mission(goals/deliverables/materials)을 쓰지만,
 * 타깃 실데이터는 `MissionTitle[]`(index + title)뿐이다. 따라서 학습목표/
 * 결과물/자료 3-컬럼 대신 미션 목록을 번호 매긴 리스트로 렌더한다.
 * 데이터는 page.tsx(server)가 weeks-repo / schedule-parser 로 가져와 props 전달.
 */
import type { WeekInfo } from "@/lib/missions/schedule-parser";
import type { MissionTitle } from "@/lib/missions/weeks-repo";

function dDayLabel(d: number | null): string {
  if (d === null) return "D-…";
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-Day";
  return `D+${Math.abs(d)}`;
}

/**
 * 다시보기/속기본 링크는 *지난 주차* 세션 콘텐츠 기준으로 라벨링.
 * 이번주 세션은 진행 중이라 아직 자료가 없을 수 있으므로,
 * "N-1주차 세션" 으로 명시해 멤버 혼동을 줄인다.
 */
function prevSessionLabel(weekNum: number | null | undefined): string {
  if (weekNum == null || weekNum < 1) return "지난";
  return `${weekNum - 1}주차`;
}

export function MissionHero({
  week,
  missions,
  dDay,
  replayUrl,
  transcriptUrl,
}: {
  week: WeekInfo | null;
  missions: MissionTitle[];
  dDay: number | null;
  replayUrl: string | null;
  transcriptUrl: string | null;
}) {
  const weekLabel = week?.label ?? "이번주";
  const isPast = week?.status === "past";
  const deadlineText = week ? `${week.endDate} 마감` : "";

  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#FFF1BF] via-[#FFF9E5] to-white border border-[#FFF1BF] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <span className="text-[#5B6271]">{weekLabel}</span>
            <span className="text-[#A7ADBA]">·</span>
            {isPast ? (
              <span className="text-emerald-700">✓ 완료</span>
            ) : (
              <span className="flex items-center gap-2 text-[#A87400]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-pulse" />
                진행중
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold leading-tight">
            스폰지클럽 1기 · 이번주 미션
          </h1>
          <p className="mt-2 text-[#5B6271] text-sm leading-relaxed">
            이번 주에 만들고 나눌 과제입니다.
          </p>
        </div>
        {/* 과제 마감 D-day 박스 */}
        <div className="px-4 py-3 rounded-xl bg-white border border-[#E7E9EE] min-w-[120px] text-center">
          <div className="text-[10px] text-[#5B6271] tracking-wider">
            {isPast ? "마감 완료" : "과제 마감까지"}
          </div>
          <div
            className={`text-3xl font-bold leading-none mt-1 ${
              isPast ? "text-emerald-700" : "text-[#E89E00]"
            }`}
          >
            {isPast ? "✓" : dDayLabel(dDay)}
          </div>
          {deadlineText && (
            <div className="text-[10px] text-[#5B6271] mt-1">
              {deadlineText}
            </div>
          )}
        </div>
      </div>

      {/* 미션 목록 — 실데이터(MissionTitle[]) */}
      <div className="mt-5">
        {missions.length === 0 ? (
          <div className="p-4 rounded-xl bg-white border border-dashed border-[#E7E9EE] text-sm text-[#5B6271] text-center">
            📅 이번주 미션 정보는 곧 공개됩니다.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E7E9EE] p-4">
            <div className="text-xs text-[#5B6271] mb-3">🎯 이번주 미션</div>
            <ol className="space-y-2.5">
              {missions.map((m) => (
                <li key={m.index} className="flex gap-3 items-start">
                  <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#FFB800] text-white text-xs font-bold">
                    {m.index}
                  </span>
                  <span className="flex-1 text-sm text-[#2A2E35] leading-relaxed">
                    {m.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {(replayUrl || transcriptUrl) && (
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {replayUrl && (
              <a
                href={replayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E7E9EE] px-4 py-2.5 text-sm font-bold text-[#A87400] shadow-sm hover:bg-[#FFF9E5] hover:border-[#FFE08A] transition"
              >
                📺 {prevSessionLabel(week?.week)} 세션 다시보기 <span aria-hidden>↗</span>
              </a>
            )}
            {transcriptUrl && (
              <a
                href={transcriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E7E9EE] px-4 py-2.5 text-sm font-bold text-[#A87400] shadow-sm hover:bg-[#FFF9E5] hover:border-[#FFE08A] transition"
              >
                📝 {prevSessionLabel(week?.week)} 속기본 보기 <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
