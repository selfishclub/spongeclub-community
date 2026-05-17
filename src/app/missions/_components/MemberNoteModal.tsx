"use client";

/**
 * 멤버 미션 노트 모달 — 멤버 카드 클릭 시 옵시디언 노트를 렌더해 보여준다.
 *
 * 데이터: `/api/missions/note?path=` 를 client fetch.
 *   서버 라우트가 vault 원문을 GitHub Markdown API 로 HTML 렌더해 돌려준다.
 * 스타일: 본문 HTML 은 missions.css 의 `.note-content` 가 담당.
 */
import { useEffect, useState } from "react";
import type { MissionSubmission } from "@/lib/missions/types";
import type { RenderedNote } from "@/lib/missions/note-fetcher";

type LoadState = "loading" | "ready" | "error";

export function MemberNoteModal({
  member,
  onClose,
}: {
  member: MissionSubmission;
  onClose: () => void;
}) {
  const [note, setNote] = useState<RenderedNote | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  // ESC 로 닫기 + 모달 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // 멤버 노트 fetch — 컴포넌트는 멤버별로 리마운트되므로(NoteViewProvider 의
  // key) 초기 state("loading"/null)에서 시작한다. 여기선 fetch 만 수행.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/missions/note?path=${encodeURIComponent(member.filePath)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: RenderedNote) => {
        if (cancelled) return;
        setNote(data);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [member.filePath]);

  const roleLabel =
    member.role === "조장" ? "👑 조장" : member.role ?? "조원";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${member.displayName} 미션 노트`}
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-6"
    >
      {/* 딤 배경 — 바깥 클릭으로 닫힘 */}
      <div
        className="absolute inset-0 bg-[#0F1115]/70"
        onClick={onClose}
        aria-hidden
      />

      {/* 모달 본문 */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#E7E9EE] shadow-xl">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-5 py-3 border-b border-[#E7E9EE]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-[#5B6271] hover:text-[#2A2E35] transition cursor-pointer"
            >
              ← 현황판
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 grid place-items-center rounded-lg text-[#5B6271] hover:bg-[#E7E9EE] transition cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#2A2E35]">
              {member.team} · {member.displayName}
            </span>
            <span className="text-xs text-[#5B6271]">{roleLabel}</span>
            <span
              className={`m-chip ${member.submitted ? "m-done" : "m-todo"}`}
            >
              {member.submitted ? "✓ 제출" : "○ 작성 중"}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {state === "loading" && (
            <p className="text-sm text-[#5B6271] py-12 text-center">
              노트를 불러오는 중…
            </p>
          )}

          {state === "error" && (
            <p className="text-sm text-[#5B6271] py-12 text-center leading-relaxed">
              노트를 가져오지 못했어요.
              <br />
              <span className="text-xs text-[#A7ADBA]">
                vault 에 아직 push 되지 않았거나 일시 오류일 수 있어요.
              </span>
            </p>
          )}

          {state === "ready" && note && (
            <>
              <article
                className="note-content"
                dangerouslySetInnerHTML={{ __html: note.html }}
              />
              <a
                href={note.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 text-xs text-[#5B6271] hover:text-[#2A2E35] underline transition"
              >
                GitHub 에서 원본 보기 ↗
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
