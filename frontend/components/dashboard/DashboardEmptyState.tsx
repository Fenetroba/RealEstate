import type { LucideIcon } from 'lucide-react';

import { dashboardEmptyStateClass } from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div className={cn(dashboardEmptyStateClass, className)}>
      <Icon className="mb-4 size-12 text-muted" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
