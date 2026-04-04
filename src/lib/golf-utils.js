/**
 * Golf scoring utilities for May Madness
 */

/**
 * Calculate course handicap from handicap index and course data
 * Formula: Handicap Index × (Slope Rating / 113) + (Course Rating - Par)
 * Result is rounded to nearest whole number
 */
export function calculateCourseHandicap(handicapIndex, slopeRating, courseRating, par) {
  const courseHandicap = handicapIndex * (slopeRating / 113) + (courseRating - par);
  return Math.round(courseHandicap);
}

/**
 * Distribute handicap strokes to holes based on hole handicap ratings
 * Returns an array of 18 numbers indicating strokes per hole
 * 
 * If course handicap is 12, player gets 1 stroke on holes with handicap 1-12
 * If course handicap is 20, player gets 2 strokes on holes 1-2 and 1 stroke on 3-18
 */
export function distributeStrokes(courseHandicap, holeHandicaps) {
  const strokes = new Array(18).fill(0);
  
  if (courseHandicap <= 0) return strokes;
  
  // First pass: give 1 stroke to holes up to min(courseHandicap, 18)
  const firstPassStrokes = Math.min(courseHandicap, 18);
  for (let i = 0; i < 18; i++) {
    if (holeHandicaps[i] <= firstPassStrokes) {
      strokes[i] = 1;
    }
  }
  
  // Second pass: if handicap > 18, give additional strokes
  if (courseHandicap > 18) {
    const secondPassStrokes = Math.min(courseHandicap - 18, 18);
    for (let i = 0; i < 18; i++) {
      if (holeHandicaps[i] <= secondPassStrokes) {
        strokes[i] += 1;
      }
    }
  }
  
  // Third pass: if handicap > 36, give even more strokes
  if (courseHandicap > 36) {
    const thirdPassStrokes = Math.min(courseHandicap - 36, 18);
    for (let i = 0; i < 18; i++) {
      if (holeHandicaps[i] <= thirdPassStrokes) {
        strokes[i] += 1;
      }
    }
  }
  
  return strokes;
}

/**
 * Calculate net score for a hole
 */
export function calculateNetScore(grossScore, strokesOnHole) {
  return grossScore - strokesOnHole;
}

/**
 * Calculate score relative to par
 * Returns the difference (negative is under par, positive is over)
 */
export function scoreRelativeToPar(score, par) {
  return score - par;
}

/**
 * Format score relative to par for display
 * -2 → "-2"
 * 0 → "E" (Even)
 * +3 → "+3"
 */
export function formatScoreRelativeToPar(relativeScore) {
  if (relativeScore === 0) return "E";
  if (relativeScore > 0) return `+${relativeScore}`;
  return `${relativeScore}`;
}

/**
 * Get the best (lowest) net score between two players for a hole
 */
export function getBestNetScore(player1NetScore, player2NetScore) {
  // Handle cases where a player hasn't entered a score yet (null/undefined)
  if (player1NetScore === null || player1NetScore === undefined) return player2NetScore;
  if (player2NetScore === null || player2NetScore === undefined) return player1NetScore;
  return Math.min(player1NetScore, player2NetScore);
}

/**
 * Calculate team score for a round
 * Takes both players' scores and returns the best net for each hole
 */
export function calculateTeamRoundScore(player1Scores, player2Scores, player1Strokes, player2Strokes, pars) {
  const teamScores = [];
  let totalRelativeToPar = 0;
  
  for (let hole = 0; hole < 18; hole++) {
    const p1Gross = player1Scores[hole];
    const p2Gross = player2Scores[hole];
    
    const p1Net = p1Gross !== null && p1Gross !== undefined 
      ? calculateNetScore(p1Gross, player1Strokes[hole]) 
      : null;
    const p2Net = p2Gross !== null && p2Gross !== undefined 
      ? calculateNetScore(p2Gross, player2Strokes[hole]) 
      : null;
    
    const bestNet = getBestNetScore(p1Net, p2Net);
    
    teamScores.push({
      hole: hole + 1,
      par: pars[hole],
      player1Gross: p1Gross,
      player1Net: p1Net,
      player2Gross: p2Gross,
      player2Net: p2Net,
      bestNet: bestNet,
      relativeToPar: bestNet !== null ? scoreRelativeToPar(bestNet, pars[hole]) : null
    });
    
    if (bestNet !== null) {
      totalRelativeToPar += scoreRelativeToPar(bestNet, pars[hole]);
    }
  }
  
  return {
    holes: teamScores,
    totalRelativeToPar,
    totalFormatted: formatScoreRelativeToPar(totalRelativeToPar)
  };
}

/**
 * Parse course CSV data into structured format
 */
export function parseCourseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const holes = [];
  
  // Parse header row to get hole numbers
  const headers = lines[0].split(',');
  
  // Find the data rows
  let yardages = [];
  let pars = [];
  let handicaps = [];
  
  for (const line of lines.slice(1)) {
    const values = line.split(',');
    const rowType = values[0].toLowerCase();
    
    if (rowType === 'yds' || rowType === 'yards') {
      yardages = values.slice(1);
    } else if (rowType === 'par') {
      pars = values.slice(1);
    } else if (rowType === 'handicap' || rowType === 'hdcp') {
      handicaps = values.slice(1);
    }
  }
  
  // Build hole data for holes 1-18 (skip Out, In, Tot columns)
  for (let i = 0; i < 18; i++) {
    const holeIndex = i < 9 ? i : i + 1; // Skip 'Out' column after hole 9
    holes.push({
      number: i + 1,
      par: parseInt(pars[holeIndex]) || 0,
      yards: parseInt(yardages[holeIndex]) || 0,
      handicap: parseInt(handicaps[holeIndex]) || 0
    });
  }
  
  return holes;
}

