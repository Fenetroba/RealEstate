/**
 * Responsive scale: sm → md → lg → xl → 2xl → 3xl → 4xl
 * Content width and type only grow (or plateau) — never shrink on larger viewports.
 */

/**
 * Shared horizontal padding for every page (landing, dashboard, properties, buy, etc.).
 * Keep `pageGutterTailwindClass` in sync — duplicate helps Tailwind emit all breakpoints.
 */
export const pageGutterClass =
  'px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 2xl:px-10 3xl:px-12 4xl:px-14';

export const pageGutterTailwindClass = pageGutterClass;

/** @deprecated Use pageGutterClass */
export const appGutterClass = pageGutterClass;

/**
 * Fluid max width via --app-content-max in globals.css (steps up each breakpoint).
 */
export const appContainerMaxClass = 'max-w-[var(--app-content-max)]';

export const appContainerClass = `mx-auto w-full min-w-0 ${appContainerMaxClass}`;

/** Centered page column with responsive side padding (replaces max-w-7xl + px-4 patterns). */
export const sitePageShellClass = `${appContainerClass} ${pageGutterClass} ${pageGutterTailwindClass}`;

/** Canonical page canvas — matches `<body>`; use on every route root wrapper. */
export const sitePageCanvasClass = 'min-h-screen bg-background';

/**
 * Intro / header copy — capped on small screens only; uses full content width from 2xl up
 * (fixed max-w-4xl/5xl was narrowing text on ultrawide vs the page shell).
 */
export const appProseMaxClass = 'w-full min-w-0 max-w-full';

/** Vertical section spacing */
export const appSectionYClass =
  'py-8 sm:py-9 md:py-10 lg:py-12 xl:py-14 2xl:py-14 3xl:py-14 4xl:py-16';

export const appShellYClass =
  'py-6 sm:py-8 md:py-9 lg:py-10 xl:py-11 2xl:py-12 3xl:py-12 4xl:py-14';

/** Rounded panels (dashboard cards, hero, inset shells) */
export const appPanelRadiusClass =
  'rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] 2xl:rounded-[2rem] 3xl:rounded-[2.25rem]';

export const appPanelPaddingClass =
  'p-5 sm:p-6 md:p-7 lg:p-8 xl:p-8 2xl:p-8 3xl:p-8 4xl:p-9';

/* ——— Typography (explicit rem — monotonic) ——— */

export const typeDisplay =
  'font-heading font-bold tracking-tight text-[1.75rem] leading-[1.1] sm:text-[2rem] md:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.75rem] 3xl:text-[4.25rem] 4xl:text-[4.75rem]';

export const typeH1 =
  'font-heading font-bold tracking-tight text-foreground text-[1.625rem] leading-tight sm:text-[1.875rem] md:text-[2rem] lg:text-[2.25rem] xl:text-[2.5rem] 2xl:text-[2.75rem] 3xl:text-[3rem] 4xl:text-[3.25rem]';

export const typeH2 =
  'font-heading font-semibold tracking-tight text-foreground text-[1.25rem] sm:text-[1.375rem] md:text-[1.5rem] lg:text-[1.625rem] xl:text-[1.75rem] 2xl:text-[1.875rem] 3xl:text-[2rem] 4xl:text-[2.125rem]';

export const typeH3 =
  'font-heading font-semibold text-foreground text-[1.125rem] sm:text-[1.125rem] md:text-[1.25rem] lg:text-[1.375rem] xl:text-[1.5rem] 2xl:text-[1.625rem] 3xl:text-[1.75rem] 4xl:text-[1.875rem]';

export const typeLead =
  'font-body text-muted text-[1rem] leading-relaxed sm:text-[1rem] md:text-[1.0625rem] lg:text-[1.125rem] xl:text-[1.125rem] 2xl:text-[1.1875rem] 3xl:text-[1.1875rem] 4xl:text-[1.25rem]';

export const typeBody =
  'font-body text-foreground text-[0.9375rem] leading-relaxed sm:text-[1rem] md:text-[1rem] lg:text-[1.0625rem] xl:text-[1.0625rem] 2xl:text-[1.125rem] 3xl:text-[1.125rem] 4xl:text-[1.1875rem]';

export const typeBodySm =
  'font-body text-muted text-[0.875rem] leading-relaxed sm:text-[0.875rem] md:text-[0.9375rem] lg:text-[1rem] xl:text-[1rem] 2xl:text-[1.0625rem] 3xl:text-[1.0625rem] 4xl:text-[1.125rem]';

export const typeLabel =
  'font-body text-[0.75rem] font-semibold uppercase tracking-wider text-accent sm:text-[0.75rem] md:text-[0.8125rem] lg:text-[0.8125rem] xl:text-[0.875rem] 2xl:text-[0.875rem] 3xl:text-[0.9375rem] 4xl:text-[0.9375rem]';

export const typeCaption =
  'font-body text-muted text-[0.75rem] leading-snug sm:text-[0.75rem] md:text-[0.8125rem] lg:text-[0.875rem] xl:text-[0.875rem] 2xl:text-[0.9375rem] 3xl:text-[0.9375rem] 4xl:text-[1rem]';

/** Large numeric stats (dashboard, hero bands) */
export const typeStatValue =
  'font-heading font-bold tracking-tight text-foreground text-[1.375rem] sm:text-[1.5rem] md:text-[1.625rem] lg:text-[1.75rem] xl:text-[2rem] 2xl:text-[2.25rem] 3xl:text-[2.5rem] 4xl:text-[2.75rem]';

export const typeStatLabel =
  'font-body text-muted text-[0.875rem] leading-snug sm:text-[0.875rem] md:text-[0.9375rem] lg:text-[1rem] xl:text-[1rem] 2xl:text-[1.0625rem] 3xl:text-[1.0625rem] 4xl:text-[1.125rem]';

/** Nav link / tab text */
export const typeNavLink =
  'font-body text-[0.875rem] font-medium sm:text-[0.875rem] md:text-[0.9375rem] lg:text-[1rem] xl:text-[1rem] 2xl:text-[1rem] 3xl:text-[1.0625rem] 4xl:text-[1.0625rem]';

/** Responsive stat grids */
export const gridStatsClass = (columns: 3 | 4 = 4) =>
  columns === 4
    ? 'grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 md:gap-x-10 lg:grid-cols-4 lg:gap-x-12 xl:gap-x-12 2xl:gap-x-12 3xl:gap-x-12 4xl:gap-x-14'
    : 'grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 md:gap-x-10 lg:grid-cols-3 lg:gap-x-12 xl:gap-x-12 2xl:gap-x-12 3xl:gap-x-12 4xl:gap-x-14';

export const gridCardsClass =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:gap-8 2xl:grid-cols-3 2xl:gap-8 3xl:grid-cols-4 3xl:gap-8 4xl:gap-9';
