import type { LucideIcon } from 'lucide-react';

import {
  appPanelPaddingClass,
  appPanelRadiusClass,
  gridCardsClass,
  gridStatsClass,
  typeH3,
  typeLead,
} from '@/lib/responsive';

/** Page content wrapper — padding is applied in app/dashboard/layout.tsx. */
export const dashboardShellClass = 'w-full min-w-0';

/** @deprecated Use dashboardShellClass */
export const dashboardPageShellClass = dashboardShellClass;

export const dashboardMainClass =
  'flex min-h-screen min-w-0 flex-1 flex-col bg-background w-full';

/** Top offset clears the fixed mobile menu button (lg+ has no offset). */
export const dashboardMainBodyClass =
  'flex w-full min-w-0 flex-1 flex-col pt-16 lg:pt-0';

export const dashboardPageHeaderStackClass =
  'mb-8 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-start sm:justify-between md:mb-10 2xl:mb-12 3xl:mb-12 4xl:mb-14';

export const dashboardSectionStackClass =
  'space-y-8 sm:space-y-9 md:space-y-10 lg:space-y-10 2xl:space-y-12 3xl:space-y-12 4xl:space-y-14';

export const dashboardStatGridClass =
  'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 lg:gap-6 xl:grid-cols-4 xl:gap-6 2xl:gap-7 3xl:gap-8 4xl:gap-9';

export const dashboardCardGridClass = gridCardsClass;

export const dashboardOverviewStatsGridClass = (columns: 3 | 4 = 4) =>
  `w-full min-w-0 ${gridStatsClass(columns)}`;

export const dashboardSidebarShellClass =
  'relative sticky top-0 z-50 shrink-0 self-start max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:z-50';

export const dashboardSidebarBaseClass =
  'flex h-screen max-h-screen flex-col overflow-hidden border-r border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar-bg)] text-[var(--dashboard-sidebar-fg)] transition-[width] duration-300 ease-in-out';

export const dashboardSidebarExpandedClass = 'w-64';

export const dashboardSidebarCollapsedClass = 'w-[4.5rem]';

/** @deprecated Use dashboardSidebarBaseClass + width class */
export const dashboardSidebarClass =
  `${dashboardSidebarBaseClass} ${dashboardSidebarExpandedClass} overflow-y-auto`;

export const dashboardSidebarDividerClass = 'border-[var(--dashboard-sidebar-border)]';

/** Aligns with the header block (pt-4 + logo row), sits on the sidebar edge. */
export const dashboardSidebarToggleClass =
  'pointer-events-auto absolute top-5 right-0 z-[60] hidden size-8 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg ring-2 ring-background transition-colors hover:bg-surface hover:text-accent lg:flex';

export const dashboardSidebarHeaderClass =
  'relative shrink-0 border-b px-3 pb-4 pt-4 border-[var(--dashboard-sidebar-border)]';

export const dashboardSidebarFlyoutClass =
  'absolute left-full top-0 z-50 ml-2 w-56 rounded-xl border border-border bg-card p-2 text-foreground shadow-lg';

export const dashboardSidebarNavItemActiveClass =
  'bg-[var(--dashboard-sidebar-active-bg)] font-semibold text-[var(--dashboard-sidebar-fg)] shadow-[inset_3px_0_0_0_var(--dashboard-sidebar-active-bar)] dark:text-foreground';

export const dashboardSidebarNavItemIdleClass =
  'text-[var(--dashboard-sidebar-fg-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)] dark:text-muted dark:hover:bg-surface dark:hover:text-foreground';

export const dashboardSidebarNavIconActiveClass = 'text-accent';

export const dashboardSidebarNavIconIdleClass =
  'text-[var(--dashboard-sidebar-fg-muted)] group-hover:text-[var(--dashboard-sidebar-fg)] dark:text-muted dark:group-hover:text-foreground';

export const dashboardSidebarNavGroupActiveClass =
  'font-semibold text-accent';

export const dashboardSidebarNavGroupIdleClass =
  'text-[var(--dashboard-sidebar-fg-muted)] hover:text-[var(--dashboard-sidebar-fg)] dark:text-muted dark:hover:text-foreground';

export const dashboardSidebarSignOutClass =
  'text-[var(--dashboard-sidebar-fg-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)] dark:text-destructive dark:hover:bg-destructive/10';

