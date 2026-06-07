import {
  dashboardCardClass,
  dashboardPanelHeaderClass,
} from '@/lib/constants/dashboard-layout';
import { typeBodySm } from '@/lib/responsive';
import { cn } from '@/lib/utils';

interface DashboardPanelProps {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Bordered card shell for tables, feeds, and row lists. */
export function DashboardPanel({
  id,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: DashboardPanelProps) {
  const hasHeader = title || description || action;

  return (
    <div
      id={id}
      className={cn(dashboardCardClass, 'w-full min-w-0 overflow-hidden', className)}
    >
      {hasHeader ? (
        <div className={dashboardPanelHeaderClass}>
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            ) : null}
            {description ? <p className={cn(typeBodySm, 'mt-0.5 text-muted')}>{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}
