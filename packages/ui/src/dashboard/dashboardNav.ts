import type { FC, SVGProps } from 'react';
import {
    ArrowTrendingUpIcon,
    CalendarIcon,
    DocumentPlusIcon,
    EnvelopeIcon,
    HomeIcon,
    SparklesIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

export type DashboardNavIcon = FC<SVGProps<SVGSVGElement>>;

export interface DashboardNavItem {
    name: string;
    href: string;
    icon: DashboardNavIcon;
}

/** Default admin sidebar links (Honey Lemon / Travomad CMS). Override via `DashboardShell` `navigation` prop. */
export const defaultDashboardNavigation: DashboardNavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Blogs', href: '/dashboard/blogs', icon: DocumentPlusIcon },
    { name: 'AI Content Generator', href: '/dashboard/ai-generate', icon: SparklesIcon },
    { name: 'Scheduled Publishing', href: '/dashboard/scheduled', icon: CalendarIcon },
    { name: 'SEO Keywords', href: '/dashboard/seo', icon: ArrowTrendingUpIcon },
    { name: 'Email', href: '/dashboard/email', icon: EnvelopeIcon },
    { name: 'Your Profile', href: '/dashboard/profile', icon: UserIcon },
];
