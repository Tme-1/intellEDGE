import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client only if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent activities from different tables
    const [
      { data: downloads, error: downloadsError },
      { data: quizzes, error: quizzesError },
      { data: gpaEntries, error: gpaError }
    ] = await Promise.all([
      supabase
        .from('downloads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('gpa_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (downloadsError || quizzesError || gpaError) {
      return NextResponse.json({ error: 'Error fetching activities' }, { status: 500 });
    }

    // Combine and format activities
    const activities = [
      ...(downloads || []).map(download => ({
        id: download.id,
        type: 'download' as const,
        title: 'Material Downloaded',
        details: download.material_title,
        timestamp: download.created_at
      })),
      ...(quizzes || []).map(quiz => ({
        id: quiz.id,
        type: 'quiz' as const,
        title: 'Quiz Attempted',
        details: `Score: ${quiz.score}%`,
        timestamp: quiz.created_at
      })),
      ...(gpaEntries || []).map(gpa => ({
        id: gpa.id,
        type: 'gpa' as const,
        title: 'GPA Updated',
        details: `New GPA: ${gpa.gpa}`,
        timestamp: gpa.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Get the 10 most recent activities

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error in activities GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 