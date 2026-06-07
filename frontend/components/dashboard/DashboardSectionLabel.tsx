import { typeLabel } from '@/lib/responsive';
import { cn } from '@/lib/utils';

interface DashboardSectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardSectionLabel({ children, className }: DashboardSectionLabelProps) {
  return <span className={cn(typeLabel, className)}>{children}</span>;
}
