import { NextResponse } from 'next/server';
import { getPlayerById } from '@/lib/data-utils';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const playerId = cookieStore.get('playerId')?.value;
    
    if (!playerId) {
      return NextResponse.json({ player: null });
    }
    
    const player = await getPlayerById(playerId);
    
    if (!player) {
      return NextResponse.json({ player: null });
    }
    
    // Return player info (without PIN)
    const { pin: _, ...playerData } = player;
    return NextResponse.json({ player: playerData });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