export const dashboardSidebarThemeToggleClass =
  'border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar-hover)] text-[var(--dashboard-sidebar-fg)] hover:opacity-90 dark:border-border dark:bg-surface dark:text-foreground dark:hover:bg-card dark:hover:text-accent';

export const dashboardMobileMenuButtonClass =
  'fixed left-3 top-3 z-[60] flex size-11 items-center justify-center rounded-xl border border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar-bg)] text-[var(--dashboard-sidebar-fg)] shadow-md transition-colors hover:opacity-90 lg:hidden dark:border-border dark:bg-card dark:text-foreground';

export const dashboardOverlayClass =
  'fixed inset-0 z-[45] bg-foreground/50 lg:hidden';

/** Vertical gap between sibling nav links in the dashboard sidebar. */
export const dashboardSidebarNavStackClass = 'space-y-1.5';

/** Gap between sidebar sections (overview block, nav groups, account). */
export const dashboardSidebarNavSectionClass = 'space-y-5';

export const dashboardNavItemClass =
  'group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors';

export const dashboardNavItemActiveClass =
  'bg-surface font-semibold text-foreground shadow-[inset_3px_0_0_0_var(--Gold)]';

export const dashboardNavItemIdleClass =
  'text-muted hover:bg-surface hover:text-foreground';

export const dashboardNavGroupLabelClass =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide transition-colors';

export const dashboardSegmentedControlClass =
  'flex rounded-xl border border-border bg-surface p-1';

export const dashboardSegmentActiveClass =
  'bg-primary text-white dark:bg-accent dark:text-primary';

export const dashboardSegmentIdleClass =
  'text-muted hover:bg-card hover:text-foreground';

export const dashboardTabActiveClass = 'bg-primary text-white';

export const dashboardTabIdleClass =
  'text-muted hover:bg-surface hover:text-foreground';

export const dashboardStatToneClass = {
  accent: { icon: 'text-accent', bg: 'bg-accent/10' },
  success: { icon: 'text-success', bg: 'bg-success/10' },
  warning: { icon: 'text-warning', bg: 'bg-warning/10' },
  primary: { icon: 'text-primary dark:text-foreground', bg: 'bg-primary/10 dark:bg-foreground/10' },
  destructive: { icon: 'text-destructive', bg: 'bg-destructive/10' },
  muted: { icon: 'text-muted', bg: 'bg-surface' },
} as const;

export type DashboardStatTone = keyof typeof dashboardStatToneClass;

export interface DashboardStatItem {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: LucideIcon;
  tone: DashboardStatTone;
}

export { typeH1 as dashboardPageTitleClass } from '@/lib/responsive';

export const dashboardPageDescriptionClass = `mt-2 ${typeLead}`;

export const dashboardSectionTitleClass = typeH3;

export const dashboardPanelClass =
  'rounded-lg border border-border/80 bg-surface p-5 sm:p-6';

export const dashboardCardClass =
  'rounded-lg border border-border/80 bg-card shadow-none';

export const dashboardPanelHeaderClass =
  'flex flex-col gap-2 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between';

export const dashboardEmptyStateClass =
  'flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-transparent px-6 py-14 text-center';

export const dashboardListRowClass =
  'rounded-lg border border-border/80 bg-card px-4 py-3 transition-colors hover:bg-muted/20';

export const dashboardInputSurfaceClass =
  'rounded-lg border border-border/80 bg-card text-foreground outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/20';

export const dashboardTableHeadClass = 'border-b border-border/80';

export const dashboardTableThClass =
  'px-5 py-3 text-left text-xs font-medium text-muted first:pl-5 last:pr-5';

export const dashboardTableTdClass =
  'px-5 py-3.5 align-middle text-sm text-foreground first:pl-5 last:pr-5';

export const dashboardTableRowClass =
  'transition-colors hover:bg-muted/25';

export const dashboardTableBodyClass = 'divide-y divide-border/60';

export const dashboardFilterTabsClass = 'flex gap-1 overflow-x-auto sm:gap-2';

export const dashboardFilterTabActiveClass =
  '-mb-px border-b-2 border-accent pb-3 font-semibold text-foreground';

export const dashboardFilterTabIdleClass =
  '-mb-px border-b-2 border-transparent pb-3 font-medium text-muted transition-colors hover:text-foreground';
