import { dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface DashboardFiltersBarProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardFiltersBar({ children, className }: DashboardFiltersBarProps) {
  return (
    <div className={cn(dashboardPanelClass, 'mb-6 !p-4 sm:!p-5', className)}>
      <div className="flex w-full min-w-0 flex-row flex-nowrap items-center gap-4 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
