import type { LucideIcon } from 'lucide-react';

import { propertyDetailCopy, propertyDetailLayout } from '@/lib/constants/property-detail';
import {
  getPropertyPrimaryHighlightStats,
  getPropertySecondaryHighlightStats,
  type PropertyHighlightStat,
} from '@/lib/property-detail';
import { typeBodySm, typeH3 } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyDetailHighlightStripProps {
  property: Property;
  className?: string;
}

function PrimaryStat({ icon: Icon, label, value, unit }: PropertyHighlightStat) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-5 text-center sm:px-6 sm:py-6">
      <Icon className="mb-2 size-5 text-accent sm:size-6" aria-hidden />
      <div className="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0">
        <span className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl 2xl:text-[2rem]">
          {value}
        </span>
        {unit ? (
          <span className={cn(typeBodySm, 'font-medium text-muted')}>{unit}</span>
        ) : null}
      </div>
      <span className={cn(typeBodySm, 'mt-1.5 font-semibold text-muted')}>{label}</span>
    </div>
  );
}

function SecondaryStat({ icon: Icon, label, value, unit }: PropertyHighlightStat) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border/80 bg-card px-3 py-2.5 sm:px-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className={cn(typeBodySm, 'text-muted')}>{label}</p>
        <p className="flex flex-wrap items-baseline gap-x-1">
          <span className={cn(typeH3, 'text-foreground')}>{value}</span>
          {unit ? <span className={cn(typeBodySm, 'text-muted')}>{unit}</span> : null}
        </p>
      </div>
    </div>
  );
}

/** Key facts below the gallery — primary metrics + supporting details. */
export default function PropertyDetailHighlightStrip({
  property,
  className,
}: PropertyDetailHighlightStripProps) {
  const primary = getPropertyPrimaryHighlightStats(property);
  const secondary = getPropertySecondaryHighlightStats(property);

  return (
    <div
      className={cn(propertyDetailLayout.highlightPad, 'p-0', className)}
      aria-label="Property highlights"
    >
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {primary.map((stat) => (
          <PrimaryStat key={stat.label} {...stat} />
        ))}
      </div>

      {secondary.length > 0 && (
        <div className="border-t border-border bg-surface/40 px-3 py-4 sm:px-5 sm:py-4 2xl:px-6">
          <p className={cn(typeBodySm, 'mb-3 font-semibold uppercase tracking-wide text-muted')}>
            {propertyDetailCopy.highlightsTitle}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-3 3xl:grid-cols-4 4xl:gap-4">
            {secondary.map((stat) => (
              <SecondaryStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
