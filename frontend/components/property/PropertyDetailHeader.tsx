import Link from 'next/link';
import { ArrowLeft, MapPin, Shield, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import {
  propertyDetailCopy,
  propertyDetailLayout,
  propertyTypeLabels,
} from '@/lib/constants/property-detail';
import {
  formatPropertyLocation,
  getListingLabel,
} from '@/lib/property-detail';
import { cn, formatDate, formatPropertyPrice } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyDetailHeaderProps {
  property: Property;
}

export default function PropertyDetailHeader({ property }: PropertyDetailHeaderProps) {
  const location = formatPropertyLocation(property.location);

  return (
    <header data-nav-surface="dark" className={propertyDetailLayout.header}>
        <Link href={propertyDetailCopy.backHref} className={propertyDetailLayout.headerBackLink}>
          <ArrowLeft className="size-4" />
          {propertyDetailCopy.backLabel}
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                <Tag className="size-3.5" />
                {getListingLabel(property.listingType)}
              </span>
              <Badge variant="default" size="sm">
                {propertyTypeLabels[property.propertyType]}
              </Badge>
              {property.registryForSale === false && (
                <Badge variant="default" size="sm">
                  Not on market
                </Badge>
              )}
              {property.blockchain.isVerified && (
                <Badge variant="verified">
                  <Shield className="size-3" />
                  Verified
                </Badge>
              )}
            </div>

            <h1 className={propertyDetailLayout.headerTitle}>{property.title}</h1>

            <div className={propertyDetailLayout.headerMeta}>
              <span className="inline-flex items-start gap-1.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                {location}
              </span>
              <span>Listed {formatDate(property.createdAt)}</span>
            </div>
          </div>

          <div className="shrink-0 lg:text-right">
            <p className={propertyDetailLayout.headerPrice}>{formatPropertyPrice(property)}</p>
            {property.pricePerSqft != null && (
              <p className="mt-1 text-sm text-white/60 dark:text-muted">
                {property.priceCurrency === 'ETH'
                  ? `${property.pricePerSqft.toFixed(4)} ETH`
                  : formatPropertyPrice({
                      price: property.pricePerSqft,
                      priceCurrency: property.priceCurrency,
                    })}
                /sq ft
              </p>
            )}
          </div>
        </div>
    </header>
  );
}
