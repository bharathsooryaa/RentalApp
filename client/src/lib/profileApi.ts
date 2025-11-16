import { supabase } from '@/lib/supabase/supabaseClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Create tenant profile via server API
export const createTenantProfile = async (userData: {
  cognito_id: string
  name: string
  email: string
  phone_number?: string
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cognito_id: userData.cognito_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone_number || ''
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create tenant profile')
    }

    const data = await response.json()
    console.log('Tenant profile created via API:', data)
    return data
  } catch (error) {
    console.error('Failed to create tenant profile via API:', error)
    throw error
  }
}

// Create manager profile via server API
export const createManagerProfile = async (userData: {
  cognito_id: string
  name: string
  email: string
  phone_number?: string
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cognito_id: userData.cognito_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone_number || ''
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create manager profile')
    }

    const data = await response.json()
    console.log('Manager profile created via API:', data)
    return data
  } catch (error) {
    console.error('Failed to create manager profile via API:', error)
    throw error
  }
}

// Check if profile exists
export const checkProfileExists = async (userId: string, role: 'tenant' | 'manager') => {
  try {
    const tableName = role === 'tenant' ? 'tenant' : 'manager'
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('cognito_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Error checking profile existence:', error)
    return false
  }
}

// Get user profile
export const getUserProfile = async (userId: string, role: 'tenant' | 'manager') => {
  try {
    const tableName = role === 'tenant' ? 'tenant' : 'manager'
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('cognito_id', userId)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}