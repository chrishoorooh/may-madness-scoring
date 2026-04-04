import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/data-utils';

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'Failed to get courses' }, { status: 500 });
  }
}
