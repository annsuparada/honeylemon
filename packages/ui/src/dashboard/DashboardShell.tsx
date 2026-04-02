'use client';

import { useState, type ReactNode } from 'react';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from '@headlessui/react';
import {
    ArrowRightEndOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { defaultDashboardNavigation, type DashboardNavItem } from './dashboardNav';

function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

export interface DashboardShellProps {
    children: ReactNode;
    /** Sidebar links; defaults to `defaultDashboardNavigation`. */
    navigation?: DashboardNavItem[];
    logo?: {
        src: string;
        alt: string;
        href?: string;
    };
    exitDashboardHref?: string;
    exitDashboardLabel?: string;
    /** Extra className on the main content wrapper (inside `p-4`). */
    contentClassName?: string;
}

const DEFAULT_LOGO = {
    src: 'https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png',
    alt: 'Honey Lemon Logo',
    href: '/',
};

export default function DashboardShell({
    children,
    navigation = defaultDashboardNavigation,
    logo = DEFAULT_LOGO,
    exitDashboardHref = '/',
    exitDashboardLabel = 'Exit Dashboard',
    contentClassName = 'p-4',
}: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const logoHref = logo.href ?? '/';

    function renderSidebarChrome() {
        const navList = (
            <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={classNames(
                                    isActive
                                        ? 'bg-base-100 text-primary'
                                        : 'text-white hover:bg-base-100 hover:text-primary',
                                    'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                )}
                            >
                                <item.icon
                                    aria-hidden="true"
                                    className={classNames(
                                        isActive ? 'text-primary' : 'text-white group-hover:text-primary',
                                        'size-6 shrink-0',
                                    )}
                                />
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        );

        return (
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                    <Link href={logoHref}>
                        <Image
                            alt={logo.alt}
                            src={logo.src}
                            className="h-8 w-auto"
                            width={150}
                            height={100}
                        />
                    </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>{navList}</li>
                        <li className="mt-auto">
                            <a
                                href={exitDashboardHref}
                                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-white transition-colors hover:bg-base-100 hover:text-primary"
                            >
                                <ArrowRightEndOnRectangleIcon
                                    aria-hidden="true"
                                    className="size-6 shrink-0 text-white group-hover:text-primary"
                                />
                                {exitDashboardLabel}
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div>
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
                            {renderSidebarChrome()}
                        </DialogPanel>
                    </div>
                </Dialog>

                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    {renderSidebarChrome()}
                </div>

                <div className="lg:pl-72">
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-base-100 px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="-m-2.5 p-2.5 text-base-content lg:hidden"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:pl-72">
                <div className={contentClassName}>{children}</div>
            </div>
        </div>
    );
}
