-- =============================================
-- May Madness Scoring - Seed Data
-- =============================================
-- Run this AFTER the schema to populate initial data

-- Insert Players
INSERT INTO players (id, name, pin, handicap_index, is_admin) VALUES
  ('player-1', 'Chris Cruz', '1111', 9.5, TRUE),
  ('player-2', 'Bob Grice', '2222', 9.9, FALSE),
  ('player-3', 'Ty Katsos', '3333', 11, FALSE),
  ('player-4', 'Nick Ward', '4444', 18, FALSE),
  ('player-5', 'Jon Starek', '5555', 18.8, FALSE),
  ('player-6', 'Brett Erwin', '6666', 5.7, FALSE),
  ('player-7', 'Chad Bergman', '7777', 16.5, FALSE),
  ('player-8', 'Larry Duncan', '8888', 18, FALSE);

-- Insert Teams
INSERT INTO teams (id, name) VALUES
  ('team-1', 'Terps'),
  ('team-2', 'Buffs'),
  ('team-3', 'Rams'),
  ('team-4', 'JayCats');

-- Insert Team Players (junction table)
INSERT INTO team_players (team_id, player_id) VALUES
  ('team-1', 'player-1'),
  ('team-1', 'player-2'),
  ('team-2', 'player-3'),
  ('team-2', 'player-4'),
  ('team-3', 'player-5'),
  ('team-3', 'player-6'),
  ('team-4', 'player-7'),
  ('team-4', 'player-8');

-- Insert Courses
INSERT INTO courses (id, name, location) VALUES
  ('black-desert', 'Black Desert Golf Course', 'St. George, Utah'),
  ('the-ledges', 'The Ledges Golf Course', 'St. George, Utah'),
  ('copper-rock', 'Copper Rock Golf Course', 'Hurricane, Utah'),
  ('sunbrook', 'Sunbrook Golf Club - The Pointe & Woodbridge', 'St. George, Utah');

-- Insert Course Tees
INSERT INTO course_tees (id, course_id, name, color, slope_rating, course_rating, par, data_file) VALUES
  -- Black Desert
  ('black-desert-black', 'black-desert', 'Black Desert (Black)', 'black', 134, 73.3, 72, 'course-info/black-desert-black-desert-black-tee.csv'),
  ('weiskopf-blue', 'black-desert', 'Weiskopf (Blue)', 'blue', 128, 71.2, 72, 'course-info/black-desert-weiskoph-blue-tee.csv'),
  -- The Ledges
  ('the-ledges-blue', 'the-ledges', 'Blue', 'blue', 123, 71.3, 72, 'course-info/the-ledges-blue-tee .csv'),
  ('the-ledges-white', 'the-ledges', 'White', 'white', 119, 69.3, 72, 'course-info/the-ledges-white-tee.csv'),
  -- Copper Rock
  ('copper-rock-black', 'copper-rock', 'Black', 'black', 141, 73.1, 72, 'course-info/copper-rock-golf-course-black-tee .csv'),
  ('copper-rock-gold', 'copper-rock', 'Gold', 'gold', 138, 70.6, 72, 'course-info/copper-rock-golf-course-gold-tee .csv'),
  -- Sunbrook
  ('sunbrook-black', 'sunbrook', 'Black', 'black', 133, 73.9, 72, 'course-info/sunbrook-golf-club-the-pointe-and-woodbridge-black-tee.csv'),
  ('sunbrook-gold', 'sunbrook', 'Gold', 'gold', 129, 71.9, 72, 'course-info/sunbrook-golf-club-the-pointe-and-woodbridge-gold-tee .csv');

-- Insert Rounds
-- Note: tee_id must match course_tees.id (globally unique compound IDs)
INSERT INTO rounds (id, name, course_id, tee_id, date, status) VALUES
  ('round-1', 'Round 1', 'the-ledges', 'the-ledges-blue', NULL, 'upcoming'),
  ('round-2', 'Round 2', 'black-desert', 'weiskopf-blue', NULL, 'upcoming'),
  ('round-3', 'Round 3', 'copper-rock', 'copper-rock-black', NULL, 'upcoming');

-- Insert existing scores (if any)
-- Note: PostgreSQL arrays use {} syntax
INSERT INTO scores (player_id, round_id, course_handicap, strokes, holes, updated_at) VALUES
  ('player-1', 'round-1', 10, 
   ARRAY[0,0,1,1,0,1,1,0,1,0,1,0,0,0,1,1,1,1], 
   ARRAY[4,3,6,5,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL]::INTEGER[], 
   '2025-12-05T05:42:58.617Z'),
  ('player-2', 'round-1', 10, 
   ARRAY[0,0,1,1,0,1,1,0,1,0,1,0,0,0,1,1,1,1], 
   ARRAY[4,3,6,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL]::INTEGER[], 
   '2025-12-05T05:01:13.504Z'),
  ('player-3', 'round-1', 11, 
   ARRAY[1,0,1,1,0,1,1,0,1,0,1,0,0,0,1,1,1,1], 
   ARRAY[4,3,6,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL]::INTEGER[], 
   '2025-12-05T05:36:33.461Z');

