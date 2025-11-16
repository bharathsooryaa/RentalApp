import { usePathname } from 'next/navigation'
import React from 'react'
import { useSidebar } from './ui/sidebar';
import { Building, FileText } from 'lucide-react';

const AppSidebar = ({userType}:AppSidebarProps) => {
    const pathname  = usePathname();
    const {toggleSidebar,open} = useSidebar();

    const navLinks = 
    userType === 'manager' ? [
        {icon:Building,label:'Properties',href:'/manager/properties'},
        {icon:FileText,label:'Applications',href:'/manager/applications'},
    ]:
    [];

  return (
    <div>AppSidebar</div>
  )
}

export default AppSidebar