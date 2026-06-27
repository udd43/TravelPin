-- TravelPin — Vercel Postgres 초기화 SQL
-- Vercel Dashboard → Storage → Postgres → Query 탭에서 실행

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(8) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pins (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(8) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(20),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  photo_url TEXT NOT NULL,
  comment VARCHAR(200),
  created_at BIGINT NOT NULL
);

-- 방별 핀 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_pins_room_id ON pins(room_id);
CREATE INDEX IF NOT EXISTS idx_pins_created_at ON pins(created_at DESC);
