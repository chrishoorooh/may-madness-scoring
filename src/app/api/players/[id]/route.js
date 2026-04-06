import { NextResponse } from 'next/server';
import { getPlayerById, updatePlayer, getTeamByPlayerId } from '@/lib/data-utils';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const currentPlayerId = cookieStore.get('playerId')?.value;
    if (!currentPlayerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const currentPlayer = await getPlayerById(currentPlayerId);

    if (currentPlayerId !== id && !currentPlayer?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const player = await getPlayerById(id);
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    const { pin, ...playerData } = player;
    const team = await getTeamByPlayerId(id);
    
    return NextResponse.json({
      ...playerData,
      teamId: team?.id || null,
      teamName: team?.name || null
    });
  } catch (error) {
    console.error('Get player error:', error);
    return NextResponse.json({ error: 'Failed to get player' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const currentPlayerId = cookieStore.get('playerId')?.value;
    
    // Get current player to check admin status
    const currentPlayer = await getPlayerById(currentPlayerId);
    const targetPlayer = await getPlayerById(id);
    
    if (!targetPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // Only allow self-update or admin update
    if (currentPlayerId !== id && !currentPlayer?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const updates = await request.json();
    
    // Don't allow changing admin status unless you're an admin
    if ('isAdmin' in updates && !currentPlayer?.isAdmin) {
      delete updates.isAdmin;
    }
    
    const updated = await updatePlayer(id, updates);
    
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
    }
    
    const { pin, ...playerData } = updated;
    return NextResponse.json(playerData);
  } catch (error) {
    console.error('Update player error:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}
