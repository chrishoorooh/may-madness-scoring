import { NextResponse } from 'next/server';
import { getRoundById, updateRound, getPlayerById, getCourseById } from '@/lib/data-utils';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const round = await getRoundById(id);
    
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    return NextResponse.json(round);
  } catch (error) {
    console.error('Get round error:', error);
    return NextResponse.json({ error: 'Failed to get round' }, { status: 500 });
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
      return NextResponse.json({ error: 'Only admins can update rounds' }, { status: 403 });
    }
    
    const updates = await request.json();
    
    // Validate course/tee if provided
    if (updates.courseId) {
      const course = await getCourseById(updates.courseId);
      if (!course) {
        return NextResponse.json({ error: 'Invalid course' }, { status: 400 });
      }
      
      if (updates.teeId) {
        const tee = course.tees.find(t => t.id === updates.teeId);
        if (!tee) {
          return NextResponse.json({ error: 'Invalid tee for this course' }, { status: 400 });
        }
      }
    }
    
    const updated = await updateRound(id, updates);
    
    if (!updated) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update round error:', error);
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 });
  }
}
