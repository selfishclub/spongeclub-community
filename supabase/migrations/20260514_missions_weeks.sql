-- 미션 게시판 — 주차별 미션 정의 (admin 관리)
-- /missions 페이지의 3번 섹션(이번주 미션)과 다시보기 링크 source.
-- vault `_missions.md` 의존을 제거하고 admin이 web form으로 직접 관리.
--
-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS missions_weeks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 주차 식별
  week_folder  text UNIQUE NOT NULL,        -- "1주차_0510", "0주차_OT_0503"
  week_number  int NOT NULL,                 -- 0(OT), 1, 2, ...
  label        text NOT NULL,                -- "OT", "1주차"

  -- 일정
  start_date   date NOT NULL,
  end_date     date NOT NULL,

  -- 미션 (admin 입력)
  missions     jsonb DEFAULT '[]'::jsonb,    -- [{"index": 1, "title": "..."}]
  replay_url   text,                          -- 주차 다시보기 URL

  -- 운영
  published    boolean DEFAULT true,          -- false면 사이트 노출 안 함
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- 초기 데이터 시드 (vault 99_meta/주차일정.md 기준 — 2026-05-14)
-- ON CONFLICT 로 재실행 안전.
INSERT INTO missions_weeks (week_folder, week_number, label, start_date, end_date) VALUES
  ('0주차_OT_0503', 0, 'OT',    '2026-05-03', '2026-05-03'),
  ('1주차_0510',    1, '1주차', '2026-05-10', '2026-05-16'),
  ('2주차_0517',    2, '2주차', '2026-05-17', '2026-05-23'),
  ('3주차_0524',    3, '3주차', '2026-05-24', '2026-05-30'),
  ('4주차_0531',    4, '4주차', '2026-05-31', '2026-06-06'),
  ('5주차',         5, '5주차', '2026-06-07', '2026-06-13'),
  ('6주차',         6, '6주차', '2026-06-14', '2026-06-20')
ON CONFLICT (week_folder) DO NOTHING;

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION missions_weeks_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS missions_weeks_updated_at ON missions_weeks;
CREATE TRIGGER missions_weeks_updated_at
  BEFORE UPDATE ON missions_weeks
  FOR EACH ROW EXECUTE FUNCTION missions_weeks_set_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_missions_weeks_number ON missions_weeks(week_number);
CREATE INDEX IF NOT EXISTS idx_missions_weeks_dates ON missions_weeks(start_date, end_date);

-- RLS: 누구나 published=true 만 SELECT, 쓰기는 service role 만
ALTER TABLE missions_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY missions_weeks_read_published
  ON missions_weeks
  FOR SELECT
  USING (published = true);

COMMENT ON TABLE missions_weeks IS
  '주차별 미션 정의 — admin이 web form으로 관리. /missions 3번 섹션 source.';

COMMENT ON COLUMN missions_weeks.missions IS
  '[{"index": 1, "title": "..."}, {"index": 2, "title": "..."}] 형태. 보통 3개.';

COMMENT ON COLUMN missions_weeks.replay_url IS
  '주차 세션 다시보기 URL (YouTube 등). null이면 사이트에 버튼 안 나옴.';
