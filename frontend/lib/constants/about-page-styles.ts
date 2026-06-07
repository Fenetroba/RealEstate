import {
  appPanelRadiusClass,
  sitePageShellClass,
  typeBody,
  typeBodySm,
  typeH1,
  typeH2,
  typeH3,
  typeLead,
} from '@/lib/responsive';
import { cn } from '@/lib/utils';

/** Horizontal shell only — top offset applied separately so bg sits behind fixed nav */
export const aboutPageShellClass = cn(
  sitePageShellClass,
  'w-full min-w-0',
  'pb-8 sm:pb-10 md:pb-12 lg:pb-12 xl:pb-14 2xl:pb-14 3xl:pb-16 4xl:pb-16',
);

/** Clears fixed navbar; page background extends underneath */
export const aboutPageContentTopClass = cn(
  'pt-[calc(var(--site-nav-header-height,4.5rem)+1rem)]',
  'sm:pt-[calc(var(--site-nav-header-height,5rem)+1.5rem)]',
);

export const aboutPageTitleClass = cn(typeH1, 'text-center text-foreground');

export const aboutPageLeadClass = cn(
  typeLead,
  'mx-auto max-w-4xl text-center text-muted',
  'sm:max-w-5xl lg:max-w-6xl 2xl:max-w-7xl',
);

export const aboutPageLeadHighlightClass = 'font-semibold text-foreground';

export const aboutSectionTitleClass = cn(typeH2, 'text-foreground');

export const aboutCardTitleClass = cn(typeH3, 'text-foreground');

export const aboutBodyTextClass = cn(typeBody, 'leading-relaxed text-muted');

export const aboutBenefitNumberClass = cn(aboutSectionTitleClass, 'shrink-0 tabular-nums');

export const aboutHeaderTitleSpacing = 'mb-6 text-center sm:mb-8 xl:mb-10 2xl:mb-12';

export const aboutHeaderLeadSpacing =
  'mb-10 text-center sm:mb-12 xl:mb-16 2xl:mb-20 3xl:mb-20 4xl:mb-24';

export const aboutBenefitsHeadingSpacing =
  'mb-10 text-center sm:mb-12 md:mb-16 xl:mb-16 2xl:mb-20';

export const aboutBenefitRowClass = cn(
  'flex w-full flex-col items-center gap-6 py-10 sm:gap-8 sm:py-12',
  'md:py-16 lg:gap-12',
);

export const aboutBenefitRowPadding = 'w-full flex-1 px-4 sm:px-6 lg:px-0';

export const aboutBenefitDividerClass = 'w-full border-b border-border';

export const aboutVisualPanelClass = cn(
  appPanelRadiusClass,
  'flex aspect-video w-full flex-col items-center justify-center gap-4',
  'border border-border bg-linear-to-br from-primary/8 via-card to-accent/10',
  'p-8 text-center dark:from-primary/20 dark:via-card dark:to-accent/5',
  'sm:p-10 xl:p-12',
);

export const aboutVisualIconWrapClass = cn(
  'flex size-16 items-center justify-center rounded-2xl',
  'bg-accent/15 text-accent sm:size-20 xl:size-24',
);

export const aboutVisualLabelClass = cn(typeBodySm, 'max-w-xs font-medium text-foreground');

export const aboutCtaSectionClass = cn(
  'mt-12 border-t border-border pt-10 text-center sm:mt-16 sm:pt-12',
  'xl:mt-20 xl:pt-14 2xl:mt-24',
);
