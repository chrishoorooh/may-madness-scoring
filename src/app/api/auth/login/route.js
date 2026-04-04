import { NextResponse } from 'next/server';
import { getPlayerByPin } from '@/lib/data-utils';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { pin } = await request.json();
    
    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }
    
    const player = await getPlayerByPin(pin);
    
    if (!player) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }
    
    // Set a session cookie with player ID
    const cookieStore = await cookies();
    cookieStore.set('playerId', player.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Return player info (without PIN)
    const { pin: _, ...playerData } = player;
    return NextResponse.json({ player: playerData });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
