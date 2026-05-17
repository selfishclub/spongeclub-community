"use client";

/**
 * 진척 매트릭스의 멤버 카드 — 클릭하면 해당 멤버의 미션 노트 모달이 열린다.
 *
 * TeamProgressMatrix(공유 컴포넌트)가 이 버튼을 렌더하며,
 * 클릭 동작은 NoteViewProvider context 로 위임한다.
 */
import type { MissionSubmission } from "@/lib/missions/types";
import { useNoteView } from "./NoteViewProvider";

export function MemberChipButton({ member }: { member: MissionSubmission }) {
  const { openNote } = useNoteView();
  const isLeader = member.role === "조장";

  return (
    <button
      type="button"
      onClick={() => openNote(member)}
      className={`m-chip m-chip-btn ${member.submitted ? "m-done" : "m-todo"}`}
      title={`${member.role ?? "조원"} · ${
        member.submitted ? "제출" : "미제출"
      } · 클릭해 노트 보기`}
    >
      {isLeader && <span className="font-bold">👑</span>}
      {member.submitted ? "✓" : "○"} {member.displayName}
    </button>
  );
}
