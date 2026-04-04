import { NextResponse } from 'next/server';
import { getTeams, getPlayers, getRounds, getScores, getCourseTee, readCsvFile } from '@/lib/data-utils';
import { parseCourseCSV, calculateNetScore, getBestNetScore, scoreRelativeToPar, formatScoreRelativeToPar } from '@/lib/golf-utils';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const teams = await getTeams();
    const players = await getPlayers();
    const rounds = await getRounds();
    const allScores = await getScores();
    
    // Build leaderboard data for each team
    const leaderboard = await Promise.all(teams.map(async (team) => {
      const teamPlayers = team.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean);
      
      let totalRelativeToPar = 0;
      let holesCompleted = 0;
      const roundScores = [];
      
      // Calculate score for each round
      for (const round of rounds) {
        if (!round.courseId || !round.teeId) {
          roundScores.push({ roundId: round.id, roundName: round.name, score: null, holesCompleted: 0 });
          continue;
        }
        
        // Get course hole data
        let courseHoles;
        try {
          const tee = await getCourseTee(round.courseId, round.teeId);
          const csvContent = readCsvFile(tee.dataFile);
          courseHoles = parseCourseCSV(csvContent);
        } catch (e) {
          roundScores.push({ roundId: round.id, roundName: round.name, score: null, holesCompleted: 0 });
          continue;
        }
        
        // Get scores for both players in this round
        const player1Score = allScores.find(s => s.playerId === team.playerIds[0] && s.roundId === round.id);
        const player2Score = allScores.find(s => s.playerId === team.playerIds[1] && s.roundId === round.id);
        
        let roundRelativeToPar = 0;
        let roundHolesCompleted = 0;
        
        // Calculate best net for each hole
        for (let hole = 0; hole < 18; hole++) {
          const p1Gross = player1Score?.holes?.[hole];
          const p2Gross = player2Score?.holes?.[hole];
          
          const p1Net = p1Gross != null ? calculateNetScore(p1Gross, player1Score.strokes[hole]) : null;
          const p2Net = p2Gross != null ? calculateNetScore(p2Gross, player2Score?.strokes?.[hole] || 0) : null;
          
          const bestNet = getBestNetScore(p1Net, p2Net);
          
          if (bestNet != null) {
            const holePar = courseHoles[hole].par;
            roundRelativeToPar += scoreRelativeToPar(bestNet, holePar);
            roundHolesCompleted++;
          }
        }
        
        totalRelativeToPar += roundRelativeToPar;
        holesCompleted += roundHolesCompleted;
        
        roundScores.push({
          roundId: round.id,
          roundName: round.name,
          score: roundHolesCompleted > 0 ? roundRelativeToPar : null,
          scoreFormatted: roundHolesCompleted > 0 ? formatScoreRelativeToPar(roundRelativeToPar) : '-',
          holesCompleted: roundHolesCompleted
        });
      }
      
      return {
        teamId: team.id,
        teamName: team.name,
        players: teamPlayers.map(p => ({ id: p.id, name: p.name, handicapIndex: p.handicapIndex })),
        totalScore: holesCompleted > 0 ? totalRelativeToPar : null,
        totalScoreFormatted: holesCompleted > 0 ? formatScoreRelativeToPar(totalRelativeToPar) : '-',
        holesCompleted,
        roundScores
      };
    }));
    
    // Sort by total score (lowest first), with null scores at the end
    leaderboard.sort((a, b) => {
      if (a.totalScore === null && b.totalScore === null) return 0;
      if (a.totalScore === null) return 1;
      if (b.totalScore === null) return -1;
      return a.totalScore - b.totalScore;
    });
    
    // Add position
    leaderboard.forEach((team, index) => {
      team.position = index + 1;
    });
    
    return NextResponse.json({
      leaderboard,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
  }
}
