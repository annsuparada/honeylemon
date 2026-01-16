'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface FAQ {
  id: string
  question: string
}

interface TableOfContentsProps {
  headings: Heading[]
  faqs?: FAQ[]
}

export default function TableOfContents({ headings, faqs = [] }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

  useEffect(() => {
    const allItems = [...headings, ...(faqs || [])]
    if (allItems.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    )

    // Observe all headings and FAQs
    allItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      allItems.forEach((item) => {
        const element = document.getElementById(item.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings, faqs])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      // Calculate offset for fixed header (matches CSS scroll-margin-top: 100px)
      const offset = 100

      // Get element's position relative to document
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset

      // Calculate scroll position with offset
      const scrollPosition = elementTop - offset

      // Use window.scrollTo for better test compatibility
      // scroll-margin-top in CSS will handle native anchor navigation
      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth',
      })
    }
  }

  if (headings.length === 0 && (!faqs || faqs.length === 0)) {
    return null
  }

  const tocContent = (
    <nav className="space-y-1">
      {/* Headings */}
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          onClick={(e) => {
            handleClick(e, heading.id)
            setIsMobileOpen(false) // Close mobile menu after click
          }}
          className={`block text-sm py-1 px-2 rounded transition-colors ${heading.level === 2
            ? 'font-medium'
            : heading.level === 3
              ? 'ml-4 text-base-content/80'
              : 'ml-8 text-base-content/60 text-xs'
            } ${activeId === heading.id
              ? 'bg-primary text-primary-content'
              : 'hover:bg-base-200 text-base-content/90'
            }`}
        >
          {heading.text}
        </a>
      ))}

      {/* FAQs Section Separator */}
      {headings.length > 0 && faqs && faqs.length > 0 && (
        <div className="my-2 border-t border-base-300"></div>
      )}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <>
          <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide py-1 px-2">
            FAQs
          </div>
          {faqs.map((faq) => (
            <a
              key={faq.id}
              href={`#${faq.id}`}
              onClick={(e) => {
                handleClick(e, faq.id)
                setIsMobileOpen(false) // Close mobile menu after click
              }}
              className={`block text-sm py-1 px-2 ml-4 rounded transition-colors text-base-content/80 ${activeId === faq.id
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-200 text-base-content/90'
                }`}
            >
              {faq.question}
            </a>
          ))}
        </>
      )}
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar Version */}
      <div className="sticky top-24 hidden lg:block w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-base-100 border border-base-300 rounded-sm p-4 shadow-xl">
          <h3 className="text-sm font-semibold text-base-content/90 uppercase tracking-wide mb-4">
            Table of Contents
          </h3>
          {tocContent}
        </div>
      </div>

      {/* Mobile Floating Button & Drawer */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        {/* Floating Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="btn btn-primary btn-circle shadow-lg"
          aria-label="Toggle Table of Contents"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 rounded-t-lg shadow-2xl z-50 max-h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-base-300">
                <h3 className="text-lg font-semibold text-base-content/90">
                  Table of Contents
                </h3>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="btn btn-sm btn-ghost"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                {tocContent}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

