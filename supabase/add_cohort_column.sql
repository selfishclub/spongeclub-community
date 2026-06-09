-- 멤버 기수 구분 컬럼 추가
-- Supabase 대시보드 > SQL Editor에서 실행
ALTER TABLE members ADD COLUMN IF NOT EXISTS cohort integer DEFAULT 1;

-- 기존 멤버 전원 1기 (DEFAULT 1이므로 자동 적용)

COMMENT ON COLUMN members.cohort IS '기수 (1=1기, 2=2기, ...)';
