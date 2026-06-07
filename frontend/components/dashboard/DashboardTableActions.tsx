'use client';

import { cn } from '@/lib/utils';

interface DashboardTableActionsProps {
  children: React.ReactNode;
  className?: string;
}

/** Right-aligned action group for table rows. */
export function DashboardTableActions({ children, className }: DashboardTableActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>{children}</div>
  );
}

interface DashboardTableActionProps {
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'accent';
  icon: React.ReactNode;
}

/** Minimal icon action — use for view, edit, download, etc. */
export function DashboardTableAction({
  label,
  onClick,
  href,
  external,
  disabled,
  variant = 'default',
  icon,
}: DashboardTableActionProps) {
  const className = cn(
    'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
    'disabled:pointer-events-none disabled:opacity-40',
    variant === 'default' && 'hover:bg-muted/40 hover:text-foreground',
    variant === 'danger' && 'hover:bg-destructive/10 hover:text-destructive',
    variant === 'accent' && 'hover:bg-accent/10 hover:text-accent',
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={className}
        title={label}
        aria-label={label}
      >
        {icon}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

interface DashboardTableTextActionProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/** Compact text action (e.g. Review). */
export function DashboardTableTextAction({
  label,
  onClick,
  disabled,
  icon,
}: DashboardTableTextActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border/80 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors',
        'hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        'disabled:pointer-events-none disabled:opacity-40',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
