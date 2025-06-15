import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Helper function to get user from token
async function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('Error getting user from token:', error);
      return null;
    }
    return { user, supabase };
  } catch (error) {
    console.error('Error in getUserFromToken:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const result = await getUserFromToken(request);
    if (!result) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = result;
    
    // Fetch user's CGPA data from the database
    const cgpaData = await prisma.cGPA.findFirst({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!cgpaData) {
      return NextResponse.json({ courses: [], cgpa: 0 });
    }

    return NextResponse.json({
      courses: cgpaData.courses,
      cgpa: cgpaData.cgpa
    });
  } catch (error) {
    console.error('Error fetching CGPA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await getUserFromToken(request);
    if (!result) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = result;
    const body = await request.json();
    const { courses } = body;

    if (!Array.isArray(courses)) {
      return NextResponse.json({ error: 'Invalid courses data' }, { status: 400 });
    }

    // Calculate CGPA
    let totalPoints = 0;
    let totalUnits = 0;
    const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

    courses.forEach(course => {
      const points = gradePoints[course.grade as keyof typeof gradePoints] * course.creditUnit;
      totalPoints += points;
      totalUnits += course.creditUnit;
    });

    const cgpa = totalUnits === 0 ? 0 : parseFloat((totalPoints / totalUnits).toFixed(2));

    // Save to database
    const cgpaData = await prisma.cGPA.create({
      data: {
        userId: user.id,
        courses: courses,
        cgpa: cgpa
      }
    });

    return NextResponse.json({
      message: 'CGPA saved successfully',
      cgpa: cgpaData.cgpa
    });
  } catch (error) {
    console.error('Error saving CGPA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 