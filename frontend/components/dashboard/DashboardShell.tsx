import { cn } from '@/lib/utils';
import { dashboardShellClass } from '@/lib/constants/dashboard-layout';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return <div className={cn(dashboardShellClass, className)}>{children}</div>;
}
