/**
 * 6개 조 진척 매트릭스 — "데굴데굴" 레퍼런스 TeamProgress 룩.
 *
 * 데이터: 타깃 실데이터(`@/lib/missions/types`의 TeamProgress[]).
 *   - 데굴데굴 teams.ts mock 은 쓰지 않는다.
 *   - 조 색상/주제명은 실데이터에 없어 `_data/teamMeta.ts` 정적 맵 사용.
 *   - 멤버 상태는 실데이터가 `submitted: boolean`뿐 → 2단계(✓제출/○미제출).
 *     데굴데굴의 "작성 중" 3단계는 데이터가 없어 표현 불가.
 *   - 역할은 실데이터 role 이 "조장"/"조원" 수준 → 조장만 👑 아이콘.
 *
 * server component 가 데이터를 fetch 해 props 로 넘긴다(별도 client 없음).
 */
import type { TeamProgress, MissionSubmission } from "@/lib/missions/types";
import { getTeamMeta } from "../_data/teamMeta";

function MemberChip({ member }: { member: MissionSubmission }) {
  const isLeader = member.role === "조장";
  return (
    <span
      className={`m-chip ${member.submitted ? "m-done" : "m-todo"}`}
      title={`${member.role ?? "조원"} · ${
        member.submitted ? "제출" : "미제출"
      }`}
    >
      {isLeader && <span className="font-bold">👑</span>}
      {member.submitted ? "✓" : "○"} {member.displayName}
    </span>
  );
}

function TeamCard({ team }: { team: TeamProgress }) {
  const meta = getTeamMeta(team.team);
  const percent =
    team.totalCount > 0
      ? Math.round((team.submittedCount / team.totalCount) * 100)
      : 0;

  return (
    <div className="rounded-2xl bg-white border border-[#E7E9EE] p-4 hover:border-[#A7ADBA] transition">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg grid place-items-center text-white font-bold"
            style={{ background: meta.color }}
          >
            {meta.number || team.team}
          </div>
          <div>
            <div className="font-bold text-sm">
              {team.team}
              {meta.subject && (
                <span className="text-[#5B6271] font-medium">
                  {" · "}
                  {meta.subject}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#5B6271]">
              {team.totalCount > 0 ? `${team.totalCount}명` : "노트 없음"}
            </div>
          </div>
        </div>
        <div className="text-xs">
          <span className="font-bold text-[#E89E00]">{percent}%</span>
          <span className="text-[#5B6271] ml-1">
            ({team.submittedCount}/{team.totalCount})
          </span>
        </div>
      </div>
      <div
        className={`m-progress-bar m-team-${meta.number} mt-3 h-1.5 rounded-full`}
        style={{ "--p": `${percent}%` } as React.CSSProperties}
      />
      {team.members.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {team.members.map((m) => (
            <MemberChip key={m.filePath} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamProgressMatrix({
  teams,
  weekLabel,
}: {
  teams: TeamProgress[];
  weekLabel: string;
}) {
  const totalSubmitted = teams.reduce((s, t) => s + t.submittedCount, 0);
  const totalAll = teams.reduce((s, t) => s + t.totalCount, 0);
  const overallPercent =
    totalAll > 0 ? Math.round((totalSubmitted / totalAll) * 100) : 0;

  return (
    <section>
      <header className="flex items-end justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-lg">
            📊 6개 조 진척 · {weekLabel}
          </h3>
          <p className="text-xs text-[#5B6271] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              상태:
              <span className="m-chip m-done ml-1">✓ 제출</span>{" "}
              <span className="m-chip m-todo">○ 미제출</span>
            </span>
            <span className="text-[#A7ADBA]">·</span>
            <span>
              역할: <span className="font-semibold">👑 조장</span>
            </span>
          </p>
        </div>
        <div className="text-xs text-[#5B6271]">
          전체 평균{" "}
          <span className="font-bold text-[#E89E00]">{overallPercent}%</span> ·{" "}
          {totalSubmitted}/{totalAll} 제출
        </div>
      </header>

      {totalAll === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7E9EE] px-4 py-10 text-center text-sm text-[#5B6271] leading-relaxed">
          vault에서 미션 노트를 가져오지 못했어요.
          <br />
          <span className="text-xs text-[#A7ADBA]">
            rate limit·일시 오류일 수 있어요. 5분 뒤 자동 재시도됩니다.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((t) => (
            <TeamCard key={t.team} team={t} />
          ))}
        </div>
      )}

      <p className="mt-3 text-[11px] text-[#A7ADBA] text-center leading-relaxed">
        ✓ 제출 · ○ 미제출 — vault frontmatter `submitted: true` 기준.
        <br />
        vault push 후 최대 5분 안에 자동 반영됩니다.
      </p>
    </section>
  );
}
