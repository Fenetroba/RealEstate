'use client';

import Link from 'next/link';
import { Eye, MapPin, ThumbsDown, ThumbsUp, User } from 'lucide-react';

import { DashboardEntityCard } from '@/components/dashboard/DashboardEntityCard';
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { MintRequestReviewItem } from '@/hooks/useAdminPanel';
import {
  formatPropertyTypeLabel,
  formatRequestPrice,
} from '@/lib/registry-request-labels';
import { resolveAdminRequestDbId } from '@/lib/admin-request-matching';
import { cn, truncateAddress } from '@/lib/utils';

interface PendingMintRequestCardProps {
  item: MintRequestReviewItem;
  hasApiMatch: boolean;
  actionKey: string | null;
  onApprove: (item: MintRequestReviewItem) => void;
  onDecline: (item: MintRequestReviewItem) => void;
  onPreview: (item: MintRequestReviewItem) => void;
}

export function PendingMintRequestCard({
  item,
  hasApiMatch,
  actionKey,
  onApprove,
  onDecline,
  onPreview,
}: PendingMintRequestCardProps) {
  const { chain, apiMatch } = item;
  const busy = actionKey === chain.id;

  return (
    <DashboardEntityCard className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-foreground">{chain.name}</h3>
            <RequestStatusBadge status={chain.status} />
            <Badge variant="outline" size="sm">
              Chain #{chain.id}
            </Badge>
            {!hasApiMatch ? (
              <Badge variant="warning" size="sm">
                No API row
              </Badge>
            ) : null}
          </div>

          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden />
            {chain.location}
            <span> · </span>
            {formatPropertyTypeLabel(chain.propertyType)}
          </p>

          <p className="font-heading text-sm font-semibold text-accent">
            {formatRequestPrice(chain.priceEth)}
          </p>

          <p className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <User className="size-3.5" aria-hidden />
            {truncateAddress(chain.requester)}
          </p>

          {apiMatch ? (
            <p className="text-xs text-muted">
              API record:{' '}
              <span className="font-medium text-foreground">
                {apiMatch.title || resolveAdminRequestDbId(apiMatch)}
              </span>
            </p>
          ) : (
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Link a pending API request before mint approval. Refresh after citizens submit via the
              registry API.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="size-4" />}
            onClick={() => onPreview(item)}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ThumbsUp className="size-4" />}
            disabled={busy || !hasApiMatch}
            onClick={() => onApprove(item)}
          >
            Approve mint
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<ThumbsDown className="size-4" />}
            disabled={busy || !hasApiMatch}
            onClick={() => onDecline(item)}
          >
            Decline
          </Button>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <Link
          href={`/properties/${chain.id}`}
          className={cn('text-xs font-medium text-muted hover:text-accent')}
        >
          View on-chain request index in catalog (after mint)
        </Link>
      </div>
    </DashboardEntityCard>
  );
}
