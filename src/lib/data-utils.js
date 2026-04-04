import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src/data');

/**
 * Read CSV file content (still from filesystem - these are static)
 */
export function readCsvFile(relativePath) {
  const filePath = path.join(dataDir, relativePath);
  return fs.readFileSync(filePath, 'utf8');
}

// =============================================
// Players
// =============================================
export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  // Transform to match existing API (camelCase)
  return data.map(p => ({
    id: p.id,
    name: p.name,
    pin: p.pin,
    handicapIndex: p.handicap_index,
    isAdmin: p.is_admin
  }));
}

export async function getPlayerById(id) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    pin: data.pin,
    handicapIndex: data.handicap_index,
    isAdmin: data.is_admin
  };
}

export async function getPlayerByPin(pin) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('pin', pin)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    pin: data.pin,
    handicapIndex: data.handicap_index,
    isAdmin: data.is_admin
  };
}

export async function updatePlayer(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.pin !== undefined) dbUpdates.pin = updates.pin;
  if (updates.handicapIndex !== undefined) dbUpdates.handicap_index = updates.handicapIndex;
  if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;
  
  const { data, error } = await supabase
    .from('players')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    pin: data.pin,
    handicapIndex: data.handicap_index,
    isAdmin: data.is_admin
  };
}

// =============================================
// Teams
// =============================================
export async function getTeams() {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('name');
  
  if (teamsError) throw teamsError;
  
  // Get all team_players relationships
  const { data: teamPlayers, error: tpError } = await supabase
    .from('team_players')
    .select('*');
  
  if (tpError) throw tpError;
  
  // Transform to match existing API structure
  return teams.map(t => ({
    id: t.id,
    name: t.name,
    playerIds: teamPlayers
      .filter(tp => tp.team_id === t.id)
      .map(tp => tp.player_id)
  }));
}

export async function getTeamById(id) {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();
  
  if (teamError && teamError.code !== 'PGRST116') throw teamError;
  if (!team) return null;
  
  const { data: teamPlayers, error: tpError } = await supabase
    .from('team_players')
    .select('player_id')
    .eq('team_id', id);
  
  if (tpError) throw tpError;
  
  return {
    id: team.id,
    name: team.name,
    playerIds: teamPlayers.map(tp => tp.player_id)
  };
}

export async function getTeamByPlayerId(playerId) {
  const { data: teamPlayer, error: tpError } = await supabase
    .from('team_players')
    .select('team_id')
    .eq('player_id', playerId)
    .single();
  
  if (tpError && tpError.code !== 'PGRST116') throw tpError;
  if (!teamPlayer) return null;
  
  return await getTeamById(teamPlayer.team_id);
}

export async function updateTeam(id, updates) {
  const { data, error } = await supabase
    .from('teams')
    .update({ name: updates.name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  // If playerIds are being updated, handle the junction table
  if (updates.playerIds) {
    // Delete existing relationships
    await supabase
      .from('team_players')
      .delete()
      .eq('team_id', id);
    
    // Insert new relationships
    if (updates.playerIds.length > 0) {
      await supabase
        .from('team_players')
        .insert(updates.playerIds.map(playerId => ({
          team_id: id,
          player_id: playerId
        })));
    }
  }
  
  return await getTeamById(id);
}

// =============================================
// Courses
// =============================================
export async function getCourses() {
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .order('name');
  
  if (coursesError) throw coursesError;
  
  const { data: tees, error: teesError } = await supabase
    .from('course_tees')
    .select('*');
  
  if (teesError) throw teesError;
  
  // Transform to match existing nested structure
  return courses.map(c => ({
    id: c.id,
    name: c.name,
    location: c.location,
    tees: tees
      .filter(t => t.course_id === c.id)
      .map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        slopeRating: t.slope_rating,
        courseRating: t.course_rating,
        par: t.par,
        dataFile: t.data_file
      }))
  }));
}

