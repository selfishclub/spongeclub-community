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

  // 1차: 날짜 범위 기반 status 부여
  const withStatus = all.map((w) => ({
    ...w,
    status:
      todayISO < w.startDate
        ? ("upcoming" as WeekStatus)
        : todayISO > w.endDate
          ? ("past" as WeekStatus)
          : ("current" as WeekStatus),
  }));

  // 2차: 인접 주차의 종료일·시작일이 같은 날인 경우(예: 3주차 5/24-5/31 +
  //      4주차 5/31-6/6) 양쪽 모두 current 가 되는 충돌을 정리.
  //      먼저 등장하는 주차만 current 로 두고, 이후 항목은 upcoming 으로 강등.
  let foundCurrent = false;
  return withStatus.map((w) => {
    if (w.status !== "current") return w;
    if (foundCurrent) return { ...w, status: "upcoming" as WeekStatus };
    foundCurrent = true;
    return w;
  });
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
  // KST 캘린더 날짜 기준 일수 차 — 주차 status 판정(toISODate)과 동일 기준.
  // 과거 방식(마감일 23:59:59 + Math.ceil)은 마감 *당일*에도 1을 돌려줘
  // "D-1"로 하루 밀려 표시됐다. 날짜 단위로 빼서 당일을 정확히 0으로 만든다.
  const end = new Date(`${week.endDate}T00:00:00+09:00`);
  const todayKst = new Date(`${toISODate(today)}T00:00:00+09:00`);
  return Math.round((end.getTime() - todayKst.getTime()) / (1000 * 60 * 60 * 24));
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
