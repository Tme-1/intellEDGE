import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest } from 'next'; // Might be needed depending on parsing strategy

// Initialize Supabase client only if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseAnonKey && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper function to get user (repeated in GET and POST, can be refactored)
async function getUserFromToken(request: Request) {
  if (!supabase) return null;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, matric_number, sex, department, faculty, avatar_url, created_at, updated_at, exam_date')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const transformedProfile = profile ? {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      matricNumber: profile.matric_number,
      sex: profile.sex,
      department: profile.department,
      faculty: profile.faculty,
      avatarUrl: profile.avatar_url, // Added avatarUrl
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      examDate: profile.exam_date,
    } : null;

    return NextResponse.json({ profile: transformedProfile });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// To handle multipart/form-data, Next.js API routes need their default bodyParser disabled.
// This is usually done via config, but for Route Handlers (app directory), it's handled differently.
// For app router, Next.js should handle FormData parsing directly if no custom config is set.

export async function POST(request: Request) {
  // Skip the entire handler during build time if JWT_SECRET is missing
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return NextResponse.json({ profile: null });
  }

  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData(); // Next.js 13.4+ can handle FormData directly

    const fullName = formData.get('fullName') as string;
    const matricNumber = formData.get('matricNumber') as string;
    const sex = formData.get('sex') as string;
    const department = formData.get('department') as string;
    const faculty = formData.get('faculty') as string;
    const avatarFile = formData.get('avatar');
    const avatarUrlSignal = formData.get('avatar_url') as string | null; // For explicit removal
    const examDate = formData.get('examDate') as string | null;

    if (!fullName || !matricNumber || !sex || !department || !faculty) {
      return NextResponse.json({ error: 'All fields (excluding avatar) are required' }, { status: 400 });
    }
    if (sex !== 'male' && sex !== 'female') {
      return NextResponse.json({ error: 'Sex must be either male or female' }, { status: 400 });
    }

    // Database interaction (similar to before, but with avatar logic)
    const { data: existingUserProfile, error: existingProfileError } = await supabase
      .from('profiles')
      .select('matric_number, avatar_url') // select avatar_url to compare for removal
      .eq('id', user.id)
      .single();

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', existingProfileError);
      return NextResponse.json({ error: 'Error checking existing profile' }, { status: 500 });
    }

    if (!existingUserProfile || existingUserProfile.matric_number !== matricNumber) {
      const { data: duplicateMatric } = await supabase
        .from('profiles')
        .select('id')
        .eq('matric_number', matricNumber)
        .neq('id', user.id) // Ensure it's not the current user's own matric number
        .single();
      if (duplicateMatric) {
        return NextResponse.json({ error: 'Matric number is already taken' }, { status: 400 });
      }
    }

    let newAvatarUrl = existingUserProfile?.avatar_url || null;

    if (avatarUrlSignal === "") { // Explicit signal from frontend to remove avatar
        if (existingUserProfile?.avatar_url) {
            // Attempt to delete old avatar from storage
            const oldFilePath = new URL(existingUserProfile.avatar_url).pathname.split('/avatars/')[1];
            if (oldFilePath) {
                 // console.log(`Attempting to delete old avatar: ${oldFilePath}`);
                await supabase.storage.from('avatars').remove([oldFilePath]);
            }
        }
        newAvatarUrl = null;
    } else if (avatarFile && avatarFile instanceof Blob) {
      // Delete old avatar if it exists and a new one is uploaded
      if (existingUserProfile?.avatar_url) {
        const oldFilePath = new URL(existingUserProfile.avatar_url).pathname.split('/avatars/')[1];
         if (oldFilePath) {
            // console.log(`Attempting to delete old avatar for replacement: ${oldFilePath}`);
            await supabase.storage.from('avatars').remove([oldFilePath]);
        }
      }
      
      // Upload new avatar
      const fileName = `${user.id}/${Date.now()}_avatar`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars') // Your bucket name
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists (good for retries, but unique name helps)
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
      }
      
      // Get public URL (ensure your bucket is public and RLS allows access)
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      newAvatarUrl = publicUrlData.publicUrl;
    }
    
    const profileDataToUpsert: any = {
        id: user.id,
        email: user.email, // Keep email in sync
        full_name: fullName,
        matric_number: matricNumber,
        sex: sex,
        department: department,
        faculty: faculty,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
        exam_date: examDate || null,
    };
     // If it's a new profile, also set created_at (Supabase handles this by default if column has DEFAULT)
    if (!existingUserProfile) {
        // profileDataToUpsert.created_at = new Date().toISOString(); // Or rely on DB default
    }

    const { data: updatedProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileDataToUpsert)
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
  } catch (error: any) {
    console.error('Error in profile POST:', error);
    // Check if it's a known error type or just send generic
    if (error.message && error.message.includes('request.formData is not a function')) {
        return NextResponse.json({ error: 'Server error: FormData processing failed. Ensure you are on Next.js 13.4+ or configure body parsing correctly.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 