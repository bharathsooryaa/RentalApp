'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { createTenantProfile, createManagerProfile, getUserProfile } from '@/lib/profileApi'
import type { Manager, Tenant } from '@/types/supabaseTypes'

// Define AppUser type for the application profile
type AppUser = {
  role: 'manager' | 'tenant'
  profile: Manager | Tenant
}

type AuthContextType = {
  user: any | null            // auth provider user object (supabase)
  session: any | null
  loading: boolean
  appUser: AppUser | null     // your application profile
  signUp: (opts: { email: string; password: string; userData?: { name: string; phone: string; role: 'manager' | 'tenant' } }) => Promise<any>
  signIn: (opts: { email: string; password: string }) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [appUser, setAppUser] = useState<AppUser | null>(null)

  // helper: call server to get /sync profile
  const fetchAppProfile = async (accessToken: string | null) => {
    if (!accessToken) {
      setAppUser(null)
      return
    }
    
    try {
      // For now, we'll try to fetch user profile from Supabase directly
      // This should be replaced with backend API call when available
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setAppUser(null)
        return
      }

      // Check if user exists in manager or tenant table
      // First try to find in manager table
      const { data: managerData, error: managerError } = await supabase
        .from('manager')
        .select('*')
        .eq('cognito_id', user.id)
        .single()

      if (managerData && !managerError) {
        setAppUser({
          role: 'manager',
          profile: managerData
        })
        return
      }

      // Then try tenant table
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant')
        .select('*')
        .eq('cognito_id', user.id)
        .single()

      if (tenantData && !tenantError) {
        setAppUser({
          role: 'tenant',
          profile: tenantData
        })
        return
      }

      // If user not found in either table, they might need to complete registration
      console.log('User authenticated but no profile found in database')
      setAppUser(null)
      
    } catch (err) {
      console.error('fetchAppProfile failed', err)
      setAppUser(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session ?? null
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
      fetchAppProfile(s?.access_token ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null)
      setUser(newSession?.user ?? null)
      fetchAppProfile(newSession?.access_token ?? null)
    })

    return () => {
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const signUp = async (opts: { email: string; password: string; userData?: { name: string; phone: string; role: 'manager' | 'tenant' } }) => {
    setLoading(true)
    try {
      // Step 1: Create auth user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: opts.email,
        password: opts.password,
        options: {
          data: opts.userData || {},
        },
      })
      
      if (error) throw error

      // Step 2: If user created successfully and we have userData, create profile
      if (data.user && opts.userData) {
        const { name, phone, role } = opts.userData
        
        try {
          // Create profile using utility functions
          if (role === 'tenant') {
            const tenantProfile = await createTenantProfile({
              cognito_id: data.user.id,
              name: name,
              email: opts.email,
              phone_number: phone || ''
            })
            console.log('Tenant profile created successfully:', tenantProfile)
          } else if (role === 'manager') {
            const managerProfile = await createManagerProfile({
              cognito_id: data.user.id,
              name: name,
              email: opts.email,
              phone_number: phone || ''
            })
            console.log('Manager profile created successfully:', managerProfile)
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError)
          // Continue - user auth was successful even if profile creation failed
          // You might want to show a message to user about completing profile later
        }
      }

      return data
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (opts: { email: string; password: string }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: opts.email,
        password: opts.password,
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      setAppUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, appUser, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
