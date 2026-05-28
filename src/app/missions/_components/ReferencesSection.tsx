/**
 * 참고자료 카드 섹션 — /missions hero 아래에 노출.
 *
 * 어드민(/admin/missions/[weekFolder]) 에서 입력한 reference_links 를
 * 카드 그리드로 렌더. 데이터가 비면 컴포넌트 자체를 렌더하지 않음.
 */
import type { MissionReference } from "@/lib/missions/weeks-repo";

export function ReferencesSection({
  references,
}: {
  references: MissionReference[];
}) {
  if (references.length === 0) return null;

  return (
    <section className="rounded-2xl bg-[#FAFBFD] border border-[#E7E9EE] p-4 sm:p-5">
      <header className="mb-3">
        <h2 className="font-bold text-lg sm:text-xl text-[#2A2E35] tracking-tight">
          📚 참고자료
        </h2>
        <p className="text-xs text-[#5B6271] mt-1">
          이번 주 미션 진행에 도움이 되는 자료 모음이에요.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {references.map((r) => (
          <li key={r.index}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full rounded-xl bg-white border border-[#E7E9EE] hover:border-[#FFE08A] hover:bg-[#FFF9E5] transition p-3.5 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#FFB800] text-white text-xs font-bold">
                  {r.index}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#2A2E35] leading-snug group-hover:text-[#A87400] transition line-clamp-2">
                    {r.title} <span aria-hidden>↗</span>
                  </div>
                  {r.note && (
                    <div className="mt-1 text-[11px] text-[#5B6271] leading-relaxed line-clamp-2">
                      {r.note}
                    </div>
                  )}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
