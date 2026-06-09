import { CONTRACT_ADDRESS } from '@/lib/web3/config';
import { mockRegistryGalleryUrls } from '@/lib/mockRegistryData';
import { getRegistryDetailExtras } from '@/lib/registry-detail-extras';
import type { PropertyDbMap, RegistryProperty } from '@/types/registry-property';
import type {
  AIScores,
  Property,
  PropertyAmenities,
  PropertyType,
} from '@/types';

const defaultAmenities: PropertyAmenities = {
  parking: false,
  pool: false,
  gym: false,
  security: true,
  elevator: false,
  garden: false,
  balcony: false,
  airConditioning: true,
  heating: true,
  internet: true,
  furnished: false,
  petFriendly: false,
};

const defaultAiScores: AIScores = {
  riskScore: 20,
  marketRisk: 18,
  crimeRisk: 15,
  floodRisk: 12,
  neighborhoodRisk: 22,
  economicRisk: 20,
  scamProbability: 3,
  carbonScore: 75,
  energyEfficiency: 80,
  investmentPotential: 78,
};

function mapPropertyType(raw: string): PropertyType {
  const normalized = raw.trim().toUpperCase();
  const allowed: PropertyType[] = [
    'HOUSE',
    'APARTMENT',
    'CONDO',
    'VILLA',
    'COMMERCIAL',
    'LAND',
    'TOWNHOUSE',
  ];
  if (allowed.includes(normalized as PropertyType)) {
    return normalized as PropertyType;
  }
  if (normalized.includes('VILLA')) return 'VILLA';
  if (normalized.includes('APARTMENT') || normalized.includes('LOFT')) return 'APARTMENT';
  if (normalized.includes('ESTATE') || normalized.includes('HOUSE')) return 'HOUSE';
  return 'HOUSE';
}

function parseLocationParts(location: string) {
  const parts = location.split(',').map((p) => p.trim());
  // Use at most two parts: city and country/state
  const city = parts[0] || location || '—';
  const state = parts[1] || '—';
  // address shown in card = "City, Country" (no more repetition)
  const address = parts.length > 1 ? `${city}, ${state}` : city;
  return { city, state, address };
}

const registryDescriptions: Record<string, string> = {
  '1': 'Stunning villa with panoramic city views, private garden, and premium finishes. On-chain verified NFT listing with full document set in the registry.',
  '2': 'Modern downtown loft with open plan living, high ceilings, and walkable amenities. Ideal owner listing demo — not currently on market.',
  '3': 'Expansive lakeside estate with waterfront access, guest wing, and mature landscaping. Listed for on-chain sale at 12 ETH.',
  '4': 'Family home with terraced garden and covered parking in a quiet Hawassa neighborhood.',
  '5': 'Compact condo near transit and shopping, suited for urban living or rental income.',
  '6': 'Chalet-style home with mountain views; owner-held and not listed for sale.',
  '7': 'Townhouse with river proximity and recent interior updates.',
  '8': 'Commercial office floor plate in the central business district.',
  '9': 'Development-ready land parcel with clear title on the registry.',
};

export function registryToProperty(
  registry: RegistryProperty,
  options?: { images?: string[]; description?: string; dbId?: string },
): Property {
  const { city, state, address } = parseLocationParts(registry.location);
  // const images =
  //   options?.images ??
  //   mockRegistryGalleryUrls[registry.id] ??
  //   ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'];
  const images =
    options?.images?.length
      ? options.images
      : mockRegistryGalleryUrls[registry.id] ??
        ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'];
  const priceNum = Number(registry.priceEth) || 0;
  const area = registry.sqft || 1;
  const registryExtras = getRegistryDetailExtras(
    registry.id,
    registry.owner,
    registry.documentsRootHash,
    registry.isForSale,
  );

  const listingType =
    registry.isForSale && registry.isForRent
      ? 'BOTH'
      : registry.isForRent
        ? 'RENT'
        : 'SALE';

  return {
    id: registry.id,
    title: registry.name,
    description:
      options?.description ??
      registryDescriptions[registry.id] ??
      `${registry.name} on the EDENET property registry (NFT #${registry.id}). ${registry.location}.`,
    price: priceNum,
    priceCurrency: 'ETH',
    pricePerSqft: area > 0 ? priceNum / area : undefined,
    propertyType: mapPropertyType(registry.propertyType),
    listingType,
    investmentType: registry.isForRent && !registry.isForSale ? ['RENT'] : ['BUY'],
    // All registry-approved properties are ACTIVE (browsable on the marketplace)
    status: 'ACTIVE',
    registryForSale: registry.isForSale,
    registryForRent: registry.isForRent,
    location: {
      address,
      city,
      state,
      country: 'Ethiopia',
      zipCode: '—',
      lat: 0,
      lng: 0,
    },
    media: { images },
    amenities: {
      ...defaultAmenities,
      parking: registry.parking,
    },
    bedrooms: registry.bedrooms,
    bathrooms: registry.bathrooms,
    area: registry.sqft,
    yearBuilt: registry.yearBuilt || undefined,
    floors: registry.floors,
    parkingSpaces: registry.parking ? 1 : 0,
    blockchain: {
      tokenId: registry.id,
      contractAddress: CONTRACT_ADDRESS || undefined,
      ownerWallet: registry.owner,
      metadataHash: registry.metadataHash,
      imagesRootHash: registry.imagesRootHash,
      documentsRootHash: registry.documentsRootHash,
      isVerified: true,
      verificationTxHash: `0xverify${registry.id}${'0'.repeat(58)}`.slice(0, 66),
      transferHistory: registryExtras.transferHistory,
      dbId: options?.dbId,
    },
    aiScores: {
      ...defaultAiScores,
      riskScore: 15 + Number(registry.id) * 3,
      investmentPotential: 70 + Number(registry.id) * 2,
    },
    OWNERId: registry.owner,
    isFeatured: registry.id === '1',
    isFractional: false,
    documents: registryExtras.documents,
    timeline: registryExtras.timeline,
    views: 1200 + Number(registry.id) * 340,
    saves: 40 + Number(registry.id) * 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// export function mapRegistryCatalogToProperties(
//   registryList: RegistryProperty[],
//   propertyDbMap: PropertyDbMap,
// ): Property[] {
//   return registryList.map((r) =>
//     registryToProperty(r, {
//       images: mockRegistryGalleryUrls[r.id],
//       // Resolve the DB id so components can fetch real images/documents
//       dbId: propertyDbMap[r.id] ?? propertyDbMap[String(Number(r.id))],
//     }),
//   );
// }
export function mapRegistryCatalogToProperties(
  registryList: RegistryProperty[],
  propertyDbMap: PropertyDbMap,
  imageOverrides: Record<string, string[]> = {},
): Property[] {
  return registryList.map((r) => {
    const dbId = propertyDbMap[r.id] ?? propertyDbMap[String(Number(r.id))];
    // Use real backend images if available, fall back to mock gallery
    const images =
      imageOverrides[r.id] ??
      (dbId ? undefined : mockRegistryGalleryUrls[r.id]);
    return registryToProperty(r, { images, dbId });
  });
}
/**
 * Merge latest DB record data into a RegistryProperty.
 * The DB has updated name/location/price after approved metadata updates,
 * so we prefer DB values when available (matches index.js behaviour).
 */
export function mergeDbDataIntoRegistry(
  registry: RegistryProperty,
  dbRow: Record<string, unknown>,
): RegistryProperty {
  return {
    ...registry,
    name: String(dbRow.name ?? registry.name),
    location: String(dbRow.location ?? registry.location),
    propertyType: String(dbRow.propertyType ?? registry.propertyType),
    bedrooms: Number(dbRow.bedrooms ?? registry.bedrooms),
    bathrooms: Number(dbRow.bathrooms ?? registry.bathrooms),
    sqft: Number(dbRow.squareFeet ?? dbRow.sqft ?? registry.sqft),
    priceEth: String(dbRow.price ?? registry.priceEth),
    // Recompute priceWei from the DB price (stored as whole ETH)
    priceWei: (() => {
      const p = Number(dbRow.price ?? 0);
      if (!p) return registry.priceWei;
      return p > 1e15
        ? BigInt(Math.round(p))
        : BigInt(Math.floor(p)) * BigInt('1000000000000000000');
    })(),
  };
}
