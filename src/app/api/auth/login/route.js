import { NextResponse } from 'next/server';
import { getPlayerByPin } from '@/lib/data-utils';
import { sessionCookieSecureFromRequest } from '@/lib/sessionCookieSecure';
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
    
    // Return player info (without PIN). Set cookie on the response object so Set-Cookie is
    // reliably applied (Safari + Next route handlers can miss cookies().set alone).
    const { pin: _, ...playerData } = player;
    const res = NextResponse.json({ player: playerData });
    res.cookies.set("playerId", player.id, {
      httpOnly: true,
      secure: sessionCookieSecureFromRequest(request),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
