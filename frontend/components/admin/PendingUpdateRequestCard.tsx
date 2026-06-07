'use client';

import Link from 'next/link';
import { Check, Eye, Loader2, MapPin, ThumbsDown, User } from 'lucide-react';

import { DashboardEntityCard } from '@/components/dashboard/DashboardEntityCard';
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { updateStatusHelp } from '@/lib/registry-update-labels';
import { truncateAddress } from '@/lib/utils';
import type { RegistryProperty } from '@/types/registry-property';
import type { RegistryUpdateRequest } from '@/types/registry-update-request';

interface PendingUpdateRequestCardProps {
  update: RegistryUpdateRequest;
  property: RegistryProperty | undefined;
  canSign: boolean;
  actionKey: string | null;
  onApprove: (update: RegistryUpdateRequest) => void;
  onDecline: (update: RegistryUpdateRequest) => void;
  onPreview: (update: RegistryUpdateRequest) => void;
}

function actionId(update: RegistryUpdateRequest): string {
  return `${update.propertyId}-${update.updateIndex}`;
}

export function PendingUpdateRequestCard({
  update,
  property,
  canSign,
  actionKey,
  onApprove,
  onDecline,
  onPreview,
}: PendingUpdateRequestCardProps) {
  const id = actionId(update);
  const busy = actionKey === id;

  return (
    <DashboardEntityCard className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {property?.name ?? `NFT #${update.propertyId}`}
            </h3>
            <RequestStatusBadge status={update.status} />
            <Badge variant="outline" size="sm">
              Update #{update.updateIndex}
            </Badge>
          </div>

          {property ? (
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden />
              {property.location}
            </p>
          ) : null}

          <p className="text-xs text-muted">{updateStatusHelp(update.status)}</p>

          <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <User className="size-3.5" aria-hidden />
            {truncateAddress(update.requester)}
            {update.timestampLabel ? (
              <>
                <span className="text-border">·</span>
                <span className="font-sans">{update.timestampLabel}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="size-4" />}
            onClick={() => onPreview(update)}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            disabled={busy || !canSign}
            onClick={() => onApprove(update)}
          >
            {busy ? 'Processing...' : 'Approve update'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<ThumbsDown className="size-4" />}
            disabled={busy || !canSign}
            onClick={() => onDecline(update)}
          >
            Decline
          </Button>
        </div>
      </div>

      {property ? (
        <div className="mt-4 border-t border-border pt-3">
          <Link
            href={`/properties/${property.id}`}
            className="text-xs font-medium text-muted hover:text-accent"
          >
            Open property #{property.id}
          </Link>
        </div>
      ) : null}
    </DashboardEntityCard>
  );
}
