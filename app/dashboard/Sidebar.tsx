'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from '@headlessui/react'
import {
    ArrowRightEndOnRectangleIcon,
    Bars3Icon,
    CalendarIcon,
    DocumentPlusIcon,
    HomeIcon,
    UserIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid'
import { usePathname } from 'next/navigation'

// Type Definitions
interface NavItem {
    name: string
    href: string
    icon: FC<React.SVGProps<SVGSVGElement>>
    current: boolean
}

const navigation: Omit<NavItem, 'current'>[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Blogs', href: '/dashboard/blogs', icon: DocumentPlusIcon },
    { name: 'Scheduled Publishing', href: '/dashboard/scheduled', icon: CalendarIcon },
    { name: 'SEO Keywords', href: '/dashboard/seo', icon: ArrowTrendingUpIcon },
    { name: 'Your Profile', href: '/dashboard/profile', icon: UserIcon },
]

// Utility Function
function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
}

const Sidebar: FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const pathname = usePathname()


    return (
        <>
            <div className=''>
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                        >
                            <TransitionChild>
                                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                                    </button>
                                </div>
                            </TransitionChild>

                            {/* Sidebar component, swap this element with another sidebar if you like */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
                                <div className="flex h-16 shrink-0 items-center">
                                    <Link href={'/'}>
                                        <Image
                                            alt="Travamad Logo"
                                            src="https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png"
                                            className="h-8 w-auto"
                                            width={150}
                                            height={100}
                                        />
                                    </Link>
                                </div>
                                {/* Sidebar mobile */}
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => {
                                                    const isActive = pathname === item.href
                                                    return (
                                                        <li key={item.name}>
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={classNames(
                                                                    isActive
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'text-white hover:bg-blue-500 hover:text-white',
                                                                    'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                                                )}
                                                            >
                                                                <item.icon
                                                                    aria-hidden="true"
                                                                    className={classNames(
                                                                        isActive ? 'text-white' : 'text-white group-hover:text-white',
                                                                        'size-6 shrink-0',
                                                                    )}
                                                                />
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    )
                                                })}

                                            </ul>
                                        </li>
                                        <li className="mt-auto">
                                            <a
                                                href="/"
                                                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white hover:bg-blue-500 hover:text-white"
                                            >
                                                <ArrowRightEndOnRectangleIcon
                                                    aria-hidden="true"
                                                    className="size-6 shrink-0 text-white group-hover:text-white"
                                                />
                                                Exit Dashboard
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
                        <div className="flex h-16 shrink-0 items-center">
                            <Link href={'/'}>
                                <Image
                                    alt="Travamad Logo"
                                    src="https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png"
                                    className="h-8 w-auto"
                                    width={150}
                                    height={100}
                                />
                            </Link>
                        </div>

                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className={classNames(
                                                        pathname === item.href
                                                            ? 'bg-blue-500 text-white'
                                                            : 'text-white hover:bg-blue-500 hover:text-white',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                                    )}
                                                >
                                                    <item.icon
                                                        aria-hidden="true"
                                                        className={classNames(
                                                            pathname === item.href ? 'text-white' : 'text-white group-hover:text-white',
                                                            'size-6 shrink-0',
                                                        )}
                                                    />
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </li>

                                <li className="mt-auto">
                                    <a
                                        href="/"
                                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white hover:bg-blue-500 hover:text-white"
                                    >
                                        <ArrowRightEndOnRectangleIcon
                                            aria-hidden="true"
                                            className="size-6 shrink-0 text-white group-hover:text-white"
                                        />
                                        Exit Dashboard
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="lg:pl-72">
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
                        <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar