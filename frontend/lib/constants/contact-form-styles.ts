import {
  appPanelPaddingClass,
  appPanelRadiusClass,
  sitePageShellClass,
  typeBodySm,
  typeH1,
  typeH2,
  typeH3,
  typeLead,
} from '@/lib/responsive';
import { cn } from '@/lib/utils';

/** Horizontal shell only — top offset applied separately so bg sits behind fixed nav */
export const contactPageShellClass = cn(
  sitePageShellClass,
  'w-full min-w-0',
  'pb-8 sm:pb-10 md:pb-12 lg:pb-12 xl:pb-14 2xl:pb-14 3xl:pb-16 4xl:pb-16',
);

/** Clears fixed navbar; page background extends underneath */
export const contactPageContentTopClass = cn(
  'pt-[calc(var(--site-nav-header-height,4.5rem)+1rem)]',
  'sm:pt-[calc(var(--site-nav-header-height,5rem)+1.5rem)]',
);

export const contactPageTitleClass = cn(typeH1, 'text-center text-foreground');

export const contactPageDescriptionClass = cn(
  typeLead,
  'mx-auto max-w-3xl text-center text-muted',
  'sm:max-w-4xl lg:max-w-5xl 2xl:max-w-6xl',
);

export const contactSectionTitleClass = cn(typeH2, 'text-foreground');

export const contactCardTitleClass = cn(typeH3, 'text-foreground');

export const contactBodyTextClass = cn(typeBodySm, 'text-muted');

export const contactFormPanelClass = cn(
  appPanelRadiusClass,
  'border border-border bg-card shadow-sm',
  'p-6 sm:p-8 xl:p-10 2xl:p-12 3xl:p-12 4xl:p-14',
);

export const contactFormStackClass =
  'space-y-6 xl:space-y-8 2xl:space-y-10 3xl:space-y-10';

export const contactFormRowClass =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:gap-6 2xl:gap-7';

export const contactTextareaClass = cn(
  'w-full min-h-[10rem] resize-none rounded-lg border border-border bg-card px-4 py-3',
  'text-sm text-foreground placeholder:text-muted',
  'transition-all duration-200',
  'hover:border-accent/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'xl:min-h-[11rem] 2xl:min-h-[12rem]',
);

export const contactFormCtaClass = 'w-full sm:w-auto';

export const contactInfoCardClass = cn(
  appPanelRadiusClass,
  'border border-border bg-surface/80',
  'p-4 sm:p-5 xl:p-6 2xl:p-7',
);

export const contactIconBoxClass = cn(
  'flex size-10 shrink-0 items-center justify-center rounded-xl',
  'bg-accent/15 text-accent',
  'xl:size-11 2xl:size-12',
);

export const contactIconClass = 'size-5 xl:size-5 2xl:size-6';

export const contactGridClass = cn(
  'grid grid-cols-1 gap-8',
  'lg:grid-cols-2 lg:gap-12',
  'xl:gap-16 2xl:gap-20 3xl:gap-20 4xl:gap-24',
);

export const contactInfoGridClass = cn(
  'mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2',
  'xl:mb-10 xl:gap-6 2xl:mb-12 2xl:gap-8 3xl:gap-9 4xl:gap-10',
);

export const contactHeaderTitleSpacing = 'mb-6 text-center sm:mb-8 xl:mb-10 2xl:mb-12';

export const contactHeaderLeadSpacing =
  'mb-10 text-center sm:mb-12 xl:mb-16 2xl:mb-20 3xl:mb-20 4xl:mb-24';
