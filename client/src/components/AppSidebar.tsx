import { usePathname } from 'next/navigation'
import React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { Building, FileText, Heart, Home, Menu, Settings, X } from 'lucide-react';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import { cn } from '@/lib/utils';

const AppSidebar = ({userType}:AppSidebarProps) => {
    const pathname  = usePathname();
    const {toggleSidebar,open} = useSidebar();

    const navLinks = 
    userType === 'manager' ? [
        {icon:Building,label:'Properties',href:'/managers/properties'},
        {icon:FileText,label:'Applications',href:'/managers/applications'},
        {icon:Settings,label:'Settings',href:'/managers/settings'}    ]:
    [
         {icon:Heart,label:'Favorite',href:'/tenants/favorites'},
        {icon:FileText,label:'Applications',href:'/tenants/applications'},
        {icon:Home,label:'Residences',href:'/tenants/residences'},
        {icon:Settings,label:'Settings',href:'/tenants/settings'}
    ];

  return (
    <Sidebar
        collapsible='icon'
        className='fixed left-0 bg-white shadow-lg'
        style={{
            top:`${NAVBAR_HEIGHT}px`,
            height: `calc(100vh-${NAVBAR_HEIGHT}px)`
        }}
    >
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <div className={cn("flex min-h-[50px] w-full items-center pt-3 mb-3"
                    ,
                    open?"justify-between px-4":"justify-center")}
                    >
                        {open?<>
                        <h1 className='text-xl font-bold text-gray-800'>
                            {userType==='manager'?'Manager view':'Tenant view'}

                        </h1>
                        <button
                        onClick={toggleSidebar}
                        className='text-gray-600 hover:text-gray-800'
                        >
                            <X className='h-6 w-6 text-gray-600'/>
                        </button>
                        </>:
                        <>
                        <button
                        onClick={toggleSidebar}
                        className='text-gray-600 hover:text-gray-800'
                        >
                            <Menu className='h-6 w-6 text-gray-600'/>
                        </button>
                        </>
                        }

                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {
                    navLinks.map((link)=>{
                        const isActive =  pathname === link.href;
                        
                        return(
                        <SidebarMenuItem
                        key={link.href}
                        
                        >
                            <a 
                            href={link.href}
                            className='flex items-center gap-3 w-full h-full py-2 px-4 hover:bg-primary-100 rounded-lg'
                            >
                                <link.icon className={`h-5 w-5  ${
                                    isActive ?"text-secondary-600":"text-gray-600" }`}/>
                                {open && <span className={`${
                                    isActive ?"text-secondary-600":"text-gray-700" } font-medium`}>{link.label}</span>}
                            </a>
                        </SidebarMenuItem>
                    )})
                }
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar