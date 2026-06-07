import type { Property } from '@/types';

export type PropertyListingBadge = 'SALE' | 'RENT' | 'NOT_LISTED' | 'BOTH';

/** Registry-aware badge; falls back to undefined so listing type drives the label. */
export function getPropertyListingBadge(property: Property): PropertyListingBadge | undefined {
  if (property.registryForSale === undefined && property.registryForRent === undefined) {
    return undefined;
  }
  if (!property.registryForSale && !property.registryForRent) return 'NOT_LISTED';
  if (property.registryForSale && property.registryForRent) return 'BOTH';
  if (property.registryForRent && !property.registryForSale) return 'RENT';
  return 'SALE';
}
