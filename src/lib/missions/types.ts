/**
 * 미션 게시판 — 공통 타입
 *
 * 데이터 source: spongeclub/spongeclub_1 vault (Obsidian)
 * 파일 패턴: 02_mission/{N주차_MMDD}/조N/조N_닉네임(본명)_N주차_submit.md
 * frontmatter: { team, member, role, week, submitted, ... }
 */

export type MissionSubmission = {
  team: string; // "4조"
  member: string; // "다다(김다솔)" (원본)
  displayName: string; // "다다" (괄호 앞 부분, UI 표시용)
  role?: string; // "조장" / "조원"
  week: number;
  submitted: boolean;
  filePath: string; // 디버그용
};

export type TeamProgress = {
  team: string; // "4조"
  submittedCount: number;
  totalCount: number;
  members: MissionSubmission[];
};
