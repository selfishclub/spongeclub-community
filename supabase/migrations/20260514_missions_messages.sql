-- 미션 게시판: Slack 메시지 캐시 테이블
-- /missions 페이지의 2번 공지·6번 질문 섹션에 노출할 Slack 메시지를 적재.
--
-- 흐름:
--   Slack Events API → /api/missions/slack-events (다음 PR)
--                    → 이 테이블에 INSERT/UPDATE
--                    → /missions 페이지가 fetch해서 렌더
--
-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS missions_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Slack 식별자 (동일 메시지 중복 INSERT 방지)
  slack_ts        text NOT NULL,             -- "1715234567.123456"
  slack_channel   text NOT NULL,             -- "C012345"
  slack_thread_ts text,                       -- 답글이면 부모 ts

  -- 메타
  channel_name    text,                       -- "0-공지사항" (조회 편의용)
  author_id       text,                       -- "U012345"
  author_name     text,                       -- "다다"
  author_avatar   text,                       -- Slack 프로필 사진 URL

  -- 본문
  text            text NOT NULL,
  permalink       text,                       -- Slack 메시지 영구 링크

  -- 분류 (Slack 채널 매핑 또는 본문 룰로 결정)
  category        text NOT NULL,              -- 'notice' | 'question' | 'share'
  urgency         text,                       -- 'urgent' | 'schedule' | 'resource' (공지 한정)

  -- 주차 연결 (어느 주차와 관련된 메시지인지)
  week_folder     text,                       -- "1주차_0510" — null이면 주차 무관

  -- 미션 관련도 점수 (Graphify 도입 후 채워짐)
  relevance_score smallint,                   -- 0~100

  -- 반응 통계
  reactions       jsonb DEFAULT '{}'::jsonb,  -- {"+1": 5, "heart": 2}
  reply_count     int DEFAULT 0,

  -- 운영
  approved        boolean DEFAULT false,      -- v1 초반 운영진 승인 후 게시 (안정화되면 자동)
  hidden          boolean DEFAULT false,      -- 스팸/노이즈 숨김 처리
  approved_by     uuid REFERENCES members(id),
  approved_at     timestamptz,

  created_at      timestamptz DEFAULT now(),  -- DB 적재 시점
  posted_at       timestamptz NOT NULL,        -- Slack에 올린 시점

  UNIQUE (slack_ts, slack_channel)
);

-- 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_missions_messages_category_approved_posted
  ON missions_messages (category, approved, posted_at DESC)
  WHERE hidden = false;

CREATE INDEX IF NOT EXISTS idx_missions_messages_week
  ON missions_messages (week_folder, category, posted_at DESC)
  WHERE hidden = false;

CREATE INDEX IF NOT EXISTS idx_missions_messages_channel_posted
  ON missions_messages (slack_channel, posted_at DESC);

-- RLS: /missions는 public route라 anon도 읽지만, 승인된 것만.
-- 쓰기는 service role(서버 사이드 webhook)만.
ALTER TABLE missions_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY missions_messages_read_approved
  ON missions_messages
  FOR SELECT
  USING (approved = true AND hidden = false);

-- service role은 RLS 우회하므로 별도 INSERT/UPDATE 정책 불필요.

COMMENT ON TABLE missions_messages IS
  '미션 게시판 — Slack #공지/질문 채널 메시지 캐시. webhook으로 적재, /missions 페이지가 읽음.';

COMMENT ON COLUMN missions_messages.category IS
  'notice = #0-공지사항, question = 질문 채널, share = 노하우·자료 공유';

COMMENT ON COLUMN missions_messages.urgency IS
  '공지 라벨용. urgent(긴급) / schedule(일정) / resource(자료) — 본문 키워드로 자동 분류';

COMMENT ON COLUMN missions_messages.relevance_score IS
  'Graphify 미션 관련도 점수 (0~100). null이면 미분류, ≥70 이상만 페이지 노출 권장';

COMMENT ON COLUMN missions_messages.approved IS
  'v1 초반: 운영진이 승인해야 페이지 노출. 안정화 후 webhook에서 true 기본값으로 전환';
