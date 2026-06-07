import { dashboardOverviewStatsGridClass } from '@/lib/constants/dashboard-layout';
import { typeStatLabel, typeStatValue } from '@/lib/responsive';
import { cn } from '@/lib/utils';

export interface DashboardOverviewStat {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

interface DashboardOverviewStatsProps {
  stats: DashboardOverviewStat[];
  className?: string;
}

export function DashboardOverviewStats({ stats, className }: DashboardOverviewStatsProps) {
  const columnCount = stats.length > 3 ? 4 : 3;

  return (
    <div className={cn(dashboardOverviewStatsGridClass(columnCount), className)}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            'text-left',
            index > 0 && 'lg:border-l lg:border-border lg:pl-8 xl:pl-8 2xl:pl-10 3xl:pl-10 4xl:pl-10',
          )}
        >
          <p className={cn(typeStatValue, 'text-foreground')}>{stat.value}</p>
          <p className={cn(typeStatLabel, 'mt-1 text-muted')}>{stat.label}</p>
          {stat.change ? (
            <p
              className={cn(
                'mt-1 text-xs text-muted',
                stat.positive === false && 'text-destructive',
                stat.positive === true && 'text-foreground',
              )}
            >
              {stat.change}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
