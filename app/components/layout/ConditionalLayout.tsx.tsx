'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isDashboard = pathname.startsWith('/dashboard')

    return (
        <>
            {!isDashboard && <Navigation />}
            <main className="flex-grow">{children}</main>
            {!isDashboard && <Footer />}
        </>
    )
}
