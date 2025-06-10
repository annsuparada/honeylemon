'use client'

import Sidebar from './sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="min-h-screen">
            <Sidebar />
            <div className="lg:pl-72">
                <div className='p-4'>
                    {children}
                </div>
            </div>
        </div>
    )
}
