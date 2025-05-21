import { createClient } from '@supabase/supabase-js'

// During build time or when environment variables are missing, create a dummy client
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

// Create a client that's always available, but will only work with real credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isBuildTime,
    autoRefreshToken: !isBuildTime,
    detectSessionInUrl: !isBuildTime
  }
}) 