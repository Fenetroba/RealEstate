'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bath, Bed, Eye, Heart, MapPin, Maximize2, Share2, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { usePropertyImages } from '@/hooks/usePropertyImages';
import { getPropertyListingBadge } from '@/lib/property-listing-badge';
import { cn, formatPropertyPrice } from '@/lib/utils';
import type { ListingType, Property } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSavedProperty } from '@/store/slices/propertySlice';
import { addToast } from '@/store/slices/uiSlice';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

const saleBadgeClass =
  'inline-flex items-center rounded-full bg-accent px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-primary backdrop-blur-sm';

const rentBadgeClass =
  'inline-flex items-center rounded-full border border-white/20 bg-primary/90 px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm';

const cardIconAccent = 'text-accent';
const cardPriceText = 'text-accent';
const cardZoomOut =
  'origin-center scale-[1.025] transition-transform duration-300 ease-out hover:scale-100';
const cardAccentTitleHover = 'group-hover:text-primary dark:group-hover:text-accent';
const cardAccentActionHover = 'hover:border-accent/50 hover:text-accent';
const cardAccentSaved =
  'border-accent/50 text-accent hover:border-accent/50 hover:text-accent';
const cardAccentSavedFill = 'fill-accent text-accent';

function resolveListingBadge(
  listingType: ListingType,
  override?: 'SALE' | 'RENT' | 'NOT_LISTED' | 'BOTH',
): 'SALE' | 'RENT' | 'NOT_LISTED' | 'BOTH' {
  if (override) return override;
  if (listingType === 'BOTH') return 'BOTH';
  if (listingType === 'RENT') return 'RENT';
  return 'SALE';
}

function PropertyCardBadges({
  listingType,
  listingBadge,
  className,
}: {
  listingType: ListingType;
  listingBadge?: 'SALE' | 'RENT' | 'NOT_LISTED' | 'BOTH';
  className?: string;
}) {
  const badge = resolveListingBadge(listingType, listingBadge);
  const notListedClass =
    'inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-muted';

  if (badge === 'BOTH') {
    return (
      <span className={cn('flex flex-wrap gap-1.5', className)}>
        <span className={saleBadgeClass}>For Sale</span>
        <span className={rentBadgeClass}>For Rent</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        badge === 'NOT_LISTED'
          ? notListedClass
          : badge === 'RENT'
            ? rentBadgeClass
            : saleBadgeClass,
        className,
      )}
    >
      {badge === 'RENT' ? 'For Rent' : badge === 'NOT_LISTED' ? 'Not Listed' : 'For Sale'}
    </span>
  );
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const dispatch = useAppDispatch();
  const savedProperties = useAppSelector((s) => s.property.savedProperties);
  const isSaved = savedProperties.includes(property.id);
  const [currentImg, setCurrentImg] = useState(0);

  const detailHref = `/properties/${property.id}`;
  const resolvedListingBadge = getPropertyListingBadge(property);

  // Fetch real backend images when dbId is available; fall back to mock URLs
  const dbId = property.blockchain?.dbId ?? null;
  const fallbackUrls = property.media.images.length
    ? property.media.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop'];
  const { images: resolvedImages } = usePropertyImages(dbId, fallbackUrls);
  const safeIndex = Math.min(currentImg, resolvedImages.length - 1);
  const mainImage = resolvedImages[safeIndex] ?? fallbackUrls[0];

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willSave = !isSaved;
    dispatch(toggleSavedProperty(property.id));
    dispatch(
      addToast({
        type: 'success',
        title: willSave ? 'Saved to favorites' : 'Removed from favorites',
        message: property.title,
      }),
    );
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${detailHref}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: property.title,
          text: property.title,
          url,
        });
        dispatch(
          addToast({
            type: 'success',
            title: 'Shared',
            message: 'Property link shared successfully.',
          }),
        );
        return;
      }

      await navigator.clipboard.writeText(url);
      dispatch(
        addToast({
          type: 'success',
          title: 'Link copied',
          message: 'Property link copied to clipboard.',
        }),
      );
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') return;
      dispatch(
        addToast({
          type: 'error',
          title: 'Could not share',
          message: 'Copy the link from the address bar or try again.',
        }),
      );
    }
  };

  const actionButtonClass = cn(
    'relative z-30 grid size-8 place-items-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors',
    cardAccentActionHover,
  );

  const showRentSuffix =
    (property.listingType === 'RENT' || property.registryForRent) && !property.registryForSale;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card',
        cardZoomOut,
        'dark:border-white/10',
        className,
      )}
    >
      <div className="relative h-48 shrink-0 overflow-hidden sm:h-52">
        <Link href={detailHref} className="absolute inset-0 z-0 block" aria-label={property.title}>
          <img
            src={mainImage}
            alt=""
            draggable={false}
            className="pointer-events-none size-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" aria-hidden />
        </Link>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-auto absolute left-3 top-3">
            <PropertyCardBadges
              listingType={property.listingType}
              listingBadge={resolvedListingBadge}
            />
          </div>

          <div className="pointer-events-auto absolute right-3 top-3 flex gap-1.5">
            <button type="button" onClick={handleShare} className={actionButtonClass} aria-label="Share property">
              <Share2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={cn(actionButtonClass, isSaved && cardAccentSaved)}
              aria-label={isSaved ? 'Remove from saved' : 'Save property'}
            >
              <Heart
                className={cn(
                  'size-3.5 transition-colors',
                  isSaved ? cardAccentSavedFill : 'fill-transparent',
                )}
              />
            </button>
          </div>

          {resolvedImages.length > 1 && (
            <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {resolvedImages.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImg(i);
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60',
                  )}
                  aria-label={`Show image ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            {property.blockchain.isVerified ? (
              <Badge variant="verified" size="sm" className="shrink-0 backdrop-blur-md">
                <Shield className="h-3 w-3" /> Verified
              </Badge>
            ) : (
              <span aria-hidden="true" />
            )}
            <div className="flex shrink-0 items-center gap-1 text-xs text-white/80">
              <Eye className="size-3" />
              {property.views.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <Link
        href={detailHref}
        className="flex flex-1 flex-col p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3
            className={cn(
              'line-clamp-2 min-h-[2.5rem] flex-1 font-heading text-base font-bold leading-snug text-foreground transition-colors',
              cardAccentTitleHover,
            )}
          >
            {property.title}
          </h3>
          <Badge
            variant="default"
            size="sm"
            className="shrink-0 border border-primary/15 bg-primary/10 text-primary dark:border-transparent dark:bg-surface dark:text-foreground"
          >
            {property.propertyType}
          </Badge>
        </div>

        <p className="mt-1 flex min-h-5 items-center gap-1 text-xs text-muted">
          <MapPin className={cn('size-3 shrink-0', cardIconAccent)} />
          <span className="truncate">
            {property.location.address}, {property.location.city}
          </span>
        </p>

        <p className="mt-2 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Bed className={cn('size-3', cardIconAccent)} />
            {property.bedrooms} Beds
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className={cn('size-3', cardIconAccent)} />
            {property.bathrooms} Baths
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize2 className={cn('size-3', cardIconAccent)} />
            {property.area.toLocaleString()} sqft
          </span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className={cn('min-w-0 font-heading text-lg font-bold leading-none', cardPriceText)}>
            {formatPropertyPrice(property)}
            {showRentSuffix ? (
              <span className="font-body text-xs font-medium text-muted"> /mo</span>
            ) : null}
          </p>
          <span
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              'shrink-0 whitespace-nowrap px-4 dark:bg-accent dark:text-white',
            )}
          >
            View Details
          </span>
        </div>
      </Link>
    </article>
  );
}
