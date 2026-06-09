import type { Property } from '@/types';

export type PropertyListingBadge = 'SALE' | 'RENT' | 'NOT_LISTED' | 'BOTH';

/** Registry-aware badge; falls back to undefined so listing type drives the label. */
export function getPropertyListingBadge(property: Property): PropertyListingBadge | undefined {
  // If neither flag is set (properties registered before listing type feature), 
  // treat as a standard sale listing — don't show "Not on market"
  if (property.registryForSale === undefined && property.registryForRent === undefined) {
    return undefined;
  }
  // Both false only truly means "not listed" — treat as SALE for legacy properties
  // where the flags weren't set (they default to false in DB)
  if (!property.registryForSale && !property.registryForRent) return undefined;
  if (property.registryForSale && property.registryForRent) return 'BOTH';
  if (property.registryForRent && !property.registryForSale) return 'RENT';
  return 'SALE';
}
