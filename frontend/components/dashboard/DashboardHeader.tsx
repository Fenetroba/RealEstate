import { cn } from '@/lib/utils';
import {
  dashboardPageDescriptionClass,
  dashboardPageHeaderStackClass,
  dashboardPageTitleClass,
} from '@/lib/constants/dashboard-layout';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({actions, className }: DashboardHeaderProps) {
  return (
    <div className={cn(dashboardPageHeaderStackClass, className)}>
      <div className="min-w-0 text-[14px] pt-5">
    
       
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
