import { NextResponse } from 'next/server';
import { getPlayerById } from '@/lib/data-utils';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store, must-revalidate' };

export async function GET() {
  try {
    const cookieStore = await cookies();
    const playerId = cookieStore.get('playerId')?.value;
    
    if (!playerId) {
      return NextResponse.json({ player: null }, { headers: noStore });
    }
    
    const player = await getPlayerById(playerId);
    
    if (!player) {
      return NextResponse.json({ player: null }, { headers: noStore });
    }
    
    // Return player info (without PIN)
    const { pin: _, ...playerData } = player;
    return NextResponse.json({ player: playerData }, { headers: noStore });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500, headers: noStore });
  }
}
