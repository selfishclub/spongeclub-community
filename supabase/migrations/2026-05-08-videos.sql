-- 영상 시청 기능 마이그레이션
-- Supabase SQL Editor에서 실행하세요.

-- 1. videos 테이블
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_url text NOT NULL,
  description text,
  cost integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES members(id)
);

CREATE INDEX IF NOT EXISTS idx_videos_expires ON videos(expires_at);

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. video_grants 테이블 (어드민이 멤버에게 시청 권한 부여)
CREATE TABLE IF NOT EXISTS video_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id),
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES members(id),
  transaction_id uuid REFERENCES shell_transactions(id),
  UNIQUE(video_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_video_grants_member ON video_grants(member_id);
CREATE INDEX IF NOT EXISTS idx_video_grants_video ON video_grants(video_id);

-- 3. RLS 활성화 (service_role은 자동 bypass)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_grants ENABLE ROW LEVEL SECURITY;

-- 4. shell_transactions에 reason 'VIDEO_GRANT' 추가 (참고용 — enum 강제 안 함)
COMMENT ON TABLE videos IS '유튜브 영상 (Unlisted 권장). expires_at까지 권한 받은 멤버만 시청 가능';
COMMENT ON TABLE video_grants IS '영상 시청 권한 (어드민이 멤버에게 부여, cost만큼 셸 차감)';
