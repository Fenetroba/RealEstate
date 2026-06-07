import Link from 'next/link';
import { ArrowRight, Bath, Bed, Maximize2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatPropertyPrice } from '@/lib/utils';
import type { Property } from '@/types';

function marketplaceListingLabel(listing: Property): string {
  if (listing.registryForSale && listing.registryForRent) return 'Sale & rent';
  if (listing.registryForSale) return 'For sale';
  if (listing.registryForRent) return 'For rent';
  return listing.status.charAt(0) + listing.status.slice(1).toLowerCase();
}

function listingTypeLabel(listing: Property): string {
  if (listing.listingType === 'BOTH') return 'Sale & rent';
  if (listing.listingType === 'RENT') return 'Rent';
  return 'Sale';
}

interface MyListingRowProps {
  listing: Property;
  className?: string;
}

export function MyListingRow({ listing, className }: MyListingRowProps) {
  const image = listing.media.images[0] ?? '/edenet.jpg';
  const detailHref = `/properties/${listing.id}`;

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
          src={image}
          alt={listing.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:aspect-auto sm:h-28 sm:w-40"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={detailHref}>
              <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary dark:group-hover:text-accent">
                {listing.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-muted">
              {listing.location.city}, {listing.location.state}
            </p>
          </div>
          <Badge variant="success" size="sm">
            {marketplaceListingLabel(listing)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <p className="text-xs text-muted">Asking price</p>
            <p className="font-heading text-lg font-bold text-foreground">
              {formatPropertyPrice(listing)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Listing type</p>
            <p className="text-sm font-semibold text-foreground">{listingTypeLabel(listing)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Registry</p>
            <p className="font-mono text-sm font-semibold text-foreground">NFT #{listing.id}</p>
          </div>
        </div>

        <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          <li className="flex items-center gap-1">
            <Bed className="size-3.5 shrink-0 text-accent" aria-hidden />
            {listing.bedrooms} bed
          </li>
          <li className="flex items-center gap-1">
            <Bath className="size-3.5 shrink-0 text-accent" aria-hidden />
            {listing.bathrooms} bath
          </li>
          <li className="flex items-center gap-1">
            <Maximize2 className="size-3.5 shrink-0 text-accent" aria-hidden />
            {listing.area.toLocaleString()} sqft
          </li>
        </ul>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
        <Button
          href={detailHref}
          variant="outline"
          size="sm"
          className="w-full sm:min-w-[7rem]"
          rightIcon={<ArrowRight className="size-3.5" />}
        >
          View
        </Button>
        <Button
          href={detailHref}
          variant="ghost"
          size="sm"
          className="w-full sm:min-w-[7rem]"
        >
          Manage listing
        </Button>
      </div>
    </article>
  );
}
