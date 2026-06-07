import {
  dashboardFilterTabActiveClass,
  dashboardFilterTabIdleClass,
  dashboardFilterTabsClass,
} from '@/lib/constants/dashboard-layout';
import { typeNavLink } from '@/lib/responsive';
import { cn } from '@/lib/utils';

export interface DashboardFilterTabOption {
  id: string;
  label: string;
  count?: number;
}

interface DashboardFilterTabsProps {
  options: DashboardFilterTabOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function DashboardFilterTabs({
  options,
  value,
  onChange,
  className,
}: DashboardFilterTabsProps) {
  return (
    <div className={cn('border-b border-border', className)}>
      <div className={dashboardFilterTabsClass} role="tablist">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.id)}
              className={cn(
                typeNavLink,
                'shrink-0 px-2 sm:px-3',
                active ? dashboardFilterTabActiveClass : dashboardFilterTabIdleClass,
              )}
            >
              {option.label}
              {option.count !== undefined ? (
                <span className="ml-1.5 text-muted">({option.count})</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
