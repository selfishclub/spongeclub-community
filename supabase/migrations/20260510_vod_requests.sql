-- VOD 구매 신청 마이그레이션
-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS vod_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id),
  status text NOT NULL DEFAULT 'PENDING',
  resolved_at timestamptz,
  resolved_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_vod_requests_status ON vod_requests(status);
CREATE INDEX IF NOT EXISTS idx_vod_requests_session ON vod_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_vod_requests_member ON vod_requests(member_id);

ALTER TABLE vod_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE vod_requests IS 'VOD 구매 신청 (회원 → 어드민). 신청 자체는 무료, 어드민이 video_grants 만들 때 셸 차감';
