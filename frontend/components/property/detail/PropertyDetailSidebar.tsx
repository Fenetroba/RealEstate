'use client';

import { Eye, Heart, Share2 } from 'lucide-react';

import { PropertyDetailRegistryActions } from '@/components/property/detail/PropertyDetailRegistryActions';
import { PropertyVerifyInline } from '@/components/property/detail/PropertyVerifyInline';
import { Button } from '@/components/ui/Button';
import { propertyDetailCopy, propertyDetailLayout } from '@/lib/constants/property-detail';
import { typeStatValue } from '@/lib/responsive';
import { cn, formatPropertyPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSavedProperty } from '@/store/slices/propertySlice';
import { addToast } from '@/store/slices/uiSlice';
import type { Property } from '@/types';

import { DetailPanel } from './DetailPanel';

interface PropertyDetailSidebarProps {
  property: Property;
}

export default function PropertyDetailSidebar({ property }: PropertyDetailSidebarProps) {
  const dispatch = useAppDispatch();
  const savedProperties = useAppSelector((s) => s.property.savedProperties);
  const isSaved = savedProperties.includes(property.id);
  const detailHref = `/properties/${property.id}`;

  const handleSave = () => {
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

  const handleShare = async () => {
    const url = `${window.location.origin}${detailHref}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: property.title, text: property.title, url });
        dispatch(addToast({ type: 'success', title: 'Shared', message: 'Link shared.' }));
        return;
      }
      await navigator.clipboard.writeText(url);
      dispatch(addToast({ type: 'success', title: 'Link copied', message: 'Copied to clipboard.' }));
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') return;
      dispatch(addToast({ type: 'error', title: 'Could not share', message: 'Try copying the URL.' }));
    }
  };

  return (
    <aside className={propertyDetailLayout.sidebarSticky}>
      <DetailPanel>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted">{propertyDetailCopy.sidebarPriceLabel}</p>
            {/* Sale price */}
            {(property.listingType === 'SALE' || property.listingType === 'BOTH') && (
              <p className={cn(typeStatValue, 'mt-1 text-accent')}>
                {formatPropertyPrice(property)}
                <span className="ml-1 font-body text-xs font-medium text-muted">sale</span>
              </p>
            )}
            {/* Rent price */}
            {(property.listingType === 'RENT' || property.listingType === 'BOTH') && property.rentPrice != null && (
              <p className={cn(typeStatValue, 'mt-1 text-accent')}>
                {property.rentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
                <span className="ml-1 font-body text-xs font-medium text-muted">/mo rent</span>
              </p>
            )}
            {/* Rent-only fallback */}
            {property.listingType === 'RENT' && property.rentPrice == null && (
              <p className={cn(typeStatValue, 'mt-1 text-accent')}>{formatPropertyPrice(property)}<span className="ml-1 font-body text-xs font-medium text-muted">/mo</span></p>
            )}
            {property.pricePerSqft != null && (
              <p className="mt-1 text-sm text-muted">
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

          <p className="flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {propertyDetailCopy.metaViews(property.views)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" />
              {propertyDetailCopy.metaSaves(property.saves)}
            </span>
          </p>

          <PropertyDetailRegistryActions property={property} />

          <PropertyVerifyInline
            tokenId={property.blockchain?.tokenId ?? property.id}
            propertyName={property.title}
          />

          <div className="flex gap-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={handleSave}>
              <Heart className={cn('size-4', isSaved && 'fill-red-500 text-red-500')} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="ghost" size="md" className="flex-1" onClick={() => void handleShare()}>
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </div>
      </DetailPanel>
    </aside>
  );
}
