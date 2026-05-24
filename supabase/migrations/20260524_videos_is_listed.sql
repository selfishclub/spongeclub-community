-- videos 테이블에 판매 노출 여부 컬럼 추가
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_listed boolean NOT NULL DEFAULT false;

-- vod_requests에 video_id FK 추가 (영상 직접 구매 신청용)
ALTER TABLE vod_requests ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE vod_requests ADD COLUMN IF NOT EXISTS video_id uuid REFERENCES videos(id) ON DELETE CASCADE;

-- session_id 또는 video_id 중 하나는 있어야 함
ALTER TABLE vod_requests ADD CONSTRAINT vod_requests_target_check
  CHECK (session_id IS NOT NULL OR video_id IS NOT NULL);

-- video_id + member_id 중복 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_vod_requests_video_member
  ON vod_requests(video_id, member_id) WHERE video_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vod_requests_video ON vod_requests(video_id) WHERE video_id IS NOT NULL;