export async function getCourseById(id) {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (courseError && courseError.code !== 'PGRST116') throw courseError;
  if (!course) return null;
  
  const { data: tees, error: teesError } = await supabase
    .from('course_tees')
    .select('*')
    .eq('course_id', id);
  
  if (teesError) throw teesError;
  
  return {
    id: course.id,
    name: course.name,
    location: course.location,
    tees: tees.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
      slopeRating: t.slope_rating,
      courseRating: t.course_rating,
      par: t.par,
      dataFile: t.data_file
    }))
  };
}

export async function getCourseTee(courseId, teeId) {
  const { data: tee, error } = await supabase
    .from('course_tees')
    .select('*')
    .eq('course_id', courseId)
    .eq('id', teeId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!tee) return null;
  
  return {
    id: tee.id,
    name: tee.name,
    color: tee.color,
    slopeRating: tee.slope_rating,
    courseRating: tee.course_rating,
    par: tee.par,
    dataFile: tee.data_file
  };
}

// =============================================
// Rounds
// =============================================
export async function getRounds() {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  return data.map(r => ({
    id: r.id,
    name: r.name,
    courseId: r.course_id,
    teeId: r.tee_id,
    date: r.date,
    status: r.status
  }));
}

export async function getRoundById(id) {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    courseId: data.course_id,
    teeId: data.tee_id,
    date: data.date,
    status: data.status
  };
}

export async function updateRound(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.courseId !== undefined) dbUpdates.course_id = updates.courseId;
  if (updates.teeId !== undefined) dbUpdates.tee_id = updates.teeId;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  
  const { data, error } = await supabase
    .from('rounds')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    courseId: data.course_id,
    teeId: data.tee_id,
    date: data.date,
    status: data.status
  };
}

// =============================================
// Scores
// =============================================
export async function getScores() {
  const { data, error } = await supabase
    .from('scores')
    .select('*');
  
  if (error) throw error;
  
  return data.map(s => ({
    playerId: s.player_id,
    roundId: s.round_id,
    courseHandicap: s.course_handicap,
    strokes: s.strokes,
    holes: s.holes,
    updatedAt: s.updated_at
  }));
}

export async function getScoresByRound(roundId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('round_id', roundId);
  
  if (error) throw error;
  
  return data.map(s => ({
    playerId: s.player_id,
    roundId: s.round_id,
    courseHandicap: s.course_handicap,
    strokes: s.strokes,
    holes: s.holes,
    updatedAt: s.updated_at
  }));
}

export async function getScoresByPlayer(playerId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('player_id', playerId);
  
  if (error) throw error;
  
  return data.map(s => ({
    playerId: s.player_id,
    roundId: s.round_id,
    courseHandicap: s.course_handicap,
    strokes: s.strokes,
    holes: s.holes,
    updatedAt: s.updated_at
  }));
}

export async function getScoreByPlayerAndRound(playerId, roundId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('player_id', playerId)
    .eq('round_id', roundId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  
  return {
    playerId: data.player_id,
    roundId: data.round_id,
    courseHandicap: data.course_handicap,
    strokes: data.strokes,
    holes: data.holes,
    updatedAt: data.updated_at
  };
}

export async function saveScore(scoreData) {
  const dbData = {
    player_id: scoreData.playerId,
    round_id: scoreData.roundId,
    course_handicap: scoreData.courseHandicap,
    strokes: scoreData.strokes,
    holes: scoreData.holes,
    updated_at: new Date().toISOString()
  };
  
  // Upsert - insert or update based on primary key
  const { data, error } = await supabase
    .from('scores')
    .upsert(dbData, { onConflict: 'player_id,round_id' })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    playerId: data.player_id,
    roundId: data.round_id,
    courseHandicap: data.course_handicap,
    strokes: data.strokes,
    holes: data.holes,
    updatedAt: data.updated_at
  };
}
