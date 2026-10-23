-- 01_init.sql
-- Run this ONCE in pgAdmin (Query Tool) or: psql "postgresql://jobapp:secret@localhost:5432/jobtracker" -f sql/01_init.sql
-- It creates the tables your app needs. Running it again is safe (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Temporary "seed" user so you can test the API now.
-- In Step 4 (authentication) this becomes real user registration.
-- For now, all jobs you create through the API will belong to this one user.
INSERT INTO users (email, password_hash, full_name)
VALUES ('me@test.local', 'not-a-real-password-will-be-jwt-later', 'Me')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS jobs (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  company       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'applied'
                  CHECK (status IN ('wishlist', 'applied', 'interviewing', 'offer', 'rejected', 'accepted')),
  location      TEXT NOT NULL DEFAULT '',
  salary        TEXT NOT NULL DEFAULT '',
  url           TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speed up the two queries the app will run most:
-- "jobs for THIS user" and "jobs for this user sorted by date".
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs (user_id);
