import type { Property, PropertyFilters } from '@/types';

/** Normalized text used for client-side property search (browse + saved dashboard). */
export function propertySearchHaystack(property: Property): string {
  const parts = [
    property.id,
    property.title,
    property.description,
    property.location.address,
    property.location.city,
    property.location.state,
    property.location.country,
    property.location.zipCode,
    property.propertyType.replace(/_/g, ' '),
    property.listingType,
    property.priceCurrency === 'ETH'
      ? `${property.price} eth`
      : String(property.price),
    property.bedrooms != null ? `${property.bedrooms} bed` : '',
    property.bathrooms != null ? `${property.bathrooms} bath` : '',
    property.area != null ? `${property.area} sqft` : '',
    property.blockchain?.tokenId,
    property.blockchain?.ownerWallet,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function propertyMatchesQuery(property: Property, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = propertySearchHaystack(property);
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function filterCatalogProperties(
  source: Property[],
  filters: PropertyFilters,
): Property[] {
  // Only show properties that are actively listed for sale or rent.
  // DRAFT = owned but not on market (isForSale=false AND isForRent=false).
  let filtered = source.filter(
    (p) => p.status === 'ACTIVE' || p.registryForSale === true || p.registryForRent === true,
  );

  if (filters.query?.trim()) {
    filtered = filtered.filter((p) => propertyMatchesQuery(p, filters.query!));
  }

  if (filters.minPrice != null) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.bedrooms != null) {
    filtered = filtered.filter((p) => p.bedrooms >= filters.bedrooms!);
  }
  if (filters.bathrooms != null) {
    filtered = filtered.filter((p) => p.bathrooms >= filters.bathrooms!);
  }
  if (filters.minArea != null) {
    filtered = filtered.filter((p) => p.area >= filters.minArea!);
  }
  if (filters.maxArea != null) {
    filtered = filtered.filter((p) => p.area <= filters.maxArea!);
  }
  if (filters.propertyType?.length) {
    filtered = filtered.filter((p) => filters.propertyType!.includes(p.propertyType));
  }
  if (filters.listingType === 'SALE') {
    filtered = filtered.filter((p) =>
      p.registryForSale === true ||
      (p.registryForRent !== true && p.listingType === 'SALE'),
    );
  }
  if (filters.listingType === 'RENT') {
    filtered = filtered.filter(
      (p) =>
        p.registryForRent === true ||
        (p.registryForSale !== true && p.listingType === 'RENT'),
    );
  }
  if (filters.listingType === 'BOTH') {
    filtered = filtered.filter(
      (p) =>
        (p.registryForSale === true || p.listingType === 'SALE' || p.listingType === 'BOTH') ||
        (p.registryForRent === true || p.listingType === 'RENT' || p.listingType === 'BOTH'),
    );
  }

  const sortBy = filters.sortBy || 'newest';
  if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'area') filtered.sort((a, b) => b.area - a.area);
  else if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return filtered;
}
