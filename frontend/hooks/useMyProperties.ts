'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useProperties } from '@/hooks/useProperties';
import { resolveDbPropertyId } from '@/lib/property-db-map';
import { fetchMyApprovedProperties } from '@/lib/api/properties';
import { useAppSelector } from '@/store/hooks';
import type { RegistryProperty } from '@/types/registry-property';

export function useMyProperties() {
  const address = useAppSelector((s) => s.wallet.address);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);

  const {
    properties,
    propertyDbMap,
    imageOverrides,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh: refreshChain,
    writeContract,
  } = useProperties();

  // ── DB-approved properties (directly from backend, no chain needed) ──────────
  const [dbOwned, setDbOwned] = useState<RegistryProperty[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  const loadDbOwned = useCallback(async () => {
    setDbLoading(true);
    try {
      const rows = await fetchMyApprovedProperties(address ?? undefined);
      const mapped: RegistryProperty[] = rows.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id:               String(r.tokenId ?? r.token_id ?? ''),
          owner:            String(r.ownerWallet ?? r.owner_wallet ?? ''),
          name:             row.name ?? '',
          location:         row.location ?? '',
          propertyType:     row.propertyType ?? '',
          priceEth:         String(row.price ?? '0'),
          priceWei:         BigInt(Math.floor(Number(row.price ?? 0))) * 1_000_000_000_000_000_000n,
          isForSale:        false,
          isForRent:        false,
          bedrooms:         Number(row.bedrooms ?? 0),
          bathrooms:        Number(row.bathrooms ?? 0),
          sqft:             Number(row.squareFeet ?? 0),
          parking:          Object.hasOwn(row, 'parking') ? Boolean(row.parking) : false,
          floors:           Number(row.floors ?? 0),
          yearBuilt:        Number(row.yearBuilt ?? 0),
          metadataHash:     String(r.metadataHash ?? ''),
          imagesRootHash:   String(r.imagesRootHash ?? ''),
          documentsRootHash:String(r.documentsRootHash ?? ''),
        };
      }).filter((p) => Boolean(p.id)); // only include items with a tokenId
    setDbOwned(mapped);
    } catch {
      setDbOwned([]);
    } finally {
      setDbLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void loadDbOwned();
  }, [loadDbOwned]);

  // ── Merge: chain-owned + db-owned, deduped by tokenId ────────────────────────
  const owned = useMemo(() => {
    if (!address) return [];
    const wallet = address.toLowerCase();

    // Chain-owned (already includes DB fallback from useProperties)
    const chainOwned = properties.filter((p) => p.owner.toLowerCase() === wallet);
    const chainIds   = new Set(chainOwned.map((p) => p.id));

    // DB-approved that aren't already in the chain list
    const dbExtra = dbOwned.filter((p) => !chainIds.has(p.id));

    return [...chainOwned, ...dbExtra];
  }, [properties, dbOwned, address]);

  const refresh = useCallback(async () => {
    await Promise.all([refreshChain(), loadDbOwned()]);
  }, [refreshChain, loadDbOwned]);

  const getDbPropertyId = (tokenId: string) =>
    resolveDbPropertyId(propertyDbMap, tokenId);

  return {
    owned,
    propertyDbMap,
    imageOverrides,
    loading: loading || dbLoading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh,
    writeContract,
    isConnected,
    getDbPropertyId,
  };
}

