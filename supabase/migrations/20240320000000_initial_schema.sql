-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.downloads CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.gpa_entries CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    matric_number TEXT UNIQUE,
    sex TEXT CHECK (sex IN ('male', 'female')),
    department TEXT,
    faculty TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create downloads table
CREATE TABLE public.downloads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    material_id UUID NOT NULL,
    material_title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    quiz_id UUID NOT NULL,
    quiz_title TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create gpa_entries table
CREATE TABLE public.gpa_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL CHECK (gpa >= 0 AND gpa <= 5.00),
    semester TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpa_entries ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting older/generic RLS policies first
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles; -- This is the generic service role one

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.downloads;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.downloads;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.quiz_attempts;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.gpa_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.gpa_entries;

-- Create policies for profiles
-- These are the more specific policies you added at the end of the file, 
-- which are generally better. I'll keep these and ensure they are created after any old ones are dropped.
DROP POLICY IF EXISTS "Authenticated users can select their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON profiles;
-- Ensure the generic service role policy from the end of the file is also explicitly dropped before recreation if it was somehow missed
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles; 

CREATE POLICY "Authenticated users can select their own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Recreate the specific service role policy if needed (this was at the end of your file)
CREATE POLICY "Service role full access on profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for downloads (specific to user_id)
CREATE POLICY "Authenticated users can read their own downloads" ON public.downloads FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own downloads" ON public.downloads FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policies for quiz_attempts (specific to user_id)
CREATE POLICY "Authenticated users can read their own quiz attempts" ON public.quiz_attempts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own quiz attempts" ON public.quiz_attempts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policies for gpa_entries (specific to user_id)
CREATE POLICY "Authenticated users can read their own gpa entries" ON public.gpa_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own gpa entries" ON public.gpa_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_gpa_entries_user_id ON public.gpa_entries(user_id);
CREATE INDEX idx_profiles_matric_number ON public.profiles(matric_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.downloads TO authenticated;
GRANT ALL ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.gpa_entries TO authenticated;

-- Grant service role permissions
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.downloads TO service_role;
GRANT ALL ON public.quiz_attempts TO service_role;
GRANT ALL ON public.gpa_entries TO service_role;

-- Grant usage on storage if not already done (run this separately in Supabase SQL editor if needed)
-- GRANT USAGE ON SCHEMA storage TO supabase_storage_admin; 
-- GRANT ALL ON ALL TABLES IN SCHEMA storage TO supabase_storage_admin;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO supabase_storage_admin;
-- Ensure authenticated users can upload to a specific bucket (e.g., 'avatars')
-- This needs to be set up in Supabase Storage policies via the dashboard or SQL

-- Example: Policy for allowing authenticated users to upload to an 'avatars' bucket
-- (You would create this policy in the Supabase Dashboard under Storage > Policies)
-- CREATE POLICY "Authenticated users can upload avatars" 
-- ON storage.objects FOR INSERT TO authenticated 
-- WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Authenticated users can read their own avatars" 
-- ON storage.objects FOR SELECT TO authenticated 
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Authenticated users can update their own avatars" 
-- ON storage.objects FOR UPDATE TO authenticated 
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Authenticated users can delete their own avatars" 
-- ON storage.objects FOR DELETE TO authenticated 
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]); 