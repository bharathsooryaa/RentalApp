'use client'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { UserCircle } from 'lucide-react'

const AuthButton = () => {
  const { user, loading, appUser } = useAuth();
  
  // Console log user information
  console.log("AuthButton user:", user);
  
  // Log the user's name from different possible sources
  if (user) {
    console.log("User email:", user.email);
    console.log("User metadata:", user.user_metadata.name);
  }
  

  
  const router = useRouter();
  const signout = useAuth().signOut;
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className='flex items-center gap-3'>
        <div className='w-20 h-8 bg-gray-700 animate-pulse rounded-lg'></div>
        <div className='w-20 h-8 bg-gray-700 animate-pulse rounded-lg'></div>
      </div>
    )
  }

  return (
    <div>
      {user ? (
        <div className='flex items-center gap-3'>
            <Button
              variant="outline"
              className='text-white border-white bg-transparent hover:bg-white hover:text-primary-700 rounded-lg'
              onClick={()=>{
                router.push("/landing");
              }}
            >
              <UserCircle className='mr-2 inline-block h-5 w-5'/>
              {user ?  user.user_metadata.name : "Guest"}
            </Button>
            <Button
            variant="outline"
            className='text-white border-white bg-secondary-600 hover:bg-white hover:text-primary-700 rounded-lg'
            onClick={()=>{signout();
                
            }
            }
            >
                SIGN OUT
            </Button>
        </div>
      ) : (
        <div className='flex items-center gap-3'>
          <Link href="/signin">
            <Button
              variant="outline"
              className='text-white border-white bg-transparent hover:bg-white hover:text-primary-700 rounded-lg'
            >
              SIGN IN
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              className='text-white border-white bg-secondary-600 hover:bg-white hover:text-secondary-700 rounded-lg'
            >
              SIGN UP
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default AuthButton