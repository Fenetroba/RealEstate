'use client';

import { Suspense } from 'react';

import { AdminPreviewHydrator } from '@/components/dashboard/AdminPreviewHydrator';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {
  dashboardMainBodyClass,
  dashboardMainClass,
} from '@/lib/constants/dashboard-layout';
import { appGutterClass, appShellYClass, pageGutterTailwindClass } from '@/lib/responsive';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-start bg-background">
      <Suspense fallback={null}>
        <AdminPreviewHydrator />
      </Suspense>
      <DashboardSidebar />
      <main className={cn(dashboardMainClass, 'min-w-0 flex-1 overflow-x-hidden')}>
        <div
          className={cn(
            dashboardMainBodyClass,
            appGutterClass,
            pageGutterTailwindClass,
            appShellYClass,
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
