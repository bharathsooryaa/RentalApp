"use client"
import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
function HeroSection() {
  return (
    <div className='relative h-screen'>
      <Image
      src="/landing-splash.jpg"
      alt="Landing Splash"
      fill
      className='object-cover object-center'
      priority
      />
      <div
      className='absolute inset-0 bg-black bg-opacity-60'
      >

      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{duration:0.8}}
      className='absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full'
      >
        <div className='max-w-4xl mx-auto px-16 sm:px-12 '>
          <div className='text-5xl font-bold text-white mb-4'>
            Find Your Perfect Rental Home
          </div>
          <div className='text-lg text-gray-300 mb-8'>
            Discover apartments, houses, and condos tailored to your lifestyle. Start your search today!

          </div>
          <div className='flex justify-center'>
            <Input
            type="text"
            value="search query"
            onChange={()=>{}}
            placeholder="Search by city, neighborhood, orsearch query address"
            className='w-full max-w-2xl rounded-none rounded-l-xl border-none bg-white h-12'
            />
            <Button
             onClick={()=>{}}
            className='bg-secondary-500 text-white  rounded-none rounded-r-xl border-none  hover:bg-secondary-600 h-12'
            >
              Search
            </Button>

          </div>
        </div>
      
      </motion.div>
      </div>
    </div>
  )
}

export default HeroSection