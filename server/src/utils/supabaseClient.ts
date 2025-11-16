import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Server-side Supabase configuration
// These should be in your .env file on the server
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables'
  )
}

// Create Supabase client with service role key for server-side operations
// This client bypasses RLS (Row Level Security) and should be used carefully
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create a client with anon key for user operations (respects RLS)
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to create user-specific client
export const createUserClient = (accessToken: string) => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to verify and decode JWT token
export const verifySupabaseJWT = async (token: string) => {
  try {
    const { data, error } = await supabase.auth.getUser(token)
    
    if (error) {
      throw new Error(`Invalid token: ${error.message}`)
    }
    
    return data.user
  } catch (error) {
    throw new Error(`Token verification failed: ${error}`)
  }
}