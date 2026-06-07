import { dashboardCardClass } from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface DashboardEntityCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/** Single record card — maintenance requests, approval cases, etc. */
export function DashboardEntityCard({ children, className, onClick }: DashboardEntityCardProps) {
  const Comp = onClick ? 'button' : 'article';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        dashboardCardClass,
        'w-full p-5 text-left transition-colors',
        onClick && 'cursor-pointer hover:border-border hover:bg-muted/20',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
