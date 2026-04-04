/**
 * Client-safe golf scoring utilities for May Madness
 * These functions can be used in both client and server components
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

