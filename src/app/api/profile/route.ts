import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with public URL
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
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch profile data from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, matric_number, sex, department, faculty, avatar_url, created_at, updated_at, exam_date')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    const transformedProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      matricNumber: profile.matric_number,
      sex: profile.sex,
      department: profile.department,
      faculty: profile.faculty,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      examDate: profile.exam_date,
    };

    return NextResponse.json({ profile: transformedProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// To handle multipart/form-data, Next.js API routes need their default bodyParser disabled.
// This is usually done via config, but for Route Handlers (app directory), it's handled differently.
// For app router, Next.js should handle FormData parsing directly if no custom config is set.

export async function POST(request: Request) {
  try {
    const result = await getUserFromToken(request);
    if (!result) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, supabase } = result;
    if (!user.id || !user.email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }

    const formData = await request.formData();
    const fullName = formData.get('fullName') as string;
    const matricNumber = formData.get('matricNumber') as string;
    const sex = formData.get('sex') as string;
    const department = formData.get('department') as string;
    const faculty = formData.get('faculty') as string;
    const avatarFile = formData.get('avatar');
    const avatarUrlSignal = formData.get('avatar_url') as string | null;
    const examDate = formData.get('examDate') as string | null;

    if (!fullName || !matricNumber || !sex || !department || !faculty) {
      return NextResponse.json({ error: 'All fields (excluding avatar) are required' }, { status: 400 });
    }

    if (sex !== 'male' && sex !== 'female') {
      return NextResponse.json({ error: 'Sex must be either male or female' }, { status: 400 });
    }

    // Check for duplicate matric number
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, matric_number, avatar_url')
      .eq('id', user.id)
      .single();

    if (!existingProfile || existingProfile.matric_number !== matricNumber) {
      const { data: duplicateMatric } = await supabase
        .from('profiles')
        .select('id')
        .eq('matric_number', matricNumber)
        .neq('id', user.id)
        .single();

      if (duplicateMatric) {
        return NextResponse.json({ error: 'Matric number is already taken' }, { status: 400 });
      }
    }

    let newAvatarUrl = existingProfile?.avatar_url || null;

    // Handle avatar upload/removal
    if (avatarUrlSignal === "") {
      if (existingProfile?.avatar_url) {
        const oldFilePath = new URL(existingProfile.avatar_url).pathname.split('/avatars/')[1];
        if (oldFilePath) {
          await supabase.storage.from('avatars').remove([oldFilePath]);
        }
      }
      newAvatarUrl = null;
    } else if (avatarFile && avatarFile instanceof Blob) {
      if (existingProfile?.avatar_url) {
        const oldFilePath = new URL(existingProfile.avatar_url).pathname.split('/avatars/')[1];
        if (oldFilePath) {
          await supabase.storage.from('avatars').remove([oldFilePath]);
        }
      }
      
      const fileName = `${user.id}/${Date.now()}_avatar`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      newAvatarUrl = publicUrlData.publicUrl;
    }

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: fullName,
      matric_number: matricNumber,
      sex: sex,
      department: department,
      faculty: faculty,
      avatar_url: newAvatarUrl,
      updated_at: new Date().toISOString(),
      exam_date: examDate || null,
    };

    const { data: updatedProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select('id, email, full_name, matric_number, sex, department, faculty, avatar_url, created_at, updated_at, exam_date')
      .single();

    if (upsertError) {
      console.error('Error upserting profile:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    const transformedProfile = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      fullName: updatedProfile.full_name,
      matricNumber: updatedProfile.matric_number,
      sex: updatedProfile.sex,
      department: updatedProfile.department,
      faculty: updatedProfile.faculty,
      avatarUrl: updatedProfile.avatar_url,
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at,
      examDate: updatedProfile.exam_date,
    };

    return NextResponse.json({ profile: transformedProfile });
  } catch (error) {
    console.error('Error in profile POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 