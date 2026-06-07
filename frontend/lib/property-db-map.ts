import type { PropertyDbMap } from '@/types/registry-property';

/** Resolve API database id from on-chain token id (handles "2" vs "02"). */
export function resolveDbPropertyId(
  propertyDbMap: PropertyDbMap,
  tokenId: string,
): string | null {
  const key = String(tokenId).trim();
  if (!key) return null;
  if (propertyDbMap[key]) return propertyDbMap[key];
  const normalized = String(Number(key));
  if (normalized !== 'NaN' && propertyDbMap[normalized]) {
    return propertyDbMap[normalized];
  }
  return null;
}
