import {
  appPanelRadiusClass,
  pageGutterTailwindClass,
  sitePageShellClass,
} from '@/lib/responsive';
import { cn } from '@/lib/utils';

/** Browse + detail pages — clears fixed nav, matches site gutters */
export const propertiesPageShellClass = cn(
  sitePageShellClass,
  pageGutterTailwindClass,
  'pt-[calc(var(--site-nav-header-height,4.5rem)+1rem)] pb-8',
  'sm:pt-[calc(var(--site-nav-header-height,5rem)+1.5rem)] sm:pb-10',
  'md:pb-12 lg:pb-12 xl:pb-14',
  '2xl:pb-14 3xl:pb-16 4xl:pb-16',
);

/** Rounded primary panel at top of browse / detail */
export const propertiesHeroPanelClass = cn(
  appPanelRadiusClass,
  'border border-border bg-primary p-6 sm:p-8 dark:bg-card',
);

/**
 * One card cell on /properties (2xl: 20rem sidebar + gap-8 + 3-col gap-6;
 * 3xl/4xl: 22rem sidebar). Use on landing featured row so sizes match the listing grid.
 */
export const propertyListingCardWidthClass = cn(
  'w-[min(85vw,320px)] shrink-0',
  'sm:w-[340px]',
  'lg:w-[360px]',
  '2xl:w-[calc((100%-25rem)/3)]',
  '3xl:w-[calc((100%-27rem)/3)]',
  '4xl:w-[calc((100%-27rem)/3)]',
);

/** Horizontal row gap — aligns with property grid gap-6 from 2xl up */
export const propertyListingCardRowGapClass =
  'gap-5 sm:gap-6 2xl:gap-6 3xl:gap-6 4xl:gap-6';
