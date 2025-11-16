import Navbar from '@/components/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import React from 'react'

const Dashboardlayout = ({children}:{children:React.ReactNode}) => {
  return (
    <SidebarProvider>
    <div className='min-h-screen w-full bg-primary-100'>
        <Navbar/>
        <div style={{padding: `${NAVBAR_HEIGHT}px`}}>
            <main className='flex'>
                <Sidebar/>
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