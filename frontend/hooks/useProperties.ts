'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchPropertyCatalog } from '@/lib/api/properties';
import { loadMockRegistry } from '@/lib/mockRegistryData';
import {
  getReadOnlyRegistryContract,
  loadRegistryProperties,
} from '@/lib/web3/registry-contract';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { mergeDbDataIntoRegistry } from '@/lib/registry-property-mapper';
import type { PropertyDbMap, PropertyDbRow, RegistryProperty } from '@/types/registry-property';
import { useWeb3 } from '@/contexts/Web3Context';

export function useProperties() {
  const mockMode = isRegistryMockMode();
  const { contract: signerContract } = useWeb3();
  const [properties, setProperties] = useState<RegistryProperty[]>([]);
  const [propertyDbMap, setPropertyDbMap] = useState<PropertyDbMap>({});
  const [imageOverrides, setImageOverrides] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setChainError(null);
      setApiWarning(null);

      try {
        if (mockMode) {
          const { properties: list, propertyDbMap: map } = await loadMockRegistry(
            isRefresh ? 200 : 450,
          );
          setProperties(list);
          setPropertyDbMap(map);
          return;
        }

        // Fetch the DB catalog first (for the tokenId→dbId map AND the latest DB data)
        let dbRows: PropertyDbRow[] = [];
        let dbMap: PropertyDbMap = {};
        try {
          const catalog = await fetchPropertyCatalog();
          dbRows = catalog.rows;
          dbMap = catalog.map;
          setPropertyDbMap(dbMap);
        } catch {
          setPropertyDbMap({});
          setApiWarning(
            'Could not load property files from API — showing on-chain data only.',
          );
        }

        const contract = signerContract ?? getReadOnlyRegistryContract();
        if (!contract) {
          throw new Error(
            'Set NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_RPC_URL to load the registry.',
          );
        }

        const chainList = await loadRegistryProperties(contract);

        // Build a tokenId → full DB row map for merging updated metadata
        // (index.js merges DB name/location/price/sqft after approved updates)
        const dbDataMap: Record<string, PropertyDbRow> = {};
        for (const row of dbRows) {
          const tokenId = String(
            (row as Record<string, unknown>).tokenId ??
            (row as Record<string, unknown>).token_id ??
            '',
          );
          if (tokenId) {
            dbDataMap[tokenId] = row;
            dbDataMap[String(Number(tokenId))] = row;
          }
        }

        // // Merge latest DB data into chain properties (DB wins for mutable fields)
        // const merged = chainList.map((p) => {
        //   const db = dbDataMap[p.id] ?? dbDataMap[String(Number(p.id))];
        //   if (!db) return p;
        //   return mergeDbDataIntoRegistry(p, db as Record<string, unknown>);
        // });

        // setProperties(merged);
        // Merge latest DB data into chain properties (DB wins for mutable fields)
        const merged = chainList.map((p) => {
          const db = dbDataMap[p.id] ?? dbDataMap[String(Number(p.id))];
          if (!db) return p;
          return mergeDbDataIntoRegistry(p, db as Record<string, unknown>);
        });

        setProperties(merged);

        // Fetch real images from backend for each property
        try {
          const { fetchPropertyImages } = await import('@/lib/api/properties');
          const { mediaDataUrl } = await import('@/lib/property-media');
          const overrides: Record<string, string[]> = {};
          await Promise.all(
            merged.map(async (p) => {
              const dbId = dbMap[p.id] ?? dbMap[String(Number(p.id))];
              if (!dbId) return;
              try {
                const imgs = await fetchPropertyImages(dbId);
                if (imgs.length > 0) {
                  overrides[p.id] = imgs.map((img) => mediaDataUrl(img));
                  console.log(`[images] loaded ${imgs.length} images for property ${p.id}`);
                }
              } catch { /* skip */ }
            }),
          );
          setImageOverrides(overrides);
        } catch { /* skip */ }

      } catch (err) {
        setProperties([]);
        setChainError(
          err instanceof Error
            ? err.message
            : 'Could not load properties from registry',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mockMode, signerContract],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // return {
  //   properties,
  //   propertyDbMap,
  //   loading,
  //   refreshing,
  //   chainError,
  //   apiWarning,
  //   mockMode,
  //   refresh: () => load(true),
  //   readContract: mockMode ? null : signerContract ?? getReadOnlyRegistryContract(),
  //   writeContract: mockMode ? null : signerContract,
  // };
  return {
    properties,
    propertyDbMap,
    imageOverrides,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh: () => load(true),
    readContract: mockMode ? null : signerContract ?? getReadOnlyRegistryContract(),
    writeContract: mockMode ? null : signerContract,
  };
}
