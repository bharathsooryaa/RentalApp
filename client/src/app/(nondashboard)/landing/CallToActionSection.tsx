"use client"
import Image from 'next/image'
import React from 'react'
import {motion} from 'framer-motion'
import { Button } from '@/components/ui/button'

const CallToActionSection = () => {
  const scrollToSearch = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className='relative py-24'>
      <Image
        src='/landing-call-to-action.jpg'
        alt='Call to Action Background'
        fill
        className='object-cover object-center'/>
        <div className='absolute inset-0 bg-black bg-opacity-60'>

        </div>
        <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        transition={{duration:0.8}}
        className='relative z-10 max-w-3xl mx-auto text-center text-white px-4'>
            <h2 className='text-4xl font-bold mb-6'>
                Ready to Find Your Perfect Rental Home?
            </h2>
            <p className='text-lg mb-8'>
                Join thousands of satisfied renters who have found their ideal homes with our easy-to-use platform. Start your journey today!
            </p>
            <div className='flex flex-col sm:flex-row justify-center items-center gap-4'>
              <Button 
                size='lg' 
                variant='outline' 
                className='bg-secondary-400 text-white border-white hover:bg-white hover:text-primary-600'
                onClick={scrollToSearch}
              >
                Search
              </Button>
              
              <Button size='lg' className='bg-primary-600 hover:bg-primary-700'>
                Get Started
              </Button>
              
              

            </div>
        </motion.div>
    </div>
  )
}

export default CallToActionSection