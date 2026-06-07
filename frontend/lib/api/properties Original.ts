import { NFT_API_BASE_URL } from '@/lib/web3/config';
import type {
  PropertyDbMap,
  PropertyDbRow,
  PropertyDocumentDto,
  PropertyImageDto,
} from '@/types/registry-property';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function extractRows(payload: unknown): PropertyDbRow[] {
  if (Array.isArray(payload)) return payload as PropertyDbRow[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.properties)) return obj.properties as PropertyDbRow[];
    if (Array.isArray(obj.data)) return obj.data as PropertyDbRow[];
  }
  return [];
}

export function buildPropertyDbMap(rows: PropertyDbRow[]): PropertyDbMap {
  const map: PropertyDbMap = {};
  for (const row of rows) {
    const dbId = String(row.id ?? '');
    const rawTokenId = row.tokenId ?? row.token_id ?? row.nftId ?? row.nft_id ?? '';
    const tokenId = String(rawTokenId);
    if (!dbId || !tokenId) continue;

    // Store both raw string and numeric-normalised form (matches index.js behaviour)
    map[tokenId] = dbId;
    const numericKey = String(Number(tokenId));
    if (numericKey !== tokenId && numericKey !== 'NaN') {
      map[numericKey] = dbId;
    }
  }
  return map;
}

export async function fetchPropertyCatalog(): Promise<{
  rows: PropertyDbRow[];
  map: PropertyDbMap;
}> {
  const res = await fetch(`${NFT_API_BASE_URL}/api/properties`, {
    cache: 'no-store',
  });
  const data = await parseJson<unknown>(res);
  const rows = extractRows(data);
  return { rows, map: buildPropertyDbMap(rows) };
}

function extractImages(payload: unknown): PropertyImageDto[] {
  if (Array.isArray(payload)) return payload as PropertyImageDto[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.images)) return obj.images as PropertyImageDto[];
  }
  return [];
}


function extractDocuments(payload: unknown): PropertyDocumentDto[] {
  if (Array.isArray(payload)) return payload as PropertyDocumentDto[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.documents)) return obj.documents as PropertyDocumentDto[];
  }
  return [];
}

export async function fetchPropertyDocuments(dbId: string): Promise<PropertyDocumentDto[]> {
  const res = await fetch(`${NFT_API_BASE_URL}/api/properties/${dbId}/documents`, {
    cache: 'no-store',
  });
  const data = await parseJson<unknown>(res);
  return extractDocuments(data);
}

export interface PropertyRequestHashesDto {
  metadataHash: string;
  imagesRootHash: string;
  documentsRootHash: string;
}

export interface SubmitPropertyRequestResult {
  requestId: string;
  propertyId: string;
  tempId?: string;
  hashes: PropertyRequestHashesDto;
}

