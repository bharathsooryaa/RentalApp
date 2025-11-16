"use client"
import React from 'react'
import {motion} from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const contrainerVariants = {
  hidden: {opacity:0},
  visible: {
    opacity:1,
    transition: {
      staggerChildren: 0.2,
    }
  }
}

const itemVariants = {
  hidden: {opacity:0,y:20},
  visible: {
    opacity:1,
    y:0
  }
}

const DiscoverSection = () => {
  return <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{once:true, amount:0.8}}
  variants={contrainerVariants}
  className='py-12 bg-white mb-16'
     >
        <div className='max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-16'>
            <motion.h2
            variants={itemVariants}
            className='text-3xl font-bold text-center mb-12 w-full sm:w-25 mx-auto'>
                
                    Discover
                
                <p className='mt-4 text-lg text-gray-600'>
                Uncover a World of Rental Opportunities Tailored to Your Needs

                </p>
                <p className='mt-2 text-gray-500 max-w-3xl mx-auto'>
                Dive into our extensive collection of rental listings, featuring a diverse range of properties to suit every lifestyle and budget. 
                Whether you're seeking a cozy apartment in the city or a spacious family home in the suburbs, our platform makes it easy to find your perfect match.

                </p>
            </motion.h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16'>
                {
                    [
                        {
                            imageSrc: '/landing-icon-wand.png',
                            title: ' Personalized Recommendations',
                            description: 'Receive tailored rental suggestions based on your preferences and browsing history, ensuring you never miss out on the perfect property.'
                        },
                        {
                            imageSrc: '/landing-icon-calendar.png',
                            title: ' Book your Rentals Easily',
                            description: 'Schedule viewings and manage your rental applications seamlessly through our user-friendly platform, making the rental process hassle-free.'
                        },
                        {
                            imageSrc: '/landing-icon-heart.png',
                            title: ' Enjoy your new Home',
                            description: 'Find a place you\'ll love to call home, with access to exclusive deals and offers that make renting more affordable and enjoyable.    '
                        }
                    ].map((card,index)=>(
                        <motion.div key={index} variants={itemVariants} className='text-center'>
                            <DiscoverCard {...card}
                            />
                        </motion.div>
                    ))
                }

            </div>
        </div>
     </motion.div>
  
};

const DiscoverCard = ({
    imageSrc,
    title,
    description,

}: {
    imageSrc: string;
    title: string;
    description: string;

}) => (
    <div className='px-4 py-12 shadow-lg rounded-lg h-full flex flex-col items-center'>
        <div className='bg-black p-4 rounded-full mb-6 flex items-center justify-center w-16 h-16'>
            <Image
            src={imageSrc}
            width={32}
            height={32}
            className='w-8 h-8 object-contain filter brightness-0 invert'
            alt={title}
            />

        </div>
        <h3 className='mt-4 text-xl font-semibold mb-2'>
            {title}
        </h3>
        <p className='text-gray-600'>
            {description}
        </p>


    </div>
)





export default DiscoverSection