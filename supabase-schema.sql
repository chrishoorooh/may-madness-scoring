-- =============================================
-- May Madness Scoring - Supabase Schema
-- =============================================
-- Run this in Supabase SQL Editor to create all tables

-- Players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  handicap_index NUMERIC(4,1) NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team players junction table (many-to-many)
CREATE TABLE team_players (
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, player_id)
);

-- Courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course tees table
CREATE TABLE course_tees (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  slope_rating INTEGER NOT NULL,
  course_rating NUMERIC(4,1) NOT NULL,
  par INTEGER NOT NULL DEFAULT 72,
  data_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds table
CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  course_id TEXT REFERENCES courses(id),
  tee_id TEXT REFERENCES course_tees(id),
  date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  round_id TEXT REFERENCES rounds(id) ON DELETE CASCADE,
  course_handicap INTEGER NOT NULL DEFAULT 0,
  strokes INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  holes INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, round_id)
);

-- =============================================
-- Indexes for better query performance
-- =============================================
CREATE INDEX idx_team_players_player ON team_players(player_id);
CREATE INDEX idx_team_players_team ON team_players(team_id);
CREATE INDEX idx_course_tees_course ON course_tees(course_id);
CREATE INDEX idx_rounds_course ON rounds(course_id);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_scores_round ON scores(round_id);
CREATE INDEX idx_scores_player ON scores(player_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================
-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables (adjust as needed)
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON team_players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON course_tees FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON rounds FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON scores FOR SELECT USING (true);

-- Allow public insert/update for scores (players can submit their own scores)
CREATE POLICY "Allow public insert scores" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update scores" ON scores FOR UPDATE USING (true);

-- Allow public updates to players (for handicap updates, etc)
CREATE POLICY "Allow public update players" ON players FOR UPDATE USING (true);

-- Allow public updates to rounds (for status changes)
CREATE POLICY "Allow public update rounds" ON rounds FOR UPDATE USING (true);




