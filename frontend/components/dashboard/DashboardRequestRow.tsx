import { MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { typeBodySm, typeCaption } from '@/lib/responsive';
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';

interface DashboardRequestRowProps {
  propertyTitle: string;
  propertyImage: string;
  propertyLocation: string;
  typeLabel: string;
  status: string;
  statusVariant: 'success' | 'warning' | 'danger' | 'default' | 'gold' | 'verified';
  statusIcon?: React.ReactNode;
  amount: number;
  submittedAt: string;
  lastUpdate: string;
  message?: string;
  detailHref?: string;
  contactEmail?: string;
  className?: string;
}

export function DashboardRequestRow({
  propertyTitle,
  propertyImage,
  propertyLocation,
  typeLabel,
  status,
  statusVariant,
  statusIcon,
  amount,
  submittedAt,
  lastUpdate,
  message,
  detailHref = '#',
  contactEmail,
  className,
}: DashboardRequestRowProps) {
  return (
    <article
      className={cn(
        'group flex w-full min-w-0 flex-col gap-4 border-b border-border/60 px-5 py-4 last:border-b-0 sm:flex-row sm:items-stretch sm:gap-6',
        className,
      )}
    >
      <div className="relative shrink-0 overflow-hidden rounded-xl border border-border sm:w-36 md:w-40">
        <img
          src={propertyImage}
          alt={propertyTitle}
          className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-full sm:min-h-[7rem]"
        />
        <Badge variant="gold" size="sm" className="absolute left-2 top-2 shadow-sm">
          {typeLabel}
        </Badge>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{propertyTitle}</h3>
            <Badge variant={statusVariant} size="sm">
              {statusIcon}
              {status}
            </Badge>
          </div>
          <p className={cn(typeBodySm, 'mt-1 flex items-center gap-1')}>
            <MapPin className="size-3.5 shrink-0" />
            {propertyLocation}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            <div>
              <dt className={typeCaption}>Offer</dt>
              <dd className="font-semibold text-foreground">{formatCurrency(amount)}</dd>
            </div>
            <div>
              <dt className={typeCaption}>Submitted</dt>
              <dd className="text-foreground">{new Date(submittedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className={typeCaption}>Updated</dt>
              <dd className="text-foreground">{formatRelativeTime(lastUpdate)}</dd>
            </div>
          </dl>
          {message ? (
            <p
              className={cn(
                typeBodySm,
                'mt-3 rounded-lg border-l-2 border-accent bg-surface/80 px-3 py-2 italic',
              )}
            >
              {message}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Button href={detailHref} variant="outline" size="sm" className="w-full sm:w-auto">
            View details
          </Button>
          <Button
            href={contactEmail ? `mailto:${contactEmail}` : undefined}
            type="button"
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            disabled={!contactEmail}
          >
            Contact
          </Button>
        </div>
      </div>
    </article>
  );
}
