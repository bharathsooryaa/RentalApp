'use client';
import AppSidebar from '@/components/AppSidebar'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sidebar } from 'lucide-react'
import React from 'react'

const Dashboardlayout = ({children}:{children:React.ReactNode}) => {
    const user = useAuth().user;
    if (!user?.user_metadata.role) {
        return (
            <div className='min-h-screen w-full flex items-center justify-center'>
                <p className='text-gray-600 text-lg'>Loading...</p>
            </div>
        )
    }
  return (
    <SidebarProvider>
    <div className='min-h-screen w-full bg-primary-100'
    style={{padding: `${NAVBAR_HEIGHT+10}px`}}>
        <Navbar/>
        <div >
            <main className='flex'>
                <AppSidebar userType = {user.user_metadata!.role.toLowerCase()}/>
                <div className='flex-grow transition-all duration-300'>
                    {children}

                </div>

            </main>
        </div>
    </div>
    </SidebarProvider>
  )
}

export default Dashboardlayout