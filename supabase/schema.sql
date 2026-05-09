-- 스폰지클럽 셸 시스템 DB 스키마
-- Supabase SQL Editor에서 실행하세요.

-- 1. members 테이블
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_last4 text NOT NULL UNIQUE,
  email text,
  slack_user_id text UNIQUE,
  survey_completed boolean DEFAULT false,
  shell_balance integer DEFAULT 0,
  is_admin boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. shell_transactions 테이블
CREATE TABLE shell_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  amount integer NOT NULL,
  reason text NOT NULL,
  reason_detail text,
  related_session_id uuid,
  related_member_id uuid REFERENCES members(id),
  created_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_shell_tx_member ON shell_transactions(member_id);
CREATE INDEX idx_shell_tx_created ON shell_transactions(created_at);
CREATE INDEX idx_shell_tx_reason ON shell_transactions(reason);

-- 3. daily_limits 테이블
CREATE TABLE daily_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  date date NOT NULL,
  gifts_sent integer DEFAULT 0,
  sns_verifies integer DEFAULT 0,
  UNIQUE(member_id, date)
);

-- 4. sessions 테이블 (공유회 — 나중에 사용)
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES members(id),
  title text NOT NULL,
  description text,
  target_audience text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer,
  capacity integer,
  zoom_link text,
  status text DEFAULT 'PENDING',
  is_free boolean DEFAULT false,
  entry_cost integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. session_attendees 테이블 (공유회 신청자 — 나중에 사용)
CREATE TABLE session_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id),
  member_id uuid NOT NULL REFERENCES members(id),
  status text DEFAULT 'REGISTERED',
  registered_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  transaction_id uuid REFERENCES shell_transactions(id),
  UNIQUE(session_id, member_id)
);

-- 6. sns_verifications 테이블 (나중에 사용)
CREATE TABLE sns_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id),
  sns_url text NOT NULL,
  platform text NOT NULL,
  status text DEFAULT 'PENDING',
  reviewed_by uuid REFERENCES members(id),
  reviewed_at timestamptz,
  transaction_id uuid REFERENCES shell_transactions(id),
  created_at timestamptz DEFAULT now()
);

-- 6-1. videos / video_grants (영상 시청 기능)
CREATE TABLE videos (
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

CREATE INDEX idx_videos_expires ON videos(expires_at);

CREATE TABLE video_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id),
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES members(id),
  transaction_id uuid REFERENCES shell_transactions(id),
  UNIQUE(video_id, member_id)
);

CREATE INDEX idx_video_grants_member ON video_grants(member_id);
CREATE INDEX idx_video_grants_video ON video_grants(video_id);

-- 7. shell_balance 증감 RPC 함수
CREATE OR REPLACE FUNCTION increment_shell_balance(p_member_id uuid, p_amount integer)
RETURNS void AS $$
BEGIN
  UPDATE members
  SET shell_balance = shell_balance + p_amount,
      updated_at = now()
  WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql;

-- 8. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. RLS 비활성화 (service_role_key로만 접근하므로)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shell_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_grants ENABLE ROW LEVEL SECURITY;

-- service_role은 RLS를 자동 bypass하므로 별도 정책 불필요
