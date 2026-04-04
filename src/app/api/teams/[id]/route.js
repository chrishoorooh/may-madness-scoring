import { NextResponse } from 'next/server';
import { getTeamById, updateTeam, getPlayerById, getPlayers } from '@/lib/data-utils';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const team = await getTeamById(id);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    const players = await getPlayers();
    const enrichedTeam = {
      ...team,
      players: team.playerIds.map(playerId => {
        const player = players.find(p => p.id === playerId);
        if (!player) return null;
        const { pin, ...playerData } = player;
        return playerData;
      }).filter(Boolean)
    };
    
    return NextResponse.json(enrichedTeam);
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json({ error: 'Failed to get team' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const playerId = cookieStore.get('playerId')?.value;
    
    // Check if user is admin
    const player = await getPlayerById(playerId);
    if (!player?.isAdmin) {
      return NextResponse.json({ error: 'Only admins can update teams' }, { status: 403 });
    }
    
    const updates = await request.json();
    
    // Validate player IDs if provided
    if (updates.playerIds) {
      for (const pid of updates.playerIds) {
        const playerExists = await getPlayerById(pid);
        if (!playerExists) {
          return NextResponse.json({ error: `Invalid player ID: ${pid}` }, { status: 400 });
        }
      }
    }
    
    const updated = await updateTeam(id, updates);
    
    if (!updated) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}
