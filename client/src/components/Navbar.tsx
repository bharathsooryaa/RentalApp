'use client'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import AuthButton from './AuthButton'
import { useAuth } from './AuthProvider'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, BellElectric, MessageCircle, Plus, Search, User2Icon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { SidebarTrigger } from './ui/sidebar'
const Navbar = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isDashboard = pathname.includes("/manager") || pathname.includes("/tenant");
    const handlesignout = () => {
        signOut();
        window.location.href = "/landing";
    };
    console.log("Navbar user:", user);
  return (
    <div 
    className='fixed top-0 left-0 w-full z-50 shadow-xl'
    style={{height:`${NAVBAR_HEIGHT}px`}}
    >
        <div className='flex justify-between items-center w-full py-3 px-8 bg-primary-700 text-white'>
            {/* Left side - Logo and tagline */}
            
            <div className='flex items-center gap-4 md:gap-6'>
                {
                isDashboard&&(
                    <div className='md:hidden'>
                        <SidebarTrigger/>
                    </div>
                )
                }
                <Link 
                href="/landing"
                className='cursor-pointer hover:!text-primary-300 '
                scroll={false}>
                    <div className='flex items-center gap-3'>
                        <Image 
                        src = "/logo.svg"
                        alt = "RentAI logo"
                        width={24}
                        height={24}
                        className='w-6 h-6'
                        />
                        <div className='text-xl font-bold'>
                            RENT
                            <span className='text-secondary-500 font-light hover:!text-primary-300 font-extrabold' >
                                Ai                   
                            </span>
                        </div>

                    </div>
                </Link>
                </div>
                {user && isDashboard && (
                    <Button
                    variant="outline"
                    className='text-white border-white bg-transparent hover:bg-white hover:text-primary-700 rounded-lg'
                    onClick={()=>{
                        router.push(
                            user.user_metadata.role === 'manager' ? 
                            '/managers/newproperty' :
                            '/search'
                        )
                    }}>
                        {
                            user.user_metadata.role === 'manager' ?
                            <>
                            <Plus className='h-4 w-4'/>
                            <span className='hidden md:block ml-2'>Add new property</span>
                            </>:
                            <>
                            <Search className='h-4 w-4'/>
                            <span className='hidden md:block ml-2'>Search Properties</span>
                            </>
                        }
                    </Button>)}
                {!isDashboard &&
                <p className='text-primary-200 hidden md:block'>
                    Discover your next home with RentAI
                </p>}
            

            {/* Right side - Buttons */}
            <div className='flex items-center gap-3'>
            {user?(
                <>
                <div className='relative hidden md:block'>
                    <MessageCircle className='w-6 h-6 cursor-pointer hover:text-secondary-500 text-primary-400'/>
                    <span className='absolute top-0 right-0 w-2 h-2 bg-secondary-700 rounded-full'></span>
                </div>
                <div className='relative hidden md:block'>
                    <Bell className='w-6 h-6 cursor-pointer hover:text-secondary-500 text-primary-400'/>
                    <span className='absolute top-0 right-0 w-2 h-2 bg-secondary-700 rounded-full'></span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className='flex items-center gap-2 focus:outline-none'>
                        <Avatar>
                        <AvatarImage src = {user.user_metadata?.avatar_url }
                        alt = "User Avatar"
                        className='w-8 h-8 rounded-full border-2 border-white'/>
                        <AvatarFallback className='bg-primary-600 text-secondary-500 font-bold text-2xl'>
                            {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'}

                        </AvatarFallback>
                        
                        </Avatar>
                        <p className='text-primary-300'> { user.user_metadata?.name}</p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='bg-white text-black rounded-md shadow-lg mt-2 p-2 min-w-[150px]'>
                        <DropdownMenuItem
                        className='cursor-pointer hover:!bg-black hover:!text-white rounded-md px-3 py-2 font-bold'
                        onClick={()=>{
                            router.push(
                                user.user_metadata.role === 'manager' ?
                                '/managers/dashboard' :
                                '/tenants/favorites',
                                {scroll:false}
                            )
                        }}
                        >
                            Go To Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className='bg-primary-200 '/>
                        <DropdownMenuItem
                        className='cursor-pointer hover:!bg-black hover:!text-white rounded-md px-3 py-2'
                        onClick={()=>{
                            router.push(
                                `/${user.user_metadata.role?.toLowerCase()}s/settings`,
                                {scroll:false}
                            )
                        }}
                        >
                            Settings
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                        className='cursor-pointer hover:!bg-black hover:!text-white rounded-md px-3 py-2'
                        onClick={handlesignout}
                        >
                            Sign Out
                        </DropdownMenuItem>
                        
                    </DropdownMenuContent>
                </DropdownMenu>
                </>
            ):(
            <>
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
                
            
            </>)}
            </div>
        </div>
    </div>
    
  )
}

export default Navbar