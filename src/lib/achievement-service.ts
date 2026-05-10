import { createAdminClient } from "./supabase";
import { getSlackClient } from "./slack";

const ACHIEVEMENT_NOTIFY_CHANNEL = process.env.ACHIEVEMENT_NOTIFY_CHANNEL || "";

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
}

// 슬랙 메시지 템플릿
const SLACK_MESSAGES: Record<string, string> = {
  "first-sns": "첫 인증을 완료했어요 👏",
  "first-session-host": "첫 공유회를 열었어요 🎤",
  "first-skill-share": "스킬 공유의 첫걸음 🛠️",
  "skill-share-3": "꾸준히 공유하고 있어요 🔥",
  "session-host-3": "벌써 세 번째 공유회 🎉",
  "first-shell-send": "첫 셸을 보냈어요 🐚",
  "shell-send-5": "넉넉한 마음의 소유자 💛",
  "shell-receive-5": "다들 인정하는 스폰지 🌟",
  "all-rounder": "모든 활동을 섭렵한 진정한 스폰지 🧽",
};

// 멤버의 활동 통계 집계
async function getMemberStats(memberId: string) {
  const supabase = createAdminClient();

  const [snsResult, skillResult, hostResult, attendResult, sentResult, receivedResult] =
    await Promise.all([
      // SNS 인증 승인 횟수
      supabase
        .from("shell_requests")
        .select("id", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("type", "SNS_VERIFY")
        .eq("status", "APPROVED"),
      // 스킬 공유 승인 횟수
      supabase
        .from("shell_requests")
        .select("id", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("type", "SKILL_SHARE")
        .eq("status", "APPROVED"),
      // 공유회 개최 완료 횟수
      supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("host_id", memberId)
        .eq("status", "COMPLETED"),
      // 공유회 참여 횟수
      supabase
        .from("session_attendees")
        .select("id", { count: "exact", head: true })
        .eq("member_id", memberId)
        .in("status", ["REGISTERED", "ATTENDED"]),
      // 셸 보낸 횟수 (송신자로서)
      supabase
        .from("shell_transactions")
        .select("id", { count: "exact", head: true })
        .eq("related_member_id", memberId)
        .eq("reason", "MEMBER_GIFT"),
      // 셸 받은 횟수 (수신자로서)
      supabase
        .from("shell_transactions")
        .select("id", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("reason", "MEMBER_GIFT"),
    ]);

  return {
    SNS_VERIFY_COUNT: snsResult.count || 0,
    SKILL_SHARE_COUNT: skillResult.count || 0,
    SESSION_HOST_COUNT: hostResult.count || 0,
    SESSION_ATTEND_COUNT: attendResult.count || 0,
    SHELL_SENT_COUNT: sentResult.count || 0,
    SHELL_RECEIVED_COUNT: receivedResult.count || 0,
  };
}

// 조건 충족 여부 확인
function isConditionMet(
  stats: Record<string, number>,
  conditionType: string,
  conditionValue: number
): boolean {
  if (conditionType === "ALL_ROUNDER") {
    return (
      stats.SNS_VERIFY_COUNT >= 1 &&
      stats.SKILL_SHARE_COUNT >= 1 &&
      stats.SESSION_HOST_COUNT >= 1 &&
      stats.SESSION_ATTEND_COUNT >= 1
    );
  }

  const count = stats[conditionType];
  if (count === undefined) return false;
  return count >= conditionValue;
}

// 멤버의 배지 체크 + 새로 획득한 배지 지급
export async function checkAchievements(
  memberId: string,
  options?: { skipNotification?: boolean }
): Promise<{ newBadges: string[] }> {
  const supabase = createAdminClient();
  const newBadges: string[] = [];

  // 모든 활성 배지 조회
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (!achievements || achievements.length === 0) return { newBadges };

  // 이미 획득한 배지 조회
  const { data: earned } = await supabase
    .from("member_achievements")
    .select("achievement_id")
    .eq("member_id", memberId);

  const earnedIds = new Set((earned || []).map((e) => e.achievement_id));

  // 미획득 배지만 필터
  const unchecked = (achievements as Achievement[]).filter(
    (a) => !earnedIds.has(a.id)
  );
  if (unchecked.length === 0) return { newBadges };

  // 활동 통계 집계
  const stats = await getMemberStats(memberId);

  // 각 미획득 배지 조건 체크
  for (const achievement of unchecked) {
    if (isConditionMet(stats, achievement.condition_type, achievement.condition_value)) {
      // 배지 지급
      const { error } = await supabase.from("member_achievements").insert({
        member_id: memberId,
        achievement_id: achievement.id,
        notified: options?.skipNotification ? true : false,
      });

      if (!error) {
        newBadges.push(achievement.slug);

        // Slack 알림
        if (!options?.skipNotification && ACHIEVEMENT_NOTIFY_CHANNEL) {
          await notifyAchievement(memberId, achievement);
        }
      }
    }
  }

  return { newBadges };
}

// Slack 알림 전송
async function notifyAchievement(memberId: string, achievement: Achievement) {
  try {
    const supabase = createAdminClient();
    const { data: member } = await supabase
      .from("members")
      .select("slack_user_id, name")
      .eq("id", memberId)
      .single();

    if (!member) return;

    const mention = member.slack_user_id
      ? `<@${member.slack_user_id}>`
      : member.name;

    const detail = SLACK_MESSAGES[achievement.slug] || achievement.description;

    const slackClient = getSlackClient();
    await slackClient.chat.postMessage({
      channel: ACHIEVEMENT_NOTIFY_CHANNEL,
      text: `🏅 ${mention} 님이 *${achievement.name}* 배지를 획득했어요! ${detail}`,
    });

    // notified 플래그 업데이트
    await supabase
      .from("member_achievements")
      .update({ notified: true })
      .eq("member_id", memberId)
      .eq("achievement_id", achievement.id);
  } catch (e) {
    console.error("[배지 알림] 오류:", e);
  }
}

// 멤버의 획득한 배지 목록 조회
export async function getMemberAchievements(memberId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("member_achievements")
    .select(`
      earned_at,
      achievements (
        slug, name, description, icon, sort_order
      )
    `)
    .eq("member_id", memberId)
    .order("earned_at", { ascending: true });

  return (data || []).map((row) => {
    const achievement = row.achievements as unknown as {
      slug: string;
      name: string;
      description: string;
      icon: string;
      sort_order: number;
    };
    return {
      slug: achievement.slug,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      sort_order: achievement.sort_order,
      earned_at: row.earned_at,
    };
  });
}

// 전체 멤버 배지 일괄 체크 (백필용)
export async function backfillAllAchievements(): Promise<{
  total: number;
  granted: number;
  details: { name: string; badges: string[] }[];
}> {
  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true);

  if (!members) return { total: 0, granted: 0, details: [] };

  let granted = 0;
  const details: { name: string; badges: string[] }[] = [];

  for (const member of members) {
    const { newBadges } = await checkAchievements(member.id, {
      skipNotification: true,
    });
    if (newBadges.length > 0) {
      granted += newBadges.length;
      details.push({ name: member.name, badges: newBadges });
    }
  }

  return { total: members.length, granted, details };
}
