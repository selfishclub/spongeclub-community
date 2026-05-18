-- 미션 게시판 — 주차별 "속기본 링크" 컬럼 추가
-- /admin/missions 에서 다시보기 URL과 나란히 관리, /missions hero 에 버튼 노출.
--
-- Supabase SQL Editor에서 실행하세요. (재실행 안전)

ALTER TABLE missions_weeks
  ADD COLUMN IF NOT EXISTS transcript_url text;  -- 주차 세션 속기본 URL

COMMENT ON COLUMN missions_weeks.transcript_url IS
  '주차 세션 속기본(노트) URL. null이면 사이트에 버튼 안 나옴.';
