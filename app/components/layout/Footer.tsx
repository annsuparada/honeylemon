import Link from 'next/link'
import React from 'react'
import { FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa'
import { BsThreadsFill } from "react-icons/bs"

const navLinks = [
  { href: '/itineraries', label: 'Itineraries' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/blog', label: 'Blog' },
  { href: '/login', label: 'Login' },
]

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content rounded p-10">
      <nav className="grid grid-flow-row md:grid-flow-col gap-4 text-center">
        <Link href="/" className="link link-hover">
          Home
        </Link>
        {navLinks.map((nav, index) => (
          <Link href={nav.href} className="link link-hover" key={index}>
            {nav.label}
          </Link>
        ))}
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <Link href="https://www.linkedin.com/" target="_blank">
            <FaLinkedin size={24} className="fill-current" />
          </Link>
          <Link href="https://www.threads.net/" target="_blank">
            <BsThreadsFill size={24} className="fill-current" />
          </Link>
          <Link href="https://www.facebook.com/" target="_blank">
            <FaFacebook size={24} className="fill-current" />
          </Link>
          <Link href="https://www.instagram.com/" target="_blank">
            <FaInstagram size={24} className="fill-current" />
          </Link>
        </div>
      </nav>
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All right reserved by Travomad
        </p>
      </aside>
    </footer>
  )
}

export default Footer
