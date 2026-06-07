import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import {
  dashboardStatToneClass,
  type DashboardStatItem,
} from '@/lib/constants/dashboard-layout';
import { typeStatLabel, typeStatValue } from '@/lib/responsive';
import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  stat: DashboardStatItem;
  className?: string;
}

export function DashboardStatCard({ stat, className }: DashboardStatCardProps) {
  const tone = dashboardStatToneClass[stat.tone];

  return (
    <Card bordered className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={typeStatLabel}>{stat.label}</p>
          <p className={cn(typeStatValue, 'mt-1')}>{stat.value}</p>
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              stat.positive ? 'text-success' : 'text-destructive',
            )}
          >
            {stat.positive ? (
              <ArrowUpRight className="size-3 shrink-0" />
            ) : (
              <ArrowDownRight className="size-3 shrink-0" />
            )}
            <span className="truncate">{stat.change}</span>
          </div>
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            tone.bg,
          )}
        >
          <stat.icon className={cn('size-5', tone.icon)} />
        </div>
      </div>
    </Card>
  );
}
