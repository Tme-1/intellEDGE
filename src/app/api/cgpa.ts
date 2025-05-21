import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const gradeToPoint: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

function calculateCgpa(courses: { grade: string; creditUnit: number }[]): number {
  let totalPoints = 0;
  let totalUnits = 0;
  for (const course of courses) {
    const point = gradeToPoint[course.grade.toUpperCase()] ?? 0;
    totalPoints += point * course.creditUnit;
    totalUnits += course.creditUnit;
  }
  return totalUnits === 0 ? 0 : parseFloat((totalPoints / totalUnits).toFixed(2));
}

export async function GET(req: NextRequest) {
  try {
    // Skip auth check during build time
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      return NextResponse.json({ courses: [], cgpa: 0 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { courses: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      courses: user.courses || [], 
      cgpa: user.cgpa || 0 
    });
  } catch (error) {
    console.error('Error fetching CGPA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Skip auth check during build time
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      return NextResponse.json({ message: 'CGPA updated', cgpa: 0 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { courses } = await req.json();
    if (!Array.isArray(courses)) {
      return NextResponse.json({ error: 'Courses must be an array' }, { status: 400 });
    }

    const cgpa = calculateCgpa(courses);

    const user = await prisma.user.update({
      where: { email: payload.email },
      data: {
        courses: {
          deleteMany: {},
          create: courses.map(course => ({
            grade: course.grade,
            creditUnit: course.creditUnit,
            courseTitle: course.courseTitle,
            courseCode: course.courseCode
          }))
        },
        cgpa
      },
      include: { courses: true }
    });

    return NextResponse.json({ message: 'CGPA updated', cgpa: user.cgpa });
  } catch (error) {
    console.error('Error updating CGPA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 