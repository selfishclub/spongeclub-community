"use client";

/**
 * 과제 현황판 모달 — "📊 과제 현황판 보기" 버튼 + 팝업.
 *
 * 페이지 본문엔 현황판을 깔지 않고 버튼만 둔다. 클릭 시 6개 조 진척
 * 매트릭스가 딤 처리된 모달로 뜬다. 바깥 클릭 + ESC 로 닫히고,
 * 내용은 스크롤 가능하며 모바일에 대응한다.
 *
 * 데이터(TeamProgress[])는 page.tsx(server)가 `getAllTeamsProgress()`로
 * 가져와 props 로 전달 → 실데이터 + 팝업을 동시에 만족.
 */
import { useEffect, useState } from "react";
import type { TeamProgress } from "@/lib/missions/types";
import { TeamProgressMatrix } from "./TeamProgressMatrix";

export function ProgressModal({
  teams,
  weekLabel,
}: {
  teams: TeamProgress[];
  weekLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // ESC 로 닫기 + 모달 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FFB800] text-[#0F1115] text-xs sm:text-sm font-bold px-3 sm:px-4 h-9 shadow-sm hover:bg-[#E89E00] transition cursor-pointer shrink-0"
      >
        📊 과제 현황판
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="6개 조 과제 현황판"
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6"
        >
          {/* 딤 배경 — 바깥 클릭으로 닫힘 */}
          <div
            className="absolute inset-0 bg-[#0F1115]/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* 모달 본문 */}
          <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#FAFBFD] border border-[#E7E9EE] shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#FAFBFD]/95 backdrop-blur px-5 py-3 border-b border-[#E7E9EE]">
              <span className="text-sm font-bold text-[#2A2E35]">
                과제 현황판
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="w-8 h-8 grid place-items-center rounded-lg text-[#5B6271] hover:bg-[#E7E9EE] transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <TeamProgressMatrix teams={teams} weekLabel={weekLabel} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
