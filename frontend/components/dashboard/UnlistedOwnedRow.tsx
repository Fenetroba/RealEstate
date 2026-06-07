'use client';

import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPropertyTypeLabel, formatRequestPrice } from '@/lib/registry-request-labels';
import { mockRegistryGalleryUrls } from '@/lib/mockRegistryData';
import { cn } from '@/lib/utils';
import type { RegistryProperty } from '@/types/registry-property';

interface UnlistedOwnedRowProps {
  property: RegistryProperty;
  className?: string;
}

export function UnlistedOwnedRow({ property, className }: UnlistedOwnedRowProps) {
  const thumb =
    mockRegistryGalleryUrls[property.id]?.[0] ??
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80';
  const detailHref = `/properties/${property.id}`;

  return (
    <article
      className={cn(
        'group flex w-full min-w-0 flex-col gap-4 border-b border-border/60 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-6',
        className,
      )}
    >
      <Link
        href={detailHref}
        className="relative block shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:w-40"
      >
        <img
          src={thumb}
          alt={property.name}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:aspect-auto sm:h-28 sm:w-40"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={detailHref}>
              <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary dark:group-hover:text-accent">
                {property.name}
              </h3>
            </Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden />
              <span className="truncate">{property.location}</span>
            </p>
          </div>
          <Badge variant="outline" size="sm">
            Not listed
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted">
          {formatPropertyTypeLabel(property.propertyType)} · {formatRequestPrice(property.priceEth)}
        </p>
        <p className="mt-1 text-xs text-muted">
          Open the property page to list for sale or rent on-chain.
        </p>
      </div>

      <Button
        href={detailHref}
        variant="primary"
        size="sm"
        className="w-full shrink-0 sm:min-w-[9rem]"
        rightIcon={<ArrowRight className="size-3.5" />}
      >
        List on marketplace
      </Button>
    </article>
  );
}
