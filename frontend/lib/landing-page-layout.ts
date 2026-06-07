import {
  appContainerClass,
  appContainerMaxClass,
  pageGutterClass,
  pageGutterTailwindClass,
  appPanelPaddingClass,
  appPanelRadiusClass,
} from '@/lib/responsive';

export const landingPageContentMaxClass = appContainerMaxClass;
export const landingPageGutterClass = pageGutterClass;
export const landingPageGutterTailwindClass = pageGutterTailwindClass;
export const landingSectionInnerClass = appContainerClass;

/** Uniform vertical padding for every landing block in `<main>`, CTA, and footer inset. */
export const landingSectionPadYClass = 'py-16 md:py-20 lg:py-24';

/** Bottom padding under the hero so the gap into the first section matches section rhythm. */
export const landingHeroPadBottomClass = 'pb-16 md:pb-20 lg:pb-24';

/** Space below section title / eyebrow rows. */
export const landingSectionHeaderMbClass = 'mb-10 sm:mb-12 lg:mb-14';

/** Top border between stacked landing sections. */
export const landingSectionDividerClass = 'border-t border-border';

/** Default `<section>` shell for landing content blocks. */
export const landingSectionClass = `${landingSectionDividerClass} ${landingSectionPadYClass}`;

/** Centered column + horizontal gutters (Featured, Why EDENET, etc.). */
export const landingMainInnerClass = `${landingSectionInnerClass} ${pageGutterClass} ${pageGutterTailwindClass} min-w-0`;

/** Bento / card grids inside landing sections. */
export const landingSectionGridGapClass = 'gap-5 md:gap-6';

/** Page backdrop behind inset cards (CTA + footer). */
export const landingPageInsetWrapClass =
  `${pageGutterClass} ${pageGutterTailwindClass} bg-[color:var(--inset-wrap-bg)]`;

/** Shared rounded card shell — one bg token per theme (light navy, dark card). */
const landingPageInsetShellBaseClass =
  `mx-auto ${appPanelRadiusClass} bg-[color:var(--inset-shell-bg)]`;

export const landingPageCardShellClass =
  `${landingPageInsetShellBaseClass} ${appPanelPaddingClass}`;

export const landingPageCtaShellClass =
  `${landingPageInsetShellBaseClass} px-4 py-10 sm:px-5 sm:py-11 md:px-5 md:py-12 lg:px-6 lg:py-14 xl:px-6 xl:py-14 2xl:px-6 2xl:py-14 3xl:px-7 3xl:py-14 4xl:px-7 4xl:py-16`;

export const landingPageInsetTitleClass = 'text-[color:var(--cta-on-gradient-text)]';
export const landingPageInsetMutedClass = 'text-[color:var(--cta-on-gradient-muted)]';

/** Why EDENET bento — navy in light, card (#111) in dark (same as CTA shell). */
export const landingBentoAccentBgClass = 'bg-[color:var(--inset-shell-bg)]';
export const landingBentoImageOverlayClass =
  'bg-linear-to-t from-[color:var(--inset-shell-bg)]/90 via-[color:var(--inset-shell-bg)]/35 to-[color:var(--inset-shell-bg)]/10';
export const landingBentoSplitImageOverlayClass =
  'bg-linear-to-l from-[color:var(--inset-shell-bg)]/80 via-[color:var(--inset-shell-bg)]/25 to-transparent sm:from-[color:var(--inset-shell-bg)]/90';
export const landingPageInsetSubtleClass = 'text-[color:var(--cta-on-gradient-subtle)]';
export const landingPageInsetHeadingClass = 'text-[color:var(--cta-on-gradient-heading)]';
export const landingPageInsetDividerClass = 'border-[color:var(--cta-divider)]';
export const landingPageInsetInteractiveBorderClass = 'border-[color:var(--cta-interactive-border)]';
