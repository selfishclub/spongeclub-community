"use client";

/**
 * 멤버 미션 노트 뷰어 공유 상태 provider.
 *
 * 진척 매트릭스의 멤버 카드(MemberChipButton)는 인라인 섹션과 현황판 모달
 * 양쪽에 나타난다. 어디서 클릭하든 같은 노트 모달(MemberNoteModal)을 열기
 * 위해 client context 로 묶는다.
 *
 * 노트 모달은 z-[60] — 현황판 모달(z-50)보다 위 → 모달 안에서 클릭해도
 * 드릴다운처럼 노트가 위에 겹쳐 열리고, 닫으면 현황판으로 돌아간다.
 */
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { MissionSubmission } from "@/lib/missions/types";
import { MemberNoteModal } from "./MemberNoteModal";

type NoteViewContextValue = {
  /** 해당 멤버의 미션 노트를 모달로 연다 */
  openNote: (member: MissionSubmission) => void;
};

const NoteViewContext = createContext<NoteViewContextValue | null>(null);

export function useNoteView(): NoteViewContextValue {
  const ctx = useContext(NoteViewContext);
  if (!ctx) {
    throw new Error(
      "useNoteView 는 NoteViewProvider 안에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}

export function NoteViewProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MissionSubmission | null>(null);

  const openNote = useCallback((m: MissionSubmission) => setMember(m), []);
  const closeNote = useCallback(() => setMember(null), []);

  return (
    <NoteViewContext.Provider value={{ openNote }}>
      {children}
      {/* key=filePath → 다른 멤버 클릭 시 모달이 리마운트돼 상태가 초기화된다 */}
      {member && (
        <MemberNoteModal
          key={member.filePath}
          member={member}
          onClose={closeNote}
        />
      )}
    </NoteViewContext.Provider>
  );
}
