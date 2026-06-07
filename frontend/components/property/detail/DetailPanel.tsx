import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { propertyDetailLayout } from '@/lib/constants/property-detail';
import { cn } from '@/lib/utils';

interface DetailPanelProps {
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DetailPanel({
  title,
  icon: Icon,
  children,
  className,
  bodyClassName,
}: DetailPanelProps) {
  return (
    <section className={cn(propertyDetailLayout.panel, className)}>
      {title ? (
        <div className={propertyDetailLayout.panelHeader}>
          {Icon ? (
            <Icon
              className="size-4 shrink-0 text-accent 2xl:size-[1.125rem] 4xl:size-5"
              aria-hidden
            />
          ) : null}
          <h2 className={propertyDetailLayout.panelTitle}>{title}</h2>
        </div>
      ) : null}
      <div className={cn(propertyDetailLayout.panelBody, bodyClassName)}>{children}</div>
    </section>
  );
}

export function DetailFactGrid({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className={propertyDetailLayout.factGrid}>
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className={propertyDetailLayout.factLabel}>{fact.label}</dt>
          <dd className={cn(propertyDetailLayout.factValue, 'mt-0.5')}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailEmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-5 2xl:px-5 2xl:py-6">
      <Icon className="size-5 shrink-0 text-muted 2xl:size-6" aria-hidden />
      <p className="text-sm text-muted 2xl:text-base">{message}</p>
    </div>
  );
}
