import type { LucideIcon } from 'lucide-react';

import {
  dashboardSidebarNavIconActiveClass,
  dashboardSidebarNavIconIdleClass,
} from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface DashboardNavIconProps {
  icon: LucideIcon;
  isActive: boolean;
  inFlyout?: boolean;
  compact?: boolean;
  className?: string;
}

export function DashboardNavIcon({
  icon: Icon,
  isActive,
  inFlyout = false,
  compact = false,
  className,
}: DashboardNavIconProps) {
  const iconClass = cn(
    'shrink-0 stroke-[1.75]',
    compact ? 'size-[18px]' : 'size-4',
    isActive
      ? inFlyout
        ? 'text-accent stroke-[2]'
        : cn(dashboardSidebarNavIconActiveClass, 'stroke-[2]')
      : inFlyout
        ? 'text-muted group-hover:text-accent'
        : dashboardSidebarNavIconIdleClass,
  );

  if (inFlyout) {
    return <Icon className={cn(iconClass, className)} aria-hidden />;
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        compact ? 'size-9' : 'size-8',
        className,
      )}
    >
      <Icon className={iconClass} aria-hidden />
    </span>
  );
}
