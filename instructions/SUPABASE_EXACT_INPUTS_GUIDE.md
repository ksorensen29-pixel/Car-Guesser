# Supabase Exact Inputs Guide (Car Guesser)

Use this as a copy/paste checklist for everything you need to enter in Supabase.

## 1) Supabase Project API values

In **Settings → API**, confirm these match:

```text
Project URL: https://qauvcttdkbdpnhpcjdog.supabase.co
Anon/Public Key: sb_publishable_BAliVVfUjkf3zZarqfRTPA_eSRTnEFk
```

---

## 2) Authentication settings

### A) Enable email magic links
Go to **Authentication → Providers → Email**:
- Enable **Email** provider = ON
- Keep magic-link sign-in enabled

### B) URL configuration
Go to **Authentication → URL Configuration** and set:

```text
Site URL:
https://ksorensen29-pixel.github.io/Car-Guesser/
```

Add these to **Redirect URLs**:

```text
https://ksorensen29-pixel.github.io/Car-Guesser/dashboard.html
https://refactored-dollop-wr6q6qvrvpxjcwj6-8000.app.github.dev/dashboard.html
http://localhost:8000/dashboard.html
http://127.0.0.1:8000/dashboard.html
```

---

## 3) SQL to run in Supabase SQL Editor

Paste and run this full script:

```sql
-- Tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  photo_url TEXT,
  high_score INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  score INTEGER,
  cars_guessed INTEGER,
  game_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS multiplayer_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code VARCHAR(10) UNIQUE,
  player_1_id UUID REFERENCES users(id),
  player_2_id UUID REFERENCES users(id),
  player_1_score INTEGER DEFAULT 0,
  player_2_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'waiting',
  winner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;

-- Replace old multiplayer update policies safely
DROP POLICY IF EXISTS "Players can update their games" ON multiplayer_games;
DROP POLICY IF EXISTS "Players can update active games" ON multiplayer_games;
DROP POLICY IF EXISTS "Authenticated users can join waiting games" ON multiplayer_games;

-- Users policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can view all profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles"
      ON users FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON users FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON users FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Scores policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_scores'
      AND policyname = 'Users can insert own scores'
  ) THEN
    CREATE POLICY "Users can insert own scores"
      ON game_scores FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_scores'
      AND policyname = 'Users can view all scores'
  ) THEN
    CREATE POLICY "Users can view all scores"
      ON game_scores FOR SELECT
      USING (true);
  END IF;
END $$;

-- Multiplayer policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'multiplayer_games'
      AND policyname = 'Players can view their games'
  ) THEN
    CREATE POLICY "Players can view their games"
      ON multiplayer_games FOR SELECT
      USING (auth.uid() = player_1_id OR auth.uid() = player_2_id);
  END IF;
END $$;

CREATE POLICY "Players can update active games"
  ON multiplayer_games FOR UPDATE
  USING (auth.uid() = player_1_id OR auth.uid() = player_2_id);

CREATE POLICY "Authenticated users can join waiting games"
  ON multiplayer_games FOR UPDATE
  USING (player_2_id IS NULL AND status = 'waiting')
  WITH CHECK (auth.uid() = player_2_id AND status = 'active');
```

---

## 4) Repo file values to keep in sync

In this repo, `supabase-config.js` should stay:

```js
export const supabaseConfig = {
  url: "https://qauvcttdkbdpnhpcjdog.supabase.co",
  anon_key: "sb_publishable_BAliVVfUjkf3zZarqfRTPA_eSRTnEFk"
};
```
