import {
  dashboardTableBodyClass,
  dashboardTableHeadClass,
  dashboardTableRowClass,
  dashboardTableTdClass,
  dashboardTableThClass,
} from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';

interface DashboardDataTableProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

export function DashboardDataTable({
  children,
  className,
  minWidth = 'min-w-[40rem]',
}: DashboardDataTableProps) {
  return (
    <div className={cn('w-full overflow-x-auto [-webkit-overflow-scrolling:touch]', className)}>
      <table className={cn('w-full border-collapse text-sm', minWidth)}>{children}</table>
    </div>
  );
}

export function DashboardTableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <thead className={cn(dashboardTableHeadClass, className)}>{children}</thead>;
}

export function DashboardTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={cn(dashboardTableBodyClass, className)}>{children}</tbody>;
}

export function DashboardTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={cn(dashboardTableRowClass, className)}>{children}</tr>;
}

export function DashboardTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn(dashboardTableThClass, className)}>{children}</th>;
}

export function DashboardTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn(dashboardTableTdClass, className)}>{children}</td>;
}
