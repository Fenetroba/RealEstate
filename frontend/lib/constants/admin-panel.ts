/** Basis points → percent label (e.g. 200 → "2%"). */
export function formatCommissionBps(bps: number): string {
  if (!Number.isFinite(bps) || bps < 0) return '—';
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 1)}%`;
}

export const adminSectionClass =
  'rounded-2xl border border-border bg-card overflow-hidden';

export const adminSectionHeaderClass =
  'border-b border-border bg-violet-500/5 px-5 py-4 sm:px-6';

export const adminSectionTitleClass =
  'font-heading text-base font-semibold text-foreground';

export const adminSectionSubtitleClass = 'mt-1 text-sm text-muted';
