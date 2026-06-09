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

/** Convert a raw DB row (MINTED property) into a RegistryProperty. */
function dbRowToRegistryProperty(row: PropertyDbRow): RegistryProperty | null {
  const r = row as Record<string, unknown>;
  const tokenId = String(r.tokenId ?? r.token_id ?? '');
  if (!tokenId) return null;
  const priceNum = Number(row.price ?? 0);
  return {
    id:                tokenId,
    owner:             String(r.ownerWallet ?? r.owner_wallet ?? ''),
    name:              row.name ?? '',
    location:          row.location ?? '',
    propertyType:      row.propertyType ?? '',
    priceEth:          String(row.price ?? '0'),
    priceWei:          priceNum > 1e15
      ? BigInt(Math.round(priceNum))
      : BigInt(Math.floor(priceNum)) * BigInt('1000000000000000000'),
    isForSale:         false,
    isForRent:         false,
    bedrooms:          Number(row.bedrooms ?? 0),
    bathrooms:         Number(row.bathrooms ?? 0),
    sqft:              Number(row.squareFeet ?? 0),
    parking:           Object.hasOwn(row, 'parking') ? Boolean(row.parking) : false,
    floors:            Number(row.floors ?? 0),
    yearBuilt:         Number(row.yearBuilt ?? 0),
    metadataHash:      String(r.metadataHash ?? ''),
    imagesRootHash:    String(r.imagesRootHash ?? ''),
    documentsRootHash: String(r.documentsRootHash ?? ''),
  };
}

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
        // ── Mock mode ──────────────────────────────────────────────────────────
        if (mockMode) {
          const { properties: list, propertyDbMap: map } = await loadMockRegistry(
            isRefresh ? 200 : 450,
          );
          setProperties(list);
          setPropertyDbMap(map);
          return;
        }

        // ── Step 1: ALWAYS load DB catalog (MINTED properties). ────────────────
        // These are shown even when the blockchain is unavailable.
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

        // Build a unique list of DB-MINTED properties
        const seenIds = new Set<string>();
        const dbMintedList: RegistryProperty[] = [];
        for (const row of dbRows) {
          const r = row as Record<string, unknown>;
          if (r.status !== 'MINTED') continue;
          const prop = dbRowToRegistryProperty(row);
          if (prop && !seenIds.has(prop.id)) {
            seenIds.add(prop.id);
            dbMintedList.push(prop);
          }
        }

        // Show DB properties right away — visible even if chain load fails
        setProperties(dbMintedList);

        // ── Step 2: Try loading blockchain properties (chain failure = warning only) ──
        try {
          const contract = signerContract ?? getReadOnlyRegistryContract();
          if (!contract) {
            throw new Error(
              'Set NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_RPC_URL to load the registry.',
            );
          }

          const chainList = await loadRegistryProperties(contract);
          const chainIds = new Set(chainList.map((p) => p.id));

          // Build tokenId → full DB row map for merging updated metadata
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

          // Merge latest DB data into chain properties (DB wins for mutable fields)
          const merged = chainList.map((p) => {
            const db = dbDataMap[p.id] ?? dbDataMap[String(Number(p.id))];
            if (!db) return p;
            return mergeDbDataIntoRegistry(p, db as Record<string, unknown>);
          });

          // DB-MINTED properties not yet on-chain (DB-only approvals)
          const dbExtra = dbMintedList.filter(
            (p) => !chainIds.has(p.id) && !chainIds.has(String(Number(p.id))),
          );

          setProperties([...merged, ...dbExtra]);

          // Fetch real images from backend for each chain property
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

        } catch (chainErr) {
          // Chain failed — DB properties already shown above, just flag the error
          setChainError(
            chainErr instanceof Error
              ? chainErr.message
              : 'Could not load properties from registry',
          );
        }

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
