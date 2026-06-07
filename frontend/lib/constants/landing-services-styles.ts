import { cn } from '@/lib/utils';

/** Accordion row label. */
export const landingServicesItemTitleClass = cn(
  'font-heading font-semibold text-foreground',
  'text-[0.9375rem] sm:text-[1rem]',
);

export const landingServicesItemBodyClass = cn(
  'font-body text-[0.875rem] leading-relaxed text-muted sm:text-[0.9375rem]',
);

export const landingServicesItemTriggerClass =
  'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4';

export const landingServicesItemPanelClass =
  'border-t border-border px-4 pb-4 sm:px-5 sm:pb-5';

export const landingServicesToggleIconClass =
  'flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground';
