-- 공유회 추천 테이블
CREATE TABLE session_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggester_name text NOT NULL,
  target_name text NOT NULL,
  topic text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_session_suggestions_status ON session_suggestions(status);
