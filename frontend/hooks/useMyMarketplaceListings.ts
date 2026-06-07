'use client';

import { useMemo } from 'react';

import { useMyProperties } from '@/hooks/useMyProperties';
import { mapRegistryCatalogToProperties } from '@/lib/registry-property-mapper';
import type { Property } from '@/types';
import type { RegistryProperty } from '@/types/registry-property';

export function useMyMarketplaceListings() {
  const {
    owned,
    propertyDbMap,
    imageOverrides,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh,
    isConnected,
  } = useMyProperties();

  const listedRegistry = useMemo(
    () => owned.filter((p) => p.isForSale || p.isForRent),
    [owned],
  );

  const unlistedRegistry = useMemo(
    () => owned.filter((p) => !p.isForSale && !p.isForRent),
    [owned],
  );

  const listedProperties = useMemo(
    () => mapRegistryCatalogToProperties(listedRegistry, propertyDbMap, imageOverrides),
    [listedRegistry, propertyDbMap, imageOverrides],
  );

  const counts = useMemo(
    () => ({
      owned: owned.length,
      listed: listedRegistry.length,
      forSale: owned.filter((p) => p.isForSale).length,
      forRent: owned.filter((p) => p.isForRent).length,
      unlisted: unlistedRegistry.length,
    }),
    [owned, listedRegistry, unlistedRegistry],
  );

  return {
    owned,
    listedRegistry,
    unlistedRegistry,
    listedProperties,
    counts,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh,
    isConnected,
  };
}

export function filterListedProperties(
  listings: Property[],
  tab: 'all' | 'sale' | 'rent',
): Property[] {
  if (tab === 'all') return listings;
  if (tab === 'sale') return listings.filter((p) => p.registryForSale);
  return listings.filter((p) => p.registryForRent);
}
