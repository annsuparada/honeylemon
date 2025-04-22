'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { GiHamburgerMenu } from 'react-icons/gi'
import { usePathname, useRouter } from 'next/navigation'

const navLinks = [
  { href: '/deals', label: 'Deals' },
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
      ? "text-white underline decoration-accent"
      : "text-accent hover:text-white"
      } block transition-colors duration-300`;
  };


  return (
    <nav className="absolute top-0 left-0 w-full z-10 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="text-xl text-accent font-bold">
          <Link href="/">Travomad</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((nav, index) => (
            <Link
              key={index}
              href={nav.href}
              className={getNavLinkClass(nav.href, isActive(nav.href))}
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
                >
                  {nav.label}
                </Link>
              ))}
              <button className='btn btn-accent btn-sm rounded-sm' onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link href={'/login'} className='btn btn-accent btn-sm rounded-sm'>
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={toggleDropdown}
            className="text-gray-300 text-2xl focus:outline-none"
          >
            <GiHamburgerMenu />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isDropdownOpen && (
        <div className="md:hidden mt-2 bg-neutral-800 p-4 rounded-lg shadow-lg">
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
              <Link href={'/login'} className='btn btn-accent btn-sm rounded-sm'>
                Login
              </Link>
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Navigation
