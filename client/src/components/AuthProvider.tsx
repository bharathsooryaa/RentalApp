'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
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

  // helper: fetch user profile from server
  const fetchAppProfile = async (accessToken: string | null) => {
    if (!accessToken) {
      setAppUser(null)
      return
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setAppUser(null)
        return
      }

      // Try to fetch from manager endpoint first
      try {
        const managerResponse = await fetch(`http://localhost:3001/managers/${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (managerResponse.ok) {
          const managerData = await managerResponse.json()
          setAppUser({
            role: 'manager',
            profile: managerData
          })
          return
        }
      } catch (error) {
        // Manager fetch failed, try tenant
        console.log('Manager profile not found, trying tenant...')
      }

      // Try to fetch from tenant endpoint
      try {
        const tenantResponse = await fetch(`http://localhost:3001/tenants/${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json()
          setAppUser({
            role: 'tenant',
            profile: tenantData
          })
          return
        }
      } catch (error) {
        console.log('Tenant profile not found')
      }

      // If neither profile found
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
      if (!opts.userData) {
        throw new Error('User data (name, phone, role) is required for signup')
      }

      // Create user in Supabase Auth directly
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: opts.email,
        password: opts.password,
        options: {
          data: opts.userData,
        },
      })
      
      if (authError) throw authError
      
      // If auth user is created successfully, create profile via server
      if (authData.user && authData.session) {
        try {
          const endpoint = opts.userData.role === 'manager' ? '/managers' : '/tenants'
          const response = await fetch(`http://localhost:3001${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`
            },
            body: JSON.stringify({
              cognito_id: authData.user.id,
              name: opts.userData.name,
              email: opts.email,
              phone_number: opts.userData.phone
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Failed to create profile:', errorData)
            // Profile creation failed, but auth user was created
            // The user can still sign in, but they'll need to complete profile setup
          } else {
            const profileData = await response.json()
            setAppUser({
              role: opts.userData.role,
              profile: profileData
            })
          }
        } catch (profileError) {
          console.error('Error creating profile via server:', profileError)
          // Continue with auth success even if profile creation fails
        }
      }

      return authData
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
