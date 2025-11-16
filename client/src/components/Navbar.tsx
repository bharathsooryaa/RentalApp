import { NAVBAR_HEIGHT } from '@/lib/constants'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import AuthButton from './AuthButton'
const Navbar = () => {
  return (
    <div 
    className='fixed top-0 left-0 w-full z-50 shadow-xl'
    style={{height:`${NAVBAR_HEIGHT}px`}}
    >
        <div className='flex justify-between items-center w-full py-3 px-8 bg-primary-700 text-white'>
            {/* Left side - Logo and tagline */}
            <div className='flex items-center gap-4 md:gap-6'>
                <Link 
                href="/"
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
                <p className='text-primary-200 hidden md:block'>
                    Discover your next home with RentAI
                </p>
            </div>

            {/* Right side - Buttons */}
            <AuthButton/>
        </div>
    </div>
  )
}

export default Navbar