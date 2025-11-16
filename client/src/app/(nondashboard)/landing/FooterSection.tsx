import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons'

const FooterSection = () => {
  const socialLinks = [
    {
      icon: faFacebook,
      href: 'https://facebook.com',
      label: 'Facebook',
      color: 'hover:text-blue-600'
    },
    {
      icon: faTwitter,
      href: 'https://twitter.com',
      label: 'Twitter',
      color: 'hover:text-blue-400'
    },
    {
      icon: faInstagram,
      href: 'https://instagram.com',
      label: 'Instagram',
      color: 'hover:text-pink-500'
    },
    {
      icon: faLinkedin,
      href: 'https://linkedin.com',
      label: 'LinkedIn',
      color: 'hover:text-blue-700'
    },
    {
      icon: faYoutube,
      href: 'https://youtube.com',
      label: 'YouTube',
      color: 'hover:text-red-600'
    }
  ]

  return (
    <div>
        <div className='flex justify-center items-center gap-6 py-8 bg-gray-50'>
            <h3 className='text-lg font-semibold text-gray-700 mr-4'>Follow Us:</h3>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-600 transition-colors duration-300 ${social.color} transform hover:scale-110`}
                aria-label={social.label}
              >
                <FontAwesomeIcon 
                  icon={social.icon} 
                  className="w-6 h-6"
                />
              </a>
            ))}
        </div>
        <div className='bg-white text-primary-700 py-8'>
            <p className='text-center'>
                &copy; {new Date().getFullYear()} Rental App. All rights reserved.
            </p>
        </div>
    </div>
  )
}

export default FooterSection