import {
  dashboardStatGridClass,
  type DashboardStatItem,
} from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

import { DashboardStatCard } from './DashboardStatCard';

interface DashboardStatGridProps {
  stats: DashboardStatItem[];
  className?: string;
}

export function DashboardStatGrid({ stats, className }: DashboardStatGridProps) {
  return (
    <div className={cn(dashboardStatGridClass, className)}>
      {stats.map((stat) => (
        <DashboardStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
