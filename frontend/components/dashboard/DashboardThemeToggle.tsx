'use client';

import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme } from '@/store/slices/uiSlice';

export function DashboardThemeToggle({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-card hover:text-accent',
        className,
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="size-4 text-accent" /> : <Moon className="size-4" />}
    </button>
  );
}
