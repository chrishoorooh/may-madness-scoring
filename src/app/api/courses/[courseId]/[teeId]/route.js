import { NextResponse } from 'next/server';
import { getCourseById, getCourseTee, readCsvFile } from '@/lib/data-utils';
import { parseCourseCSV } from '@/lib/golf-utils';

export async function GET(request, { params }) {
  try {
    const { courseId, teeId } = await params;
    
    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    const tee = await getCourseTee(courseId, teeId);
    if (!tee) {
      return NextResponse.json({ error: 'Tee not found' }, { status: 404 });
    }
    
    // Load and parse the CSV data
    const csvContent = readCsvFile(tee.dataFile);
    const holes = parseCourseCSV(csvContent);
    
    return NextResponse.json({
      course: {
        id: course.id,
        name: course.name,
        location: course.location
      },
      tee: {
        id: tee.id,
        name: tee.name,
        color: tee.color,
        slopeRating: tee.slopeRating,
        courseRating: tee.courseRating,
        par: tee.par
      },
      holes
    });
  } catch (error) {
    console.error('Get course tee error:', error);
    return NextResponse.json({ error: 'Failed to get course data' }, { status: 500 });
  }
}
