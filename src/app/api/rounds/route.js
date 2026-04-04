import { NextResponse } from 'next/server';
import { getRounds, getCourseById } from '@/lib/data-utils';

export async function GET() {
  try {
    const rounds = await getRounds();
    
    // Enrich rounds with course/tee info
    const enrichedRounds = await Promise.all(rounds.map(async (round) => {
      let courseInfo = null;
      let teeInfo = null;
      
      if (round.courseId) {
        const course = await getCourseById(round.courseId);
        if (course) {
          courseInfo = {
            id: course.id,
            name: course.name,
            location: course.location
          };
          
          if (round.teeId) {
            const tee = course.tees.find(t => t.id === round.teeId);
            if (tee) {
              teeInfo = {
                id: tee.id,
                name: tee.name,
                color: tee.color,
                par: tee.par
              };
            }
          }
        }
      }
      
      return {
        ...round,
        course: courseInfo,
        tee: teeInfo
      };
    }));
    
    return NextResponse.json(enrichedRounds);
  } catch (error) {
    console.error('Get rounds error:', error);
    return NextResponse.json({ error: 'Failed to get rounds' }, { status: 500 });
  }
}