export async function confirmPropertyRequest(
  tempId: string,
  txHash: string,
): Promise<void> {
  //const res = await fetch(`${NFT_API_BASE_URL}/api/properties/confirm`, {
  const res = await fetch(`${NFT_API_BASE_URL}/api/properties/request/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempId, txHash }),
  });
  if (!res.ok) {
    // Non-fatal: log but don't throw — chain is already confirmed
    const text = await res.text().catch(() => '');
    console.warn('confirmPropertyRequest warning:', text || res.status);
  }
}

async function parseSubmitError(res: Response): Promise<string> {
  const text = await res.text().catch(() => res.statusText);
  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    if (typeof data.error === 'string' && data.error) return data.error;
    if (typeof data.message === 'string' && data.message) return data.message;
  } catch {
    /* not JSON */
  }
  return text || `Request failed (${res.status})`;
}

export async function submitPropertyRequest(
  form: {
    name: string;
    location: string;
    propertyType: string;
    price: string;
    isForSale: boolean;
    isForRent: boolean;
    bedrooms: string;
    bathrooms: string;
    sqft: string;
    parking: string;
    floors: string;
    yearBuilt: string;
  },
  imageFiles: File[],
  documentFiles: File[],
  walletAddress: string,
): Promise<SubmitPropertyRequestResult> {
  const body = new FormData();
  body.append('wallet', walletAddress);
  body.append('name', form.name.trim());
  body.append('location', form.location.trim());
  body.append('propertyType', form.propertyType);
  body.append('price', form.price.trim());
  body.append('isForSale', String(form.isForSale));
  body.append('isForRent', String(form.isForRent));
  body.append('bedrooms', form.bedrooms.trim());
  body.append('bathrooms', form.bathrooms.trim());
  body.append('sqft', form.sqft.trim());
  body.append('parking', form.parking.trim());
  body.append('floors', form.floors.trim());
  body.append('yearBuilt', form.yearBuilt.trim());

  for (const file of imageFiles) {
    body.append('images', file);
  }
  for (const file of documentFiles) {
    body.append('documents', file);
  }

  /*const res = await fetch(`${NFT_API_BASE_URL}/api/properties/request`, {
    method: 'POST',
    body,
  });*/
  const res = await fetch(`${NFT_API_BASE_URL}/api/properties/request/prepare`, {
    method: 'POST',
    body,
  });

  if (!res.ok) {
    throw new Error(await parseSubmitError(res));
  }

  const data = (await res.json()) as SubmitPropertyRequestResult;
  if (!data?.hashes?.metadataHash || !data?.hashes?.imagesRootHash || !data?.hashes?.documentsRootHash) {
    throw new Error('Server response missing property hashes');
  }
  return data;
}

export async function submitPropertyUpdateRequest(
  dbPropertyId: string,
  form: {
    name: string;
    location: string;
    propertyType: string;
    price: string;
    bedrooms: string;
    bathrooms: string;
    sqft: string;
    parking: string;
    floors: string;
    yearBuilt: string;
  },
  imageFiles: File[],
  documentFiles: File[],
  walletAddress: string,
): Promise<SubmitPropertyRequestResult> {
  const body = new FormData();
  body.append('wallet', walletAddress);
  body.append('name', form.name.trim());
  body.append('location', form.location.trim());
  body.append('propertyType', form.propertyType);
  body.append('price', form.price.trim());
  body.append('bedrooms', form.bedrooms.trim());
  body.append('bathrooms', form.bathrooms.trim());
  body.append('sqft', form.sqft.trim());
  body.append('parking', form.parking.trim());
  body.append('floors', form.floors.trim());
  body.append('yearBuilt', form.yearBuilt.trim());

  for (const file of imageFiles) {
    body.append('images', file);
  }
  for (const file of documentFiles) {
    body.append('documents', file);
  }

  const res = await fetch(
    `${NFT_API_BASE_URL}/api/properties/${encodeURIComponent(dbPropertyId)}/update-request`,
    { method: 'POST', body },
  );

  if (!res.ok) {
    throw new Error(await parseSubmitError(res));
  }

  const data = (await res.json()) as SubmitPropertyRequestResult;
  if (!data?.hashes?.metadataHash || !data?.hashes?.imagesRootHash || !data?.hashes?.documentsRootHash) {
    throw new Error('Server response missing property hashes');
  }
  return data;
}

/** @deprecated Prefer PropertyVerifyReport from @/types/property-verify */
export type PropertyVerifyResult = import('@/types/property-verify').PropertyVerifyPayload;

/** @deprecated Use fetchPropertyVerifyReport from @/lib/api/property-verify */
export async function verifyPropertyIntegrity(tokenId: string): Promise<PropertyVerifyResult> {
  const { fetchPropertyVerifyReport } = await import('@/lib/api/property-verify');
  return fetchPropertyVerifyReport(tokenId);
}

export async function fetchPropertyImages(
  dbId: string,
  versionNo?: number,
): Promise<PropertyImageDto[]> {
  const qs = versionNo != null ? `?versionNo=${versionNo}` : '';
  const res = await fetch(`${NFT_API_BASE_URL}/api/properties/${dbId}/images${qs}`, {
    cache: 'no-store',
  });
  const data = await parseJson<unknown>(res);
  return extractImages(data);
}
