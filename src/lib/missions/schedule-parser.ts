/**
 * vault의 `99_meta/주차일정.md` 파서 + 현재 주차 판단 로직.
 *
 * 주차일정.md 형식:
 *   | 주차 | 시작 (토) | 종료 (금) | 폴더 |
 *   |------|---------|---------|------|
 *   | 1주차 | 2026-05-10 | 2026-05-16 | `02_mission/1주차_0510/` |
 *   ...
 *
 * OT(0주차)는 `주차일정.md`에 없어서 코드에서 하드코딩.
 * 변경되면 `OT_WEEK`만 갱신.
 */

const VAULT_REPO = "spongeclub/spongeclub_1";
const REVALIDATE_SECONDS = 600; // 10분

export type WeekStatus = "past" | "current" | "upcoming";

export type WeekInfo = {
  week: number; // 0 (OT), 1, 2, ...
  label: string; // "OT", "1주차", "2주차", ...
  shortLabel: string; // "OT", "1W", "2W", ...
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  folder: string; // "1주차_0510"
  status: WeekStatus;
};

// OT는 vault 주차일정.md에 없음 → 하드코딩 (변경 시 여기만)
const OT_WEEK_BASE: Omit<WeekInfo, "status"> = {
  week: 0,
  label: "OT",
  shortLabel: "OT",
  startDate: "2026-05-03",
  endDate: "2026-05-03",
  folder: "0주차_OT_0503",
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = process.env.VAULT_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * 주차일정.md fetch + 파싱. OT는 코드에서 prepend.
 */
export async function getAllWeeks(today: Date = new Date()): Promise<WeekInfo[]> {
  const url = `https://raw.githubusercontent.com/${VAULT_REPO}/main/99_meta/%EC%A3%BC%EC%B0%A8%EC%9D%BC%EC%A0%95.md`;

  let parsed: Omit<WeekInfo, "status">[] = [];
  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.ok) {
      const md = await res.text();
      parsed = parseScheduleTable(md);
    }
  } catch {
    // 네트워크/파싱 실패 → 빈 배열, OT만 노출
  }

  const todayISO = toISODate(today);
  const all = [OT_WEEK_BASE, ...parsed];

  return all.map((w) => ({
    ...w,
    status:
      todayISO < w.startDate
        ? "upcoming"
        : todayISO > w.endDate
          ? "past"
          : "current",
  }));
}

/**
 * "현재 진행 중인 주차"를 우선, 없으면 가장 가까운 다가오는 주차,
 * 그것도 없으면 가장 최근 종료 주차.
 */
export function getCurrentWeek(weeks: WeekInfo[]): WeekInfo | null {
  const current = weeks.find((w) => w.status === "current");
  if (current) return current;
  const upcoming = weeks.find((w) => w.status === "upcoming");
  if (upcoming) return upcoming;
  // 모두 past → 마지막 항목
  return weeks.length > 0 ? weeks[weeks.length - 1] : null;
}

/**
 * D-day: 주차 종료까지 며칠 남았는지.
 * 0 = 오늘이 마감일, 양수 = 남은 일수, 음수 = 지남
 */
export function daysUntilDeadline(
  week: WeekInfo,
  today: Date = new Date(),
): number {
  const end = new Date(`${week.endDate}T23:59:59+09:00`); // KST 자정 직전
  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 표 한 줄을 정규식으로 매칭. 폴더는 \`02_mission/...\` 형식.
 */
function parseScheduleTable(md: string): Omit<WeekInfo, "status">[] {
  const weeks: Omit<WeekInfo, "status">[] = [];
  // | 1주차 | 2026-05-10 | 2026-05-16 | `02_mission/1주차_0510/` |
  const re =
    /\|\s*(\d+)주차\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*`?02_mission\/([^`|/\s]+)\/?`?\s*\|/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const week = parseInt(m[1], 10);
    if (!Number.isFinite(week)) continue;
    weeks.push({
      week,
      label: `${week}주차`,
      shortLabel: `${week}W`,
      startDate: m[2],
      endDate: m[3],
      folder: m[4],
    });
  }
  return weeks;
}

function toISODate(d: Date): string {
  // 시스템 타임존이 KST가 아닐 수 있어서 toLocaleDateString으로 안전하게
  // Vercel은 UTC라 fallback 처리.
  const utcOffsetMin = d.getTimezoneOffset();
  const kstOffsetMin = -9 * 60;
  const adjustedMs = d.getTime() + (utcOffsetMin - kstOffsetMin) * 60 * 1000;
  return new Date(adjustedMs).toISOString().slice(0, 10);
}
