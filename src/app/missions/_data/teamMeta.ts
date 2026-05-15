/**
 * 조별 정적 메타데이터 — 색상 · 주제명 · 짧은 라벨.
 *
 * vault 실데이터(`@/lib/missions/types`의 TeamProgress)에는 색상·주제가
 * 없으므로, "데굴데굴" 레퍼런스(web/src/data/teams.ts)의 값을 조 번호(1~6)
 * 기준 정적 맵으로 옮겨 쓴다. 멤버/제출 데이터는 vault 실데이터를 쓴다.
 */

export type TeamMeta = {
  /** 색상 hex */
  color: string;
  /** 짧은 라벨 (예: "AX PM") */
  shortName: string;
  /** 풀 주제 (예: "AX PM · 프로덕트 구조 설계") */
  subject: string;
};

/** 조 번호(1~6) → 메타 */
export const TEAM_META: Record<number, TeamMeta> = {
  1: {
    color: "#FF8A4C",
    shortName: "AX PM",
    subject: "AX PM · 프로덕트 구조 설계",
  },
  2: {
    color: "#FFB800",
    shortName: "콘텐츠 마케팅",
    subject: "콘텐츠 마케팅 사이트 + Vercel 자동배포",
  },
  3: {
    color: "#7CC4FF",
    shortName: "OS 설계 철학",
    subject: "OS 설계 철학 · Sullivan 프로젝트",
  },
  4: {
    color: "#A78BFA",
    shortName: "OPS 시스템화",
    subject: "레포 · 자동화 · 아카이브 · OPS 시스템화",
  },
  5: {
    color: "#34D399",
    shortName: "유저 프로덕트",
    subject: "월 1개 유저 프로덕트 런칭",
  },
  6: {
    color: "#F472B6",
    shortName: "운영 총괄",
    subject: "운영 총괄 · 콘텐츠 운영 시스템",
  },
};

const DEFAULT_META: TeamMeta = {
  color: "#A7ADBA",
  shortName: "조",
  subject: "",
};

/**
 * "4조" / "조4" / "4" 같은 팀 문자열에서 조 번호를 뽑아 메타를 반환.
 * 매칭 실패 시 회색 기본값.
 */
export function getTeamMeta(team: string): TeamMeta & { number: number } {
  const m = team.match(/\d+/);
  const number = m ? parseInt(m[0], 10) : 0;
  return { number, ...(TEAM_META[number] ?? DEFAULT_META) };
}
