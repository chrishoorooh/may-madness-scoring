import { NextResponse } from 'next/server';
import { getPlayers, getTeamByPlayerId } from '@/lib/data-utils';

export async function GET() {
  try {
    const players = await getPlayers();
    
    // Return players without PINs, with team info
    const playersWithTeams = await Promise.all(players.map(async (player) => {
      const { pin, ...playerData } = player;
      const team = await getTeamByPlayerId(player.id);
      return {
        ...playerData,
        teamId: team?.id || null,
        teamName: team?.name || null
      };
    }));
    
    return NextResponse.json(playersWithTeams);
  } catch (error) {
    console.error('Get players error:', error);
    return NextResponse.json({ error: 'Failed to get players' }, { status: 500 });
  }
}
