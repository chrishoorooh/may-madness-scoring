import { NextResponse } from 'next/server';
import { getScores, getScoresByRound, saveScore, getPlayerById, getRoundById, getCourseTee, readCsvFile } from '@/lib/data-utils';
import { calculateCourseHandicap, distributeStrokes, parseCourseCSV } from '@/lib/golf-utils';
import { cookies } from 'next/headers';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('roundId');
    
    if (roundId) {
      const scores = await getScoresByRound(roundId);
      return NextResponse.json(scores);
    }
    
    const scores = await getScores();
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Get scores error:', error);
    return NextResponse.json({ error: 'Failed to get scores' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionPlayerId = cookieStore.get('playerId')?.value;
    
    if (!sessionPlayerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await request.json();
    const { roundId, holes, targetPlayerId } = body;
    
    if (!roundId) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }

    const sessionPlayer = await getPlayerById(sessionPlayerId);
    let scorePlayerId = sessionPlayerId;

    if (targetPlayerId != null && targetPlayerId !== '') {
      if (targetPlayerId !== sessionPlayerId && !sessionPlayer?.isAdmin) {
        return NextResponse.json({ error: 'Only admins can enter scores for other players' }, { status: 403 });
      }
      scorePlayerId = targetPlayerId;
    }
    
    // Get player (whose scorecard we save) and round info
    const player = await getPlayerById(scorePlayerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const round = await getRoundById(roundId);
    
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    if (!round.courseId || !round.teeId) {
      return NextResponse.json({ error: 'Round course/tee not configured' }, { status: 400 });
    }
    
    // Get course data for handicap calculation
    const tee = await getCourseTee(round.courseId, round.teeId);
    const csvContent = readCsvFile(tee.dataFile);
    const courseHoles = parseCourseCSV(csvContent);
    
    // Calculate course handicap and strokes
    const courseHandicap = calculateCourseHandicap(
      player.handicapIndex,
      tee.slopeRating,
      tee.courseRating,
      tee.par
    );
    
    const holeHandicaps = courseHoles.map(h => h.handicap);
    const strokes = distributeStrokes(courseHandicap, holeHandicaps);
    
    // Build score data
    const scoreData = {
      playerId: scorePlayerId,
      roundId,
      courseHandicap,
      strokes,
      holes: holes || new Array(18).fill(null),
      updatedAt: new Date().toISOString()
    };
    
    const saved = await saveScore(scoreData);
    
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Save score error:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}
