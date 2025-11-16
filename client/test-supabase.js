// Test Supabase Connection Script
// Run this to verify your Supabase setup is working

import { supabase } from '../src/lib/supabase/supabaseClient'

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test database access
    const { data: locations, error: dbError } = await supabase
      .from('location')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.error('❌ Database access failed:', dbError.message)
      return
    }
    
    console.log('✅ Database access successful')
    
    // Test auth users table access
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('⚠️ Auth admin access not available (expected in client-side)')
    } else {
      console.log('✅ Auth admin access available')
    }
    
    console.log('\n🎉 Supabase setup is working!')
    console.log('\nNext steps:')
    console.log('1. Set up your environment variables in .env.local')
    console.log('2. Create demo users in Supabase Auth dashboard')
    console.log('3. Link them to your database using setup-demo-users.md')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Only run if this is the main module
if (require.main === module) {
  testSupabaseConnection()
}

export { testSupabaseConnection }