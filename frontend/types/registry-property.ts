export interface RegistryProperty {
  id: string;
  owner: string;
  name: string;
  location: string;
  propertyType: string;
  priceEth: string;
  priceWei: bigint;
  rentPriceEth?: string;
  isForSale: boolean;
  isForRent: boolean;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  parking: boolean;
  floors: number;
  yearBuilt: number;
  metadataHash: string;
  imagesRootHash: string;
  documentsRootHash: string;
  // Geographic location — set from DB, null for on-chain-only properties
  latitude?: number | null;
  longitude?: number | null;
  elevation?: number | null;
  placeId?: string | null;
  address?: string | null;   // full formatted address from Google Maps
}

export interface PropertyDbRow {
  id: string;
  tokenId?: string | number;
  token_id?: string | number;
  nftId?: string | number;
  nft_id?: string | number;
  [key: string]: unknown;
}

export interface PropertyImageDto {
  mimeType: string;
  data: string;
  /** Backend may return either `fileName` or `name` */
  fileName?: string;
  name?: string;
}

export interface PropertyDocumentDto {
  mimeType: string;
  data: string;
  /** Backend may return either `fileName` or `name` */
  fileName?: string;
  name?: string;
  type?: string;
}

export type PropertyDbMap = Record<string, string>;

export interface OwnershipHistoryEntry {
  owner: string;
  timestamp?: bigint | number;
  price?: bigint | number;
  [key: string]: unknown;
}

export interface MetadataVersionEntry {
  versionNo?: number;
  metadataHash?: string;
  hash?: string;
  imagesRootHash?: string;
  documentsRootHash?: string;
  timestamp?: bigint | number;
  [key: string]: unknown;
}
