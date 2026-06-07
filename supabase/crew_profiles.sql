-- 크루 프로필 + 커피챗 테이블
-- Supabase SQL Editor에서 실행하세요

-- 1. 크루 프로필 (크루챗 카드용)
CREATE TABLE IF NOT EXISTS crew_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  job_title text NOT NULL DEFAULT '',          -- 직무 (예: 마케터, 개발자, 디자이너)
  field text NOT NULL DEFAULT '',              -- 분야 (예: 이커머스, 에듀테크, 헬스케어)
  want_to_meet text NOT NULL DEFAULT '',       -- 어떤 사람이랑 얘기하고 싶은지
  sns_instagram text NOT NULL DEFAULT '',     -- 인스타그램 (선택)
  sns_blog text NOT NULL DEFAULT '',          -- 블로그 URL (선택)
  sns_linkedin text NOT NULL DEFAULT '',      -- 링크드인 (선택)
  sns_threads text NOT NULL DEFAULT '',       -- 스레드 (선택)
  sns_portfolio text NOT NULL DEFAULT '',     -- 포트폴리오 사이트 (선택)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crew_profiles_member_id ON crew_profiles(member_id);

ALTER TABLE crew_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON crew_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- 2. 커피챗 기록
CREATE TABLE IF NOT EXISTS coffee_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,        -- 등록한 사람
  partner_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,       -- 커피챗 상대
  memo text NOT NULL DEFAULT '',               -- 간단 메모 (선택)
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_chat CHECK (member_id != partner_id)
);

CREATE INDEX IF NOT EXISTS idx_coffee_chats_member_id ON coffee_chats(member_id);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_partner_id ON coffee_chats(partner_id);

ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON coffee_chats
  FOR ALL USING (true) WITH CHECK (true);
