-- 미션 게시판 — 주차별 "참고자료" jsonb 컬럼 추가
-- 어드민이 그 주 미션과 함께 노출할 참고자료 링크 5개 안팎을 직접 입력.
-- /missions hero 아래 카드 섹션으로 노출.
--
-- references: [{"index": int, "title": text, "url": text, "note": text|null}]
--   · index   — 1, 2, 3, ... 정렬용
--   · title   — 카드 큰 글씨
--   · url     — 클릭 시 이동할 외부 링크
--   · note    — 보조 설명 (선택)
--
-- Supabase SQL Editor에서 실행하세요. (재실행 안전)

ALTER TABLE missions_weeks
  ADD COLUMN IF NOT EXISTS reference_links jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN missions_weeks.reference_links IS
  '주차 참고자료 링크 카드. [{"index","title","url","note"}] · 빈 배열이면 사이트에 섹션 안 나옴.';
