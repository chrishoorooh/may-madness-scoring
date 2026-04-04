import { NextResponse } from 'next/server';
import { getTeams, getPlayers } from '@/lib/data-utils';

export async function GET() {
  try {
    const teams = await getTeams();
    const players = await getPlayers();
    
    // Enrich teams with player info
    const enrichedTeams = teams.map(team => ({
      ...team,
      players: team.playerIds.map(id => {
        const player = players.find(p => p.id === id);
        if (!player) return null;
        const { pin, ...playerData } = player;
        return playerData;
      }).filter(Boolean)
    }));
    
    return NextResponse.json(enrichedTeams);
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ error: 'Failed to get teams' }, { status: 500 });
  }
}
