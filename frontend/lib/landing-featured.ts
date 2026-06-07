import { LANDING_FEATURED_CARD_COUNT } from '@/lib/constants/landing';
import type { Property } from '@/types';

/** Featured first, then other listings, up to the landing limit */
export function selectLandingFeaturedProperties(
  properties: Property[],
  limit: number = LANDING_FEATURED_CARD_COUNT,
): Property[] {
  const seen = new Set<string>();
  const featured: Property[] = [];
  const rest: Property[] = [];

  for (const property of properties) {
    if (seen.has(property.id)) continue;
    seen.add(property.id);
    if (property.isFeatured) featured.push(property);
    else rest.push(property);
  }

  return [...featured, ...rest].slice(0, limit);
}
