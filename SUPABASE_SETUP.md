# Supabase Setup Guide for Car Guesser Multiplayer

## Overview
Supabase is an open-source Firebase alternative built on PostgreSQL. It provides authentication, database, and real-time capabilities.

**Why Supabase?**
- PostgreSQL database (powerful and familiar)
- Email magic-link authentication
- Real-time database subscriptions
- REST API and WebSocket support
- Free tier is generous

---

## STEP 1: Create a Supabase Account
1. Open: https://supabase.com/
2. Click **"Sign up"** (top right)
3. Sign in with GitHub, Google, or email (any works for your Supabase account)
4. Create an organization/account

---

## STEP 2: Create a New Project
1. Click **"New Project"**
2. Project name: **"car-guesser"**
3. Database password: **Create a strong password** (save it!)
4. Region: Select closest to you (e.g., **us-east-1**)
5. Click **"Create new project"**
6. Wait for initialization (2-3 minutes)

---

## STEP 3: Get Your Supabase API Keys
1. Go to **Settings → API**
2. You'll see:
   - **Project URL** (your-project.supabase.co)
   - **anon key** (for client-side)
   - **service_role key** (for server-side, keep secret!)

3. Copy these two:
   ```
   SUPABASE_URL: https://your-project.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## STEP 4: Configure Email Authentication
1. Go to **Authentication → Providers**
2. Click **"Email"**
3. Ensure **"Enable Email provider"** is ON
4. Set **"Confirm email"** based on your preference:
   - ON for safer production auth (recommended)
   - OFF for fast local testing
5. Click **"Save"**

---

## STEP 5: Create Database Tables
Go to **SQL Editor** and run these queries:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  photo_url TEXT,
  high_score INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Game Scores Table
```sql
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  score INTEGER,
  cars_guessed INTEGER,
  game_type VARCHAR(50), -- 'single' or 'multiplayer'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Multiplayer Games Table
```sql
CREATE TABLE multiplayer_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code VARCHAR(10) UNIQUE,
  player_1_id UUID REFERENCES users(id),
  player_2_id UUID REFERENCES users(id),
  player_1_score INTEGER DEFAULT 0,
  player_2_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
  winner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);
```

---

## STEP 6: Set Row Level Security (RLS)

Enable RLS for security:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Enable RLS on game_scores
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own scores
CREATE POLICY "Users can insert own scores"
  ON game_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view all scores
CREATE POLICY "Users can view all scores"
  ON game_scores FOR SELECT
  USING (true);

-- Enable RLS on multiplayer_games
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;

-- Allow players to view their games
CREATE POLICY "Players can view their games"
  ON multiplayer_games FOR SELECT
  USING (auth.uid() = player_1_id OR auth.uid() = player_2_id);

-- Allow players to update their games
CREATE POLICY "Players can update their games"
  ON multiplayer_games FOR UPDATE
  USING (auth.uid() = player_1_id OR auth.uid() = player_2_id);
```

---

## STEP 7: Add localhost to Allowed Hosts
1. Go to **Authentication → URL Configuration**
2. Add to "Redirect URLs":
   - `http://localhost:8000`
   - `http://127.0.0.1:8000`
   - `https://ksorensen29-pixel.github.io/Car-Guesser/dashboard.html` (GitHub Pages)
   - `https://<your-codespace>-8000.app.github.dev/dashboard.html` (Codespaces)

---

## STEP 8: Create a .env or config file

Create a file at `/supabase-config.js`:

```javascript
export const supabaseConfig = {
  url: "https://your-project.supabase.co",
  anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  // Don't expose service_role_key on client!
};
```

**Replace with YOUR actual values from Step 3**

---

## ✅ You're Done with Supabase Setup!

**Your Supabase Stack is Ready:**
- ✅ PostgreSQL Database
- ✅ User Authentication
- ✅ Real-time Database
- ✅ Row Level Security
- ✅ Tables for users, scores, and multiplayer games

---

## What We'll Build Next

1. **Login Page** - Email magic-link sign-in with Supabase Auth
2. **Dashboard** - Leaderboard + user profile
3. **Multiplayer Mode** - Real-time competitive games
4. **Score Tracking** - Store all game results in database

---

## Troubleshooting

**"Authentication failed"**
- Check your anon key is correct
- Verify localhost is in allowed URLs

**"Can't connect to database"**
- Check your project URL
- Verify network is working

**"Magic link email not arriving"**
- Check spam/junk folder
- Verify email provider is enabled in Supabase Authentication settings

---

**Ready?** Provide your Supabase credentials and I'll build the multiplayer features! 🚀

Format:
```
SUPABASE_URL: your-url-here
SUPABASE_ANON_KEY: your-key-here
```
