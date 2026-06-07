import { cn } from '@/lib/utils';

/** Shared focus ring — all Button variants */
export const buttonFocusClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Base layout — keep in sync with `components/ui/Button.tsx` */
export const buttonBaseClass = cn(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
  'transition-colors duration-150',
  buttonFocusClass,
  'disabled:pointer-events-none disabled:opacity-40',
);
