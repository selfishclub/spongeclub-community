/**
 * SpongeVillageProgress — 스폰지클럽 주차별 과제 달성율 비주얼
 *
 * 주차별 과제 달성율에 따라 20%, 40%, 55%, 70% 기준으로
 * 파인애플 집의 4가지 변형 상태를 선택한다.
 *
 * 원본: vault `06_unit/데굴데굴/sponge-village/BikiniBottom.tsx` (PR #465).
 * 자산 경로만 community repo public 디렉토리에 맞춰 기본값 조정.
 */

import * as React from "react";

export type Team = {
  name: string;
  weeklyAchievementRate?: number;
  achievementRate?: number;
  submittedCount?: number;
  totalAssignments?: number;
  progress?: number;
  href?: string;
  onClick?: () => void;
};

export type SpongeVillageProgressProps = {
  teams: Team[];
  totalStages?: number;
  totalAssignments?: number;
  emptyLabel?: string;
  backgroundImageSrc?: string;
  stageSpriteSrc?: string;
};

export type BikiniBottomProps = SpongeVillageProgressProps;

const TEAM_ACCENTS = ["#55c2d2", "#e77fba", "#9b7ee8", "#ef7759", "#63cc8e", "#a987e8"];
const TEAM_FILTERS = [
  { hue: "0deg", brightness: "1" },
  { hue: "-10deg", brightness: "1.07" },
  { hue: "8deg", brightness: "1.02" },
  { hue: "18deg", brightness: "1.08" },
  { hue: "-5deg", brightness: ".98" },
  { hue: "-18deg", brightness: "1.1" },
];
const STAGE_NAMES = ["빈 모래 자리", "받침터", "파인애플 본체", "창문·문", "완성"];
const STAGE_THRESHOLDS = [0.2, 0.4, 0.55, 0.7];
const STAGE_SPRITE_INDEXES = [0, 1, 2, 5, 7];
const FINAL_STAGE = STAGE_THRESHOLDS.length;
const SPRITE_MAX_INDEX = 7;
const SLOT_COUNT = 6;

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clamp01(n: number): number {
  return clamp(n, 0, 1);
}

function normalizeRate(rate: number): number {
  return clamp01(rate > 1 ? rate / 100 : rate);
}

function getStageFromProgress(progress: number): number {
  let stage = 0;
  for (const threshold of STAGE_THRESHOLDS) {
    if (progress >= threshold) stage += 1;
  }
  return stage;
}

function getTeamState(team: Team | null, fallbackTotal: number) {
  if (!team) {
    return { stage: 0, progress: 0, submitted: 0, total: fallbackTotal };
  }

  const total = Math.max(1, team.totalAssignments ?? fallbackTotal);
  const directRate = team.weeklyAchievementRate ?? team.achievementRate;

  if (typeof directRate === "number") {
    const progress = normalizeRate(directRate);
    return {
      stage: getStageFromProgress(progress),
      progress,
      submitted: Math.round(progress * total),
      total,
    };
  }

  if (typeof team.submittedCount === "number") {
    const submitted = clamp(Math.round(team.submittedCount), 0, total);
    const progress = clamp01(team.submittedCount / total);
    return {
      stage: getStageFromProgress(progress),
      progress,
      submitted,
      total,
    };
  }

  const progress = normalizeRate(team.progress ?? 0);
  return {
    stage: getStageFromProgress(progress),
    progress,
    submitted: Math.round(progress * total),
    total,
  };
}

