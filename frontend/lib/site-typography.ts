import {
  typeBodySm,
  typeH1,
  typeH2,
  typeH3,
  typeLabel,
  typeLead,
  typeStatLabel,
  typeStatValue,
} from '@/lib/responsive';
import { cn } from '@/lib/utils';

/** Re-export scale tokens used via this module. */
export { typeBodySm, typeH1, typeH3, typeLabel, typeLead, typeStatLabel, typeStatValue };

/** Gold bar + eyebrow row (landing sections, invest/market headings). */
export const siteEyebrowRowClass = 'mb-2 flex items-center gap-2';
export const siteEyebrowBarClass = 'h-px w-6 shrink-0 rounded-full bg-accent/80';

/** Landing / marketing section headings — one scale sitewide on the home page. */
export const siteSectionTitleClass = cn(
  'font-heading font-semibold tracking-tight text-foreground',
  'text-[1.125rem] leading-snug sm:text-[1.25rem] md:text-[1.375rem] lg:text-[1.5rem]',
);

/** Eyebrow above section titles — smaller and lighter than `typeLabel`. */
export const siteSectionEyebrowClass = cn(
  'font-body font-normal uppercase tracking-[0.14em] text-accent',
  'text-[0.625rem] sm:text-[0.6875rem] md:text-[0.75rem]',
);

export const siteSectionLeadClass = cn(typeLead, 'mt-2');

/** Page title block (profile, dashboard-style pages). */
export const sitePageTitleClass = typeH1;
export const sitePageLeadClass = cn(typeLead, 'mt-1');

/** Navy / gradient hero panels. */
export const siteHeroTitleClass = cn(typeH1, 'text-white');
export const siteHeroLeadClass = cn(typeLead, 'max-w-2xl text-white/70');
export const siteHeroLeadCenterClass = cn(typeLead, 'mx-auto max-w-2xl text-white/70');

/** Section heading with gold bar (invest, market subsections). */
export const siteSectionHeadingRowClass = 'mb-6 flex items-center gap-3';
export const siteSectionHeadingTitleClass = typeH2;

export const siteCardTitleClass = typeH3;
export const siteBodyMutedClass = typeBodySm;
