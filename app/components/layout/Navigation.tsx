'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

const navLinks = [
  { href: '/itineraries', label: 'Itineraries' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/blog', label: 'Blog' },
]
const authenticatedNavLinks = [
  { href: '/write', label: 'Write' },
  { href: '/dashboard', label: 'Dashboard' },
]

const Navigation = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token); // Convert token to boolean
    };

    checkAuth(); // Run on mount

    // Listen for changes in `localStorage` across tabs
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLinkClick = () => {
    setIsDropdownOpen(false)
  }
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    router.push('/login')
  }
  const isActive = (href: string) => pathname === href
  const getNavLinkClass = (href: string, isActive: boolean) => {
    return `${isActive
      ? "text-accent underline decoration-accent"
      : "text-white hover:text-white"
      } block transition-colors duration-300`;
  };


  return (
    <nav className="absolute top-0 left-0 w-full z-50 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="text-xl text-white font-bold">
          <Link href="/">
            <Image
              src={"https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png"}
              alt={'Travomad Logo'}
              width={150}
              height={30}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((nav, index) => (
            <Link
              key={index}
              href={nav.href}
              className={getNavLinkClass(nav.href, isActive(nav.href))}
              style={{ textShadow: '0 4px 6px rgba(0, 0, 0, 0.8)' }}
            >
              {nav.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              {authenticatedNavLinks.map((nav, index) => (
                <Link
                  key={index}
                  href={nav.href}
                  className={getNavLinkClass(nav.href, isActive(nav.href))}
                  style={{ textShadow: '0 4px 6px rgba(0, 0, 0, 0.8)' }}
                >
                  {nav.label}
                </Link>
              ))}
              <button className='btn btn-accent btn-sm rounded-sm' onClick={handleLogout}>Logout</button>
            </>
          ) : (
            ""
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={toggleDropdown}
            className="text-white text-2xl focus:outline-none"
          >
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className="md:hidden mt-2 bg-neutral-800 p-4 rounded-lg shadow-lg"
          ref={dropdownRef}
        >
          <ul className="space-y-4">
            {navLinks.map((nav, index) => (
              <li key={index}>
                <Link
                  href={nav.href}
                  className={getNavLinkClass(nav.href, isActive(nav.href))}
                  onClick={handleLinkClick}
                >
                  {nav.label}
                </Link>
              </li>
            ))}
            {isAuthenticated ? (
              <>
                {authenticatedNavLinks.map((nav, index) => (
                  <Link
                    key={index}
                    href={nav.href}
                    className={getNavLinkClass(nav.href, isActive(nav.href))}
                  >
                    {nav.label}
                  </Link>
                ))}
                <button className='btn btn-accent btn-sm rounded-sm' onClick={handleLogout}>Logout</button>
              </>
            ) : (
              ""
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Navigation