export function SpongeVillageProgress({
  teams,
  totalAssignments = 7,
  emptyLabel = "-",
  backgroundImageSrc = "/missions/sponge-village-empty-bg.png",
  stageSpriteSrc = "/missions/stages/pineapple-house-stages-aligned.png",
}: SpongeVillageProgressProps) {
  const items = Array.from({ length: SLOT_COUNT }, (_, idx) => {
    const team = teams[idx] ?? null;
    const state = getTeamState(team, totalAssignments);
    const stage = clamp(state.stage, 0, FINAL_STAGE);
    const progress = clamp01(state.progress);
    const pct = Math.round(progress * 100);
    const spriteIndex = STAGE_SPRITE_INDEXES[stage] ?? STAGE_SPRITE_INDEXES[0];

    return {
      accent: TEAM_ACCENTS[idx % TEAM_ACCENTS.length],
      filter: TEAM_FILTERS[idx % TEAM_FILTERS.length],
      href: team?.href,
      onClick: team?.onClick,
      label: team?.name ?? emptyLabel,
      pct,
      progress,
      slotIndex: idx,
      stage,
      stageName: STAGE_NAMES[Math.min(stage, STAGE_NAMES.length - 1)],
      spriteIndex,
      submitted: state.submitted,
      total: state.total,
    };
  });

  return (
    <section className="bb-root" aria-label="스폰지 빌리지 6개 조 주차별 과제 달성율">
      <SpongeVillageStyles />
      <div
        className="bb-scene"
        style={
          {
            "--bb-bg": `url("${backgroundImageSrc}")`,
            "--bb-stage-sprite": `url("${stageSpriteSrc}")`,
          } as React.CSSProperties
        }
      >
        <div className="bb-visual-grid">
          {items.map((item) => (
            <VisualSlot key={item.slotIndex} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

type SlotState = {
  accent: string;
  filter: { hue: string; brightness: string };
  href?: string;
  onClick?: () => void;
  label: string;
  pct: number;
  progress: number;
  slotIndex: number;
  stage: number;
  stageName: string;
  spriteIndex: number;
  submitted: number;
  total: number;
};

type WrapperKind = "a" | "button" | "div";

function getWrapperProps(item: SlotState) {
  const label = `${item.label} 주차별 과제 달성율 ${item.pct}%, ${item.stageName} 단계`;
  if (item.href) {
    return {
      kind: "a" as WrapperKind,
      props: { href: item.href, role: "link", "aria-label": `${label}로 이동` },
    };
  }
  if (item.onClick) {
    return {
      kind: "button" as WrapperKind,
      props: {
        type: "button" as const,
        onClick: item.onClick,
        "aria-label": `${label} — 멤버 보기`,
      },
    };
  }
  return {
    kind: "div" as WrapperKind,
    props: { role: "group", tabIndex: 0, "aria-label": label },
  };
}

function getSlotVars(item: SlotState): React.CSSProperties {
  const x = item.spriteIndex === 0 ? 0 : (item.spriteIndex / SPRITE_MAX_INDEX) * 100;

  return {
    "--bb-accent": item.accent,
    "--bb-brightness": item.filter.brightness,
    "--bb-hue": item.filter.hue,
    "--bb-progress": `${item.pct}%`,
    "--bb-stage-x": `${x}%`,
  } as React.CSSProperties;
}

function VisualSlot(item: SlotState) {
  const { kind, props } = getWrapperProps(item);
  const Wrapper: React.ElementType = kind;

  return (
    <Wrapper
      className={`bb-visual-slot bb-stage-${item.stage}`}
      style={getSlotVars(item)}
      {...props}
    >
      <span className="bb-house-stage" aria-hidden="true" />
      <span className="bb-stage-ring" aria-hidden="true" />
      <span className="bb-team-label">{item.label}</span>
    </Wrapper>
  );
}

function SpongeVillageStyles() {
  return (
    <style>{`
      .bb-root {
        width: 100%;
      }

      .bb-scene {
        position: relative;
        width: 100%;
        aspect-ratio: 2172 / 724;
        overflow: hidden;
        border-radius: 18px;
        background-image: var(--bb-bg);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        box-shadow:
          0 14px 36px rgba(28, 107, 122, .16),
          0 1px 0 rgba(255, 255, 255, .72) inset;
      }

      .bb-scene::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        height: 39%;
        pointer-events: none;
        background:
          radial-gradient(ellipse at 20% 70%, rgba(246, 218, 151, .52), transparent 34%),
          radial-gradient(ellipse at 78% 82%, rgba(240, 204, 129, .42), transparent 36%),
          linear-gradient(180deg, rgba(244, 217, 157, 0), rgba(244, 217, 157, .84) 26%, rgba(238, 204, 139, .92));
      }

      .bb-visual-grid {
        position: absolute;
        inset: 1.5% 4.2% 6%;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }

      .bb-visual-slot {
        position: relative;
        min-width: 0;
        height: 100%;
        overflow: visible;
        color: inherit;
        text-decoration: none;
        cursor: pointer;
        outline: none;
        isolation: isolate;
        background: transparent;
        border: 0;
        padding: 0;
        font: inherit;
      }

      button.bb-visual-slot {
        appearance: none;
      }

      .bb-team-label {
        position: absolute;
        left: 50%;
        bottom: 4px;
        transform: translateX(-50%);
        z-index: 2;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, .92);
        border: 1px solid rgba(255, 255, 255, .8);
        color: #173940;
        font-size: 12px;
        font-weight: 850;
        line-height: 1;
        box-shadow: 0 4px 12px rgba(22, 83, 93, .14);
        pointer-events: none;
        white-space: nowrap;
      }

      .bb-house-stage {
        position: absolute;
        display: block;
        left: 50%;
        bottom: 0;
        width: min(112%, 324px);
        aspect-ratio: 320 / 380;
        background-image: var(--bb-stage-sprite);
        background-repeat: no-repeat;
        background-size: 800% 100%;
        background-position: var(--bb-stage-x) center;
        filter: hue-rotate(var(--bb-hue)) brightness(var(--bb-brightness)) saturate(1.03);
        transform: translateX(-50%);
      }

      .bb-stage-ring {
        position: absolute;
        inset: 2% 1% 0;
        z-index: 1;
        border-radius: 20px;
        opacity: 0;
        pointer-events: none;
        box-shadow:
          inset 0 0 0 3px color-mix(in srgb, var(--bb-accent), white 28%),
          0 12px 28px rgba(22, 83, 93, .16);
        transition: opacity .2s ease;
      }

      .bb-visual-slot:hover .bb-stage-ring,
      .bb-visual-slot:focus-visible .bb-stage-ring {
        opacity: 1;
      }

      @media (max-width: 720px) {
        .bb-scene {
          border-radius: 14px;
        }

        .bb-visual-grid {
          inset: 2% 3% 8%;
        }

        .bb-house-stage {
          width: 118%;
        }

        .bb-stage-ring {
          inset: 6px 4px;
          border-radius: 12px;
        }

        .bb-team-label {
          font-size: 10px;
          padding: 2px 7px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .bb-stage-ring {
          transition: none !important;
        }
      }
    `}</style>
  );
}

export const BikiniBottom = SpongeVillageProgress;

export default SpongeVillageProgress;
