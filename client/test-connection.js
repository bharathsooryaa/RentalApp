// Quick test to verify Supabase connection
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔄 Testing Supabase connection...')
console.log('URL:', SUPABASE_URL)
console.log('Key exists:', !!SUPABASE_ANON_KEY)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test database access
    const { data: tables, error: dbError } = await supabase
      .from('manager')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.error('❌ Database access failed:', dbError.message)
      return false
    }
    
    console.log('✅ Database access successful!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Your sign-in should work now.')
  } else {
    console.log('\n❌ Tests failed. Please check your Supabase setup.')
  }
  process.exit(success ? 0 : 1)
})