-- 배지 정의 테이블
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_type text NOT NULL,
  condition_value int NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 멤버별 배지 획득 기록
CREATE TABLE member_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  achievement_id uuid NOT NULL REFERENCES achievements(id),
  earned_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false,
  UNIQUE(member_id, achievement_id)
);

-- 인덱스
CREATE INDEX idx_member_achievements_member ON member_achievements(member_id);
CREATE INDEX idx_member_achievements_achievement ON member_achievements(achievement_id);

-- 배지 시드 데이터 (9종)
INSERT INTO achievements (slug, name, description, icon, condition_type, condition_value, sort_order) VALUES
  ('first-sns', '첫 SNS 인증', 'SNS 인증을 처음 완료했어요', '📱', 'SNS_VERIFY_COUNT', 1, 1),
  ('first-session-host', '첫 공유회 오픈', '공유회를 처음 열었어요', '🎤', 'SESSION_HOST_COUNT', 1, 2),
  ('first-skill-share', '첫 스킬 공유', '스킬 공유를 처음 했어요', '🛠️', 'SKILL_SHARE_COUNT', 1, 3),
  ('skill-share-3', '스킬 공유 3회 달성', '스킬 공유를 3회 달성했어요', '🔥', 'SKILL_SHARE_COUNT', 3, 4),
  ('session-host-3', '공유회 3회 오픈', '공유회를 3번 열었어요', '🎉', 'SESSION_HOST_COUNT', 3, 5),
  ('first-shell-send', '첫 셸 보내기', '다른 멤버에게 셸을 처음 보냈어요', '🐚', 'SHELL_SENT_COUNT', 1, 6),
  ('shell-send-5', '셸 5회 보내기', '셸을 5번 보냈어요', '💛', 'SHELL_SENT_COUNT', 5, 7),
  ('shell-receive-5', '셸 5회 받기', '셸을 5번 받았어요', '🌟', 'SHELL_RECEIVED_COUNT', 5, 8),
  ('all-rounder', '이기적 올라운더', 'SNS 인증, 스킬 공유, 공유회 개최, 공유회 참여를 모두 달성했어요', '🧽', 'ALL_ROUNDER', 1, 9);
