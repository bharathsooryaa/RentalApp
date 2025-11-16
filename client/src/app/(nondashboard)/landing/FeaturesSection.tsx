"use client"
import React from 'react'
import {motion} from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const contrainerVariants = {
  hidden: {opacitry:0,y:50},
  visible: {
    opacity:1,
    y:0,
    transition: {
    duration :0.5,
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

const FeaturesSection = () => {
  return <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{once:true, amount:0.3}}
  variants={contrainerVariants}
  className='py-24 px-6 sm:px-12 lg:px-16 xl:px-16 bg-white'
     >
        <div className='max-w-4xl xl:max-w-6xl mx-auto'>
            <motion.h2
            variants={itemVariants}
            className='text-3xl font-bold text-center mb-12 w-full sm:w-25 mx-auto'> 
            Quickly Explore Top Features of Our Rental Listings

            </motion.h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16'>
                {[0,1,2].map((index) =>(
                    <motion.div key = {index} variants={itemVariants}>  
                        <FeatureCard
                        imageSrc={`/landing-search${3 - index}.png`}
                        title={
                            ["Advanced Search Filters",
                            "Detailed Property Listings",
                            "Interactive Maps and Virtual Tours"][index]
                        }
                        description={
                            [
                                "Refine your search with filters for price, location, amenities, and more to find the perfect rental that fits your needs.",
                                "Access comprehensive property details including high-quality images, floor plans, and neighborhood insights to make informed decisions.",
                                "Explore properties through interactive maps and virtual tours, allowing you to experience the space from the comfort of your home."
                            ][index]
                        }
                        linkText={["Explore Filters",
                        "View Listings",
                        "Start Touring"][index]}

                        linkHref={["/explore","/search","/discover"][index]}
                        />

                    </motion.div>
                ))

                }

            </div>
        </div>
     </motion.div>
  
};

const FeatureCard = ({
    imageSrc,
    title,
    description,
    linkText,
    linkHref
}: {
    imageSrc: string;
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
}) => (
    <div className='text-center'>
        <div className='p-4 rounded-lg mb-4 flex items-center justify-center h-48'>
            <Image
            src={imageSrc}
            width={400}
            height={400}
            className='w-full h-full object-contain'
            alt={title}
            />

        </div>
        <h3 className='text-xl font-semibold mb-2'>
            {title}
        </h3>
        <Link
        href={linkHref}
        className='inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100'
        scroll={false}
        >
            {linkText}
        </Link>

    </div>
)





export default FeaturesSection