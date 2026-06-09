'use client';

import { useEffect, useState } from 'react';

import { mapRegistryCatalogToProperties } from '@/lib/registry-property-mapper';
import { getPropertyFromCatalog, setPropertyCatalog } from '@/lib/property-catalog-cache';
import {
  getReadOnlyRegistryContract,
  loadRegistryProperties,
} from '@/lib/web3/registry-contract';
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

  const contract = getReadOnlyRegistryContract();
  if (contract) {
    try {
      const registryList = await loadRegistryProperties(contract);

      // Fetch DB catalog (MINTED properties + mappings)
      let dbRows: Record<string, unknown>[] = [];
      let dbMap: Record<string, string> = {};
      try {
        const { fetchPropertyCatalog } = await import('@/lib/api/properties');
        const cat = await fetchPropertyCatalog();
        dbRows = cat.rows as Record<string, unknown>[];
        dbMap = cat.map;
      } catch { /* no backend */ }

      // 1. Build a list of DB-only MINTED properties (not yet on-chain)
      const chainIds = new Set(registryList.map((p) => p.id));
      const dbOnlyMINTED: Property[] = [];
      
      const { mapPropertyType, mergeDbDataIntoRegistry } = await import('@/lib/registry-property-mapper');
      
      for (const row of dbRows) {
        if (row.status !== 'MINTED') continue;
        const tid = String(row.tokenId ?? row.token_id ?? '');
        if (tid && !chainIds.has(tid) && !chainIds.has(String(Number(tid)))) {
          // Map DB row to full Property object
          dbOnlyMINTED.push({
            id: tid,
            title: String(row.name ?? ''),
            description: String(row.description ?? ''),
            location: {
              address: String(row.location ?? ''),
              city: '', state: '', country: '', zipCode: ''
            },
            price: Number(row.price ?? 0),
            priceCurrency: 'ETH',
            propertyType: mapPropertyType(String(row.propertyType ?? '')),
            listingType: 'SALE',
            status: 'ACTIVE',
            bedrooms: Number(row.bedrooms ?? 0),
            bathrooms: Number(row.bathrooms ?? 0),
            area: Number(row.squareFeet ?? 0),
            images: [],
            media: { images: [], documents: [] },
            createdAt: String(row.createdAt ?? new Date().toISOString()),
            views: 0,
            blockchain: {
              tokenId: tid,
              ownerWallet: String(row.ownerWallet ?? ''),
              isVerified: true
            }
          });
        }
      }

      // 2. Build tokenId → DB row map for merging into chain properties
      const dbDataMap: Record<string, Record<string, unknown>> = {};
      for (const row of dbRows) {
        const tid = String(row.tokenId ?? row.token_id ?? '');
        if (tid) {
          dbDataMap[tid] = row;
          dbDataMap[String(Number(tid))] = row;
        }
      }

      // 3. Merge DB data into Registry list
      const merged = registryList.map((p) => {
        const db = dbDataMap[p.id] ?? dbDataMap[String(Number(p.id))];
        return db ? mergeDbDataIntoRegistry(p, db) : p;
      });

      // 4. Combine and update cache
      const finalCatalog = [
        ...mapRegistryCatalogToProperties(merged, dbMap),
        ...dbOnlyMINTED
      ];
      
      setPropertyCatalog(finalCatalog);

      // 5. Build final state for requested property
      const found = finalCatalog.find((p) => p.id === id);
      
      if (found) {
        let imageOverrides: Record<string, string[]> = {};
        let realDocuments: RealDocument[] = [];
        let ownershipHistory: RealOwnershipHistory[] = [];
        
        const dbId = dbMap[id] ?? dbMap[String(Number(id))];
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
              found.media.images = imageOverrides[id];
              found.images = imageOverrides[id];
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

        // Fetch ownership history from blockchain (only if on-chain)
        if (chainIds.has(id) || chainIds.has(String(Number(id)))) {
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
        }

        return { property: found, documents: realDocuments, ownershipHistory };
      }
    } catch {
      /* fall through */
    }
  }

  // Always try to load from DB catalog even without a contract
  try {
    const { fetchPropertyCatalog } = await import('@/lib/api/properties');
    const cat = await fetchPropertyCatalog();
    const dbRows = cat.rows as Record<string, unknown>[];
    const dbMap = cat.map;
    const { mergeDbDataIntoRegistry } = await import('@/lib/registry-property-mapper');
    const dbOnlyMINTED: Property[] = [];

    for (const row of dbRows) {
      if (row.status !== 'MINTED') continue;
      const tid = String(row.tokenId ?? row.token_id ?? '');
      if (tid === id) {
        // Directly build a minimal property from DB
        const { mapPropertyType } = await import('@/lib/registry-property-mapper');
        dbOnlyMINTED.push({
          id: tid,
          title: String(row.name ?? ''),
          description: String(row.description ?? ''),
          location: { address: String(row.location ?? ''), city: '', state: '', country: 'Ethiopia', zipCode: '', lat: 0, lng: 0 },
          price: Number(row.price ?? 0),
          priceCurrency: 'ETH',
          propertyType: mapPropertyType(String(row.propertyType ?? '')),
          listingType: 'SALE',
          investmentType: ['BUY'],
          status: 'ACTIVE',
          bedrooms: Number(row.bedrooms ?? 0),
          bathrooms: Number(row.bathrooms ?? 0),
          area: Number(row.squareFeet ?? 0),
          media: { images: [] },
          amenities: { parking: false, pool: false, gym: false, security: false, elevator: false, garden: false, balcony: false, airConditioning: false, heating: false, internet: false, furnished: false, petFriendly: false },
          blockchain: { tokenId: tid, ownerWallet: String(row.ownerWallet ?? ''), isVerified: true, transferHistory: [] },
          aiScores: { riskScore: 20, marketRisk: 20, crimeRisk: 15, floodRisk: 10, neighborhoodRisk: 20, economicRisk: 20, scamProbability: 3, carbonScore: 75, energyEfficiency: 75, investmentPotential: 75 },
          OWNERId: String(row.ownerWallet ?? ''),
          isFeatured: false,
          isFractional: false,
          documents: [],
          timeline: [],
          views: 0,
          saves: 0,
          createdAt: String(row.createdAt ?? new Date().toISOString()),
          updatedAt: String(row.updatedAt ?? new Date().toISOString()),
        });
      }
    }

    if (dbOnlyMINTED.length > 0) {
      const found = dbOnlyMINTED[0];
      // Fetch images
      const dbId = dbMap[id] ?? dbMap[String(Number(id))];
      if (dbId) {
        try {
          const { fetchPropertyImages, fetchPropertyDocuments } = await import('@/lib/api/properties');
          const { mediaDataUrl } = await import('@/lib/property-media');
          const [imgs, docs] = await Promise.all([fetchPropertyImages(dbId), fetchPropertyDocuments(dbId)]);
          if (imgs.length > 0) { found.media.images = imgs.map((img) => mediaDataUrl(img)); }
          const realDocuments: RealDocument[] = docs.map((doc, i) => ({
            id: String(i), name: doc.fileName ?? doc.name ?? `doc-${i}`,
            mimeType: doc.mimeType, data: doc.data, uploadedAt: null,
          }));
          return { property: found, documents: realDocuments, ownershipHistory: [] };
        } catch { /* skip */ }
      }
      return { property: found, documents: [], ownershipHistory: [] };
    }
  } catch { /* no backend */ }

  // Not found — return null, don't fall back to mock data
  return { property: null, documents: [], ownershipHistory: [] };
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
