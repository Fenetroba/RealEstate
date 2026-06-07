import { dashboardCardClass } from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface DashboardFeedListProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardFeedList({ children, className }: DashboardFeedListProps) {
  return (
    <div
      className={cn(
        dashboardCardClass,
        'w-full min-w-0 divide-y divide-border/60 overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface DashboardFeedItemProps {
  children: React.ReactNode;
  className?: string;
  unread?: boolean;
  onClick?: () => void;
}

export function DashboardFeedItem({
  children,
  className,
  unread,
  onClick,
}: DashboardFeedItemProps) {
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full gap-4 px-5 py-4 text-left transition-colors sm:py-4',
        unread && 'bg-muted/30',
        onClick && 'cursor-pointer hover:bg-muted/25',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
