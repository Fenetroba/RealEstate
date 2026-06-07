import { parseEther } from 'ethers';

import type {
  MetadataVersionEntry,
  OwnershipHistoryEntry,
  PropertyDbMap,
  RegistryProperty,
} from '@/types/registry-property';
import { REGISTRY_MOCK_PREVIEW_ACCOUNT } from '@/lib/web3/registry-mock';

const OWNER_B = '0x70997970C51812dc3A010C07b9e81eD500000000';

export const mockRegistryPropertyDbMap: PropertyDbMap = {
  '1': 'mock-db-uuid-1',
  '2': 'mock-db-uuid-2',
  '3': 'mock-db-uuid-3',
  '4': 'mock-db-uuid-4',
  '5': 'mock-db-uuid-5',
  '6': 'mock-db-uuid-6',
  '7': 'mock-db-uuid-7',
  '8': 'mock-db-uuid-8',
  '9': 'mock-db-uuid-9',
};

/** Public paths for demo carousel (no API) */
export const mockRegistryGalleryUrls: Record<string, string[]> = {
  '1': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  ],
  '2': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  ],
  '3': ['/edenet.jpg'],
  '4': ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
  '5': ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
  '6': ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  '7': ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  '8': ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'],
  '9': ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'],
};

function prop(
  partial: Omit<RegistryProperty, 'priceWei' | 'priceEth' | 'isForRent'> & {
    priceEth: string;
    isForRent?: boolean;
  },
): RegistryProperty {
  const priceWei = parseEther(partial.priceEth);
  return {
    ...partial,
    isForRent: partial.isForRent ?? false,
    priceWei,
    priceEth: partial.priceEth,
  };
}

export const mockRegistryProperties: RegistryProperty[] = [
  prop({
    id: '1',
    owner: OWNER_B,
    name: 'Sunset Villa',
    location: 'Bole, Addis Ababa',
    propertyType: 'Villa',
    priceEth: '5',
    isForSale: true,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    parking: true,
    floors: 2,
    yearBuilt: 2019,
    metadataHash: 'QmMockSunsetVilla',
    imagesRootHash: 'QmMockImages1',
    documentsRootHash: 'QmMockDocs1',
  }),
  prop({
    id: '2',
    owner: REGISTRY_MOCK_PREVIEW_ACCOUNT,
    name: 'Downtown Loft',
    location: 'Addis Ababa',
    propertyType: 'Apartment',
    priceEth: '2.5',
    isForSale: false,
    isForRent: true,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    parking: false,
    floors: 1,
    yearBuilt: 2021,
    metadataHash: 'QmMockDowntownLoft',
    imagesRootHash: 'QmMockImages2',
    documentsRootHash: 'QmMockDocs2',
  }),
  prop({
    id: '3',
    owner: OWNER_B,
    name: 'Lakeside Estate',
    location: 'Bahir Dar',
    propertyType: 'Estate',
    priceEth: '12',
    isForSale: true,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4800,
    parking: true,
    floors: 3,
    yearBuilt: 2015,
    metadataHash: 'QmMockLakeside',
    imagesRootHash: 'QmMockImages3',
    documentsRootHash: 'QmMockDocs3',
  }),
  prop({
    id: '4',
    owner: OWNER_B,
    name: 'Garden Terrace Home',
    location: 'Hawassa',
    propertyType: 'House',
    priceEth: '3.2',
    isForSale: true,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2100,
    parking: true,
    floors: 2,
    yearBuilt: 2018,
    metadataHash: 'QmMockGarden',
    imagesRootHash: 'QmMockImages4',
    documentsRootHash: 'QmMockDocs4',
  }),
  prop({
    id: '5',
    owner: REGISTRY_MOCK_PREVIEW_ACCOUNT,
    name: 'City Center Condo',
    location: 'Addis Ababa',
    propertyType: 'Condo',
    priceEth: '1.8',
    isForSale: true,
    isForRent: true,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 950,
    parking: true,
    floors: 1,
    yearBuilt: 2022,
    metadataHash: 'QmMockCondo',
    imagesRootHash: 'QmMockImages5',
    documentsRootHash: 'QmMockDocs5',
  }),
  prop({
    id: '6',
    owner: OWNER_B,
    name: 'Mountain View Chalet',
    location: 'Adama',
    propertyType: 'House',
    priceEth: '4.5',
    isForSale: false,
    isForRent: true,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    parking: true,
    floors: 2,
    yearBuilt: 2016,
    metadataHash: 'QmMockChalet',
    imagesRootHash: 'QmMockImages6',
    documentsRootHash: 'QmMockDocs6',
  }),
  prop({
    id: '7',
    owner: OWNER_B,
    name: 'Riverside Townhouse',
    location: 'Dire Dawa',
    propertyType: 'Townhouse',
    priceEth: '2.1',
    isForSale: true,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1650,
    parking: true,
    floors: 2,
    yearBuilt: 2020,
    metadataHash: 'QmMockTownhouse',
    imagesRootHash: 'QmMockImages7',
    documentsRootHash: 'QmMockDocs7',
  }),
  prop({
    id: '8',
    owner: REGISTRY_MOCK_PREVIEW_ACCOUNT,
    name: 'Executive Office Suite',
    location: 'Addis Ababa',
    propertyType: 'Commercial',
    priceEth: '8',
    isForSale: true,
    bedrooms: 0,
    bathrooms: 2,
    sqft: 5200,
    parking: true,
    floors: 4,
    yearBuilt: 2017,
    metadataHash: 'QmMockOffice',
    imagesRootHash: 'QmMockImages8',
    documentsRootHash: 'QmMockDocs8',
  }),
  prop({
    id: '9',
    owner: OWNER_B,
    name: 'Greenfield Plot',
    location: 'Mekelle',
    propertyType: 'Land',
    priceEth: '0.9',
    isForSale: true,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 10000,
    parking: false,
    floors: 0,
    yearBuilt: 0,
    metadataHash: 'QmMockLand',
    imagesRootHash: 'QmMockImages9',
    documentsRootHash: 'QmMockDocs9',
  }),
];

export const mockOwnershipHistory: Record<string, OwnershipHistoryEntry[]> = {
  '1': [
    {
      owner: '0x0000000000000000000000000000000000000000',
      timestamp: 1704067200,
      price: parseEther('0'),
    },
    {
      owner: OWNER_B,
      timestamp: 1711929600,
      price: parseEther('4.2'),
    },
  ],
  '2': [
    {
      owner: REGISTRY_MOCK_PREVIEW_ACCOUNT,
      timestamp: 1714521600,
      price: parseEther('2'),
    },
  ],
};

export const mockMetadataVersions: Record<string, MetadataVersionEntry[]> = {
  '1': [
    { metadataHash: 'QmMockSunsetV1', timestamp: 1704067200 },
    { metadataHash: 'QmMockSunsetVilla', timestamp: 1711929600 },
  ],
  '2': [{ metadataHash: 'QmMockDowntownLoft', timestamp: 1714521600 }],
};

export const mockRegistryDocuments = [
  { name: 'Title deed (demo)', type: 'PDF' },
  { name: 'Inspection report (demo)', type: 'PDF' },
];

export async function loadMockRegistry(delayMs = 400): Promise<{
  properties: RegistryProperty[];
  propertyDbMap: PropertyDbMap;
}> {
  await new Promise((r) => setTimeout(r, delayMs));
  return {
    properties: [...mockRegistryProperties],
    propertyDbMap: { ...mockRegistryPropertyDbMap },
  };
}
