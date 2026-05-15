"use client";

/**
 * 과제 현황판 공유 상태 provider.
 *
 * MissionHero 의 "📊 과제 현황판" 버튼과 WeekTimeline 의 주차 pill 이
 * 같은 모달을 연다. 두 트리거가 상태를 공유해야 하므로 client context 로 묶는다.
 *
 * 데이터(`progressByWeek`: 주차번호 → TeamProgress[])는 page.tsx(server)가
 * 모든 주차에 대해 `getAllTeamsProgress()`를 호출해 주입한다.
 * provider 가 모달(ProgressModal)을 직접 렌더한다.
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { TeamProgress } from "@/lib/missions/types";
import type { WeekInfo } from "@/lib/missions/schedule-parser";
import { ProgressModal } from "./ProgressModal";

export type ProgressBoardContextValue = {
  /** 주차번호(0~6) → 6개 조 진척 */
  progressByWeek: Record<number, TeamProgress[]>;
  /** 모달에 표시할 주차 메타(라벨 등) */
  weeks: WeekInfo[];
  /** 모달이 현재 표시 중인 주차번호 */
  selectedWeek: number;
  /** 모달 열림 여부 */
  open: boolean;
  /** 특정 주차로 모달 열기 */
  openModal: (weekNumber: number) => void;
  /** 모달 닫기 */
  closeModal: () => void;
  /** 모달 안에서 주차 전환 */
  selectWeek: (weekNumber: number) => void;
};

const ProgressBoardContext = createContext<ProgressBoardContextValue | null>(
  null,
);

export function useProgressBoard(): ProgressBoardContextValue {
  const ctx = useContext(ProgressBoardContext);
  if (!ctx) {
    throw new Error(
      "useProgressBoard 는 ProgressBoardProvider 안에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}

export function ProgressBoardProvider({
  progressByWeek,
  weeks,
  currentWeekNumber,
  children,
}: {
  progressByWeek: Record<number, TeamProgress[]>;
  weeks: WeekInfo[];
  currentWeekNumber: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeekNumber);

  const openModal = useCallback((weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);
  const selectWeek = useCallback((weekNumber: number) => {
    setSelectedWeek(weekNumber);
  }, []);

  const value = useMemo<ProgressBoardContextValue>(
    () => ({
      progressByWeek,
      weeks,
      selectedWeek,
      open,
      openModal,
      closeModal,
      selectWeek,
    }),
    [progressByWeek, weeks, selectedWeek, open, openModal, closeModal, selectWeek],
  );

  return (
    <ProgressBoardContext.Provider value={value}>
      {children}
      <ProgressModal />
    </ProgressBoardContext.Provider>
  );
}
