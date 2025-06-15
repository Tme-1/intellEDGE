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

function calculateCgpa(entries: { gpa: number }[]): number {
  if (!entries.length) return 0;
  const totalGpa = entries.reduce((sum, entry) => sum + Number(entry.gpa), 0);
  return parseFloat((totalGpa / entries.length).toFixed(2));
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

    const user = await prisma.users.findFirst({
      where: { email: payload.email }
    });

    let courses: any[] = [];
    let cgpa = 0;
    if (user) {
      courses = await prisma.gpa_entries.findMany({
        where: { user_id: user.id }
      });
      cgpa = calculateCgpa(courses);
    }

    return NextResponse.json({ 
      courses, 
      cgpa
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

    const { entries } = await req.json(); // expects array of { semester, gpa }
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Entries must be an array' }, { status: 400 });
    }

    // Find the user by email to get their id
    const user = await prisma.users.findFirst({
      where: { email: payload.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove old entries and add new ones
    await prisma.gpa_entries.deleteMany({ where: { user_id: user.id } });
    await prisma.gpa_entries.createMany({
      data: entries.map((entry: any) => ({
        user_id: user.id,
        gpa: entry.gpa,
        semester: entry.semester
      }))
    });

    const cgpa = calculateCgpa(entries);

    return NextResponse.json({ message: 'CGPA updated', cgpa });
  } catch (error) {
    console.error('Error updating CGPA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 