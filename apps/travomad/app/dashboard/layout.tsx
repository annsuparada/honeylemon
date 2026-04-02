'use client';

import type { ReactNode } from 'react';
import { DashboardShell } from '@honeylemon/ui';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <DashboardShell>{children}</DashboardShell>;
}
