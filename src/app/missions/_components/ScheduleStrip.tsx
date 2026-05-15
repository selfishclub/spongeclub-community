/**
 * 이번주 일정 — Q&A · 제출 마감 · 공유회 3-카드.
 *
 * 데굴데굴 레퍼런스엔 별도 일정 컴포넌트가 없어, 타깃 기존 page.tsx 의
 * ScheduleSection 정보를 데굴데굴 카드 룩으로 재구성했다.
 * 제출 마감 D-day/날짜는 타깃 실데이터(WeekInfo)에서 계산.
 */
import type { WeekInfo } from "@/lib/missions/schedule-parser";

function dDayLabel(d: number | null): string {
  if (d === null) return "—";
  if (d > 0) return `D-${d}`;
  if (d === 0) return "오늘 마감";
  return `D+${Math.abs(d)} 지남`;
}

function ScheduleCard({
  icon,
  label,
  sub,
  highlight = false,
}: {
  icon: string;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "bg-[#FFF9E5] border-[#FFD84D]"
          : "bg-white border-[#E7E9EE]"
      }`}
    >
      <div className="text-base leading-none">{icon}</div>
      <div className="mt-1.5 text-xs font-bold text-[#2A2E35] leading-tight">
        {label}
      </div>
      <div className="text-[11px] text-[#5B6271] mt-0.5">{sub}</div>
    </div>
  );
}

export function ScheduleStrip({
  week,
  dDay,
}: {
  week: WeekInfo | null;
  dDay: number | null;
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#E7E9EE] px-4 py-3">
      <h2 className="text-xs font-bold text-[#5B6271] mb-3 tracking-wider uppercase">
        🗓️ 이번주 일정
      </h2>
      <div className="grid grid-cols-3 gap-2">
        <ScheduleCard icon="💬" label="목 · Q&A" sub="시간 미정" />
        <ScheduleCard
          icon="📮"
          label="제출 마감"
          sub={week ? `${dDayLabel(dDay)} · ${week.endDate}` : dDayLabel(dDay)}
          highlight
        />
        <ScheduleCard icon="🎙️" label="공유회" sub="일 20시" />
      </div>
    </section>
  );
}
