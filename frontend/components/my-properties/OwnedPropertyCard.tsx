'use client';

import Link from 'next/link';
import { History, MapPin, Pencil } from 'lucide-react';

import { useEffect, useState } from 'react';
import { DashboardEntityCard } from '@/components/dashboard/DashboardEntityCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPropertyTypeLabel, formatRequestPrice } from '@/lib/registry-request-labels';
import { fetchPropertyImages } from '@/lib/api/properties';
import { typeBodySm } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import type { RegistryProperty } from '@/types/registry-property';

interface OwnedPropertyCardProps {
  property: RegistryProperty;
  dbPropertyId: string | null;
  hasDbRecord: boolean;
  onSubmitUpdate: () => void;
  onVersionHistory: () => void;
}

export function OwnedPropertyCard({
  property,
  dbPropertyId,
  hasDbRecord,
  onSubmitUpdate,
  onVersionHistory,
}: OwnedPropertyCardProps) {
  const [thumb, setThumb] = useState(
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  );

  useEffect(() => {
    if (!dbPropertyId) return;
    fetchPropertyImages(dbPropertyId)
      .then((imgs) => {
        if (imgs.length > 0) {
          setThumb(`data:${imgs[0].mimeType};base64,${imgs[0].data}`);
        }
      })
      .catch(() => {});
  }, [dbPropertyId]);

  const listingNote =
    property.isForSale && property.isForRent
      ? 'Listed for sale and rent'
      : property.isForSale
        ? 'Listed for sale'
        : property.isForRent
          ? 'Listed for rent'
          : 'Not listed on marketplace';

  const isListed = property.isForSale || property.isForRent;

  return (
    <DashboardEntityCard className="w-full p-5">
      <div className="flex gap-4 w-full">
        {/* Image */}
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:h-48 sm:w-48">
          <img src={thumb} alt="" className="size-full object-cover" draggable={false} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-heading text-base font-semibold text-foreground leading-tight">
              {property.name}
            </h3>
            <Link href={`/properties/${property.id}`}>
              <Badge variant="default" size="sm" className="shrink-0 font-mono text-xs hover:opacity-80">
                NFT #{property.id}
              </Badge>
            </Link>
          </div>

          {/* Location + type */}
          <p className={cn(typeBodySm, 'flex items-center gap-1.5')}>
            <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden />
            <span className="truncate">
              {property.location}
              <span className="text-muted"> · </span>
              {formatPropertyTypeLabel(property.propertyType)}
            </span>
          </p>

          {/* Price + listing status */}
          <div className="flex items-center gap-3">
            <p className="font-heading text-sm font-semibold text-accent">
              {formatRequestPrice(property.priceEth)}
            </p>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full border',
              isListed
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-border bg-surface text-muted',
            )}>
              {listingNote}
            </span>
          </div>

          {!hasDbRecord ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Registry files not linked yet.
            </p>
          ) : null}

          {/* Actions */}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Pencil className="size-4" />}
              onClick={onSubmitUpdate}
            >
              Submit update
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<History className="size-4" />}
              onClick={onVersionHistory}
            >
              Versions
            </Button>
            <Link href={`/properties/${property.id}`} className="ml-auto">
              <Button variant="outline" size="sm">
                {isListed ? 'Manage listing' : 'List on marketplace'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardEntityCard>
  );
}
