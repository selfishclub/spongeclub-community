"use client";

/**
 * 팀(조) 멤버 목록 모달 — 스폰지 빌리지의 집 클릭 시 열린다.
 *
 * 이 모달 안의 멤버 칩은 기존 `MemberChipButton` 그대로 → 칩 클릭 시
 * 노트 모달(z-[60])이 이 모달(z-[55]) 위로 드릴다운처럼 겹쳐 열린다.
 */
import { useEffect } from "react";
import type { TeamProgress } from "@/lib/missions/types";
import { MemberChipButton } from "./MemberChipButton";

const STAGE_LABEL = (pct: number): { name: string; tag: string } => {
  if (pct >= 70) return { name: "완성", tag: "🏆" };
  if (pct >= 55) return { name: "창문·문", tag: "🪟" };
  if (pct >= 40) return { name: "파인애플 본체", tag: "🍍" };
  if (pct >= 20) return { name: "받침터", tag: "🧱" };
  return { name: "빈 모래 자리", tag: "🏖" };
};

export function TeamMembersModal({
  team,
  weekLabel,
  onClose,
}: {
  team: TeamProgress;
  weekLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const pct =
    team.totalCount > 0
      ? Math.round((team.submittedCount / team.totalCount) * 100)
      : 0;
  const stage = STAGE_LABEL(pct);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${team.team} 멤버 목록`}
      className="fixed inset-0 z-[55] flex items-start sm:items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-[#0F1115]/70"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#E7E9EE] shadow-xl">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-5 py-3 border-b border-[#E7E9EE]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#2A2E35]">
              {team.team} · {weekLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 grid place-items-center rounded-lg text-[#5B6271] hover:bg-[#E7E9EE] transition cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-[#5B6271]">
            <span>
              <span className="font-bold text-[#E89E00]">{pct}%</span>
              <span className="ml-1">
                ({team.submittedCount}/{team.totalCount})
              </span>
            </span>
            <span className="text-[#A7ADBA]">·</span>
            <span>
              {stage.tag} {stage.name}
            </span>
          </div>
        </div>

        <div className="p-5">
          {team.members.length === 0 ? (
            <p className="text-sm text-[#5B6271] py-8 text-center">
              아직 멤버 노트가 없어요.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {team.members.map((m) => (
                <MemberChipButton key={m.filePath} member={m} />
              ))}
            </div>
          )}
          <p className="mt-4 text-[11px] text-[#A7ADBA] leading-relaxed">
            칩을 클릭하면 해당 멤버의 미션 노트가 열립니다.
          </p>
        </div>
      </div>
    </div>
  );
}
