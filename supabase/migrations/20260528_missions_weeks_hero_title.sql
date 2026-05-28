-- 미션 게시판 — 주차별 hero 타이틀 / 서브타이틀 컬럼 추가
-- 어드민이 그 주 미션의 "주제 한 줄" (예: "나의 고객과 why 정의하기") 을
-- 직접 입력해 /missions hero 큰 제목으로 노출.
--
-- Supabase SQL Editor에서 실행하세요. (재실행 안전)

ALTER TABLE missions_weeks
  ADD COLUMN IF NOT EXISTS hero_title    text,
  ADD COLUMN IF NOT EXISTS hero_subtitle text;

COMMENT ON COLUMN missions_weeks.hero_title IS
  '이번주 hero 의 큰 서술형 타이틀 (예: "나의 고객과 why 정의하기"). null이면 기본 문구 사용.';
COMMENT ON COLUMN missions_weeks.hero_subtitle IS
  '이번주 hero 의 서브 카피. null이면 "이번 주에 만들고 나눌 과제입니다." 기본 사용.';
