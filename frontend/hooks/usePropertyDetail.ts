'use client';

import { useEffect, useState } from 'react';

import { mapRegistryCatalogToProperties } from '@/lib/registry-property-mapper';
import { getPropertyFromCatalog, setPropertyCatalog } from '@/lib/property-catalog-cache';
import { loadMockRegistry } from '@/lib/mockRegistryData';
import {
  getReadOnlyRegistryContract,
  loadRegistryProperties,
} from '@/lib/web3/registry-contract';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { mockProperties } from '@/lib/mockData';
import type { Property } from '@/types';

// ADD HERE — before resolvePropertyById
export interface RealDocument {
  id: string;
  name: string;
  mimeType: string;
  data: string;       // base64
  uploadedAt: string | null;
}

export interface RealOwnershipHistory {
  from: string;
  to: string;
  price: string;
  timestamp: number;
}

async function resolvePropertyById(id: string): Promise<{ 
  property: Property | null; 
  documents: RealDocument[];
  ownershipHistory: RealOwnershipHistory[];
}> {

  // cached path — no documents available from cache
  const cached = getPropertyFromCatalog(id);
  if (cached) return { property: cached, documents: [], ownershipHistory: [] };

  if (isRegistryMockMode()) {
    const { properties, propertyDbMap } = await loadMockRegistry(0);
    const catalog = mapRegistryCatalogToProperties(properties, propertyDbMap);
    setPropertyCatalog(catalog);
    const found = catalog.find((p) => p.id === id) ?? null;
    return { property: found, documents: [], ownershipHistory: [] };
  }

  const contract = getReadOnlyRegistryContract();
  if (contract) {
    try {
      const registryList = await loadRegistryProperties(contract);

      // Fetch DB catalog for dbId mapping and latest metadata
      let dbMap: Record<string, string> = {};
      let dbRows: Record<string, unknown>[] = [];
      try {
        const { fetchPropertyCatalog } = await import('@/lib/api/properties');
        const cat = await fetchPropertyCatalog();
        dbMap = cat.map;
        dbRows = cat.rows as Record<string, unknown>[];
      } catch { /* no backend */ }

      // Merge DB metadata
      const { mergeDbDataIntoRegistry } = await import('@/lib/registry-property-mapper');
      const dbDataMap: Record<string, Record<string, unknown>> = {};
      for (const row of dbRows) {
        const tokenId = String((row as Record<string,unknown>).tokenId ?? '');
        if (tokenId) {
          dbDataMap[tokenId] = row;
          dbDataMap[String(Number(tokenId))] = row;
        }
      }
      const merged = registryList.map((p) => {
        const db = dbDataMap[p.id] ?? dbDataMap[String(Number(p.id))];
        return db ? mergeDbDataIntoRegistry(p, db) : p;
      });

      // Fetch images + documents for this specific property
      const dbId = dbMap[id] ?? dbMap[String(Number(id))];
      let imageOverrides: Record<string, string[]> = {};
      let realDocuments: RealDocument[] = [];
      let ownershipHistory: RealOwnershipHistory[] = [];
      
      if (dbId) {
        try {
          const { fetchPropertyImages, fetchPropertyDocuments } = await import('@/lib/api/properties');
          const { mediaDataUrl } = await import('@/lib/property-media');
          const [imgs, docs] = await Promise.all([
            fetchPropertyImages(dbId),
            fetchPropertyDocuments(dbId),
          ]);
          if (imgs.length > 0) {
            imageOverrides[id] = imgs.map((img) => mediaDataUrl(img));
          }
          realDocuments = docs.map((doc, index) => ({
            id:         String(index),
            name:       doc.fileName ?? doc.name ?? `document-${index + 1}`,
            mimeType:   doc.mimeType,
            data:       doc.data,
            uploadedAt: null,
          }));
        } catch { /* no docs */ }
      }

      // Fetch ownership history from blockchain
      try {
        const { fetchOwnershipHistory } = await import('@/lib/web3/registry-contract');
        const history = await fetchOwnershipHistory(contract, id);
        ownershipHistory = history.map((h) => ({
          from: h.from,
          to: h.to,
          price: String(h.price ?? '0'),
          timestamp: typeof h.timestamp === 'bigint' ? Number(h.timestamp) : (h.timestamp ?? 0),
        }));
      } catch { /* no history */ }

      const catalog = mapRegistryCatalogToProperties(merged, dbMap, imageOverrides);
      setPropertyCatalog(catalog);
        const found = catalog.find((p) => p.id === id);
        if (found) return { property: found, documents: realDocuments, ownershipHistory };
    } catch {
      /* fall through */
    }
  }

  // fallback
  return { property: mockProperties.find((p) => p.id === id) ?? mockProperties[0] ?? null, documents: [], ownershipHistory: [] };
}

export function usePropertyDetail(id: string | undefined) {
  const [property, setProperty]   = useState<Property | null>(null);
  const [documents, setDocuments] = useState<RealDocument[]>([]);
  const [ownershipHistory, setOwnershipHistory] = useState<RealOwnershipHistory[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!id) {
      setProperty(null);
      setDocuments([]);
      setOwnershipHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void resolvePropertyById(id)
      .then((result) => {
        if (!cancelled) {
          setProperty(result.property);
          setDocuments(result.documents);
          setOwnershipHistory(result.ownershipHistory);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { property, documents, ownershipHistory, loading };
}
