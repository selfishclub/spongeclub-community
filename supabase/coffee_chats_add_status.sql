-- coffee_chats 테이블에 status 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE coffee_chats
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'requested'
  CHECK (status IN ('requested', 'completed'));
