'use client';

import type { ReactNode } from 'react';

import {
  adminSectionClass,
  adminSectionHeaderClass,
  adminSectionSubtitleClass,
  adminSectionTitleClass,
} from '@/lib/constants/admin-panel';
import { cn } from '@/lib/utils';

interface AdminSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminSection({ title, subtitle, action, children, className }: AdminSectionProps) {
  return (
    <section className={cn(adminSectionClass, className)}>
      <div className={adminSectionHeaderClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={adminSectionTitleClass}>{title}</h2>
            {subtitle ? <p className={adminSectionSubtitleClass}>{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
