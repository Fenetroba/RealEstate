'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { DashboardEntityCard } from '@/components/dashboard/DashboardEntityCard';
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import {
  formatPropertyTypeLabel,
  formatRequestPrice,
  requestStatusHelp,
} from '@/lib/registry-request-labels';
import { typeBodySm } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import type { RegistryRequest } from '@/types/registry-request';

interface RequestCardProps {
  request: RegistryRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const isDeclined = request.status === 2;
  const isApproved = request.status === 1;

  return (
    <DashboardEntityCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-heading text-base font-semibold text-foreground">{request.name}</h3>
            <RequestStatusBadge status={request.status} className="shrink-0" />
          </div>

          <p className={cn(typeBodySm, 'flex items-center gap-1.5')}>
            <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden />
            <span className="truncate">
              {request.location}
              <span className="text-muted"> · </span>
              {formatPropertyTypeLabel(request.propertyType)}
            </span>
          </p>

          <p className="font-heading text-sm font-semibold text-accent">
            {formatRequestPrice(request.priceEth)}
            <span className="ml-2 font-body text-xs font-normal text-muted">
              Request #{request.id}
            </span>
          </p>

          {(request.bedrooms > 0 || request.bathrooms > 0 || request.sqft > 0) && (
            <p className="text-xs text-muted">
              {request.bedrooms > 0 ? `${request.bedrooms} bed` : null}
              {request.bedrooms > 0 && request.bathrooms > 0 ? ' · ' : null}
              {request.bathrooms > 0 ? `${request.bathrooms} bath` : null}
              {(request.bedrooms > 0 || request.bathrooms > 0) && request.sqft > 0 ? ' · ' : null}
              {request.sqft > 0 ? `${request.sqft.toLocaleString()} sqft` : null}
            </p>
          )}

          <p className="text-xs leading-relaxed text-muted">{requestStatusHelp(request.status)}</p>
        </div>
      </div>

      {isDeclined && request.declineReason ? (
        <div className="mt-4 rounded-lg border border-red-200/80 bg-red-50/80 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/25">
          <p className="text-xs font-medium text-red-800 dark:text-red-300">Decline reason</p>
          <p className="mt-1 text-sm leading-relaxed text-red-900/90 dark:text-red-200/90">
            {request.declineReason}
          </p>
        </div>
      ) : null}

      {isApproved ? (
        <div className="mt-4 border-t border-border pt-4">
          <Link
            href="/properties"
            className="text-sm font-medium text-accent hover:underline"
          >
            Browse properties on the registry
          </Link>
        </div>
      ) : null}
    </DashboardEntityCard>
  );
}
