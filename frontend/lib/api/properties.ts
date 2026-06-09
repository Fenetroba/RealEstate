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
  const res = await fetch(`${NFT_API_BASE_URL}/properties`, {
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

export async function fetchPropertyImages(
  dbId: string,
  versionNo?: number,
): Promise<PropertyImageDto[]> {
  const qs = versionNo != null ? `?versionNo=${versionNo}` : '';
  const res = await fetch(`${NFT_API_BASE_URL}/properties/${dbId}/images${qs}`, {
    cache: 'no-store',
  });
  const data = await parseJson<unknown>(res);
  return extractImages(data);
}

export async function fetchPropertyDocuments(dbId: string): Promise<PropertyDocumentDto[]> {
  const res = await fetch(`${NFT_API_BASE_URL}/properties/${dbId}/documents`, {
    cache: 'no-store',
  });
  const data = await parseJson<unknown>(res);
  return extractDocuments(data);
}

/** Fetch images for a pending request — uses the property ID the request belongs to */
export async function fetchRequestImages(propertyId: string): Promise<PropertyImageDto[]> {
  return fetchPropertyImages(propertyId);
}

/** Fetch documents for a pending request — uses the property ID the request belongs to */
export async function fetchRequestDocuments(propertyId: string): Promise<PropertyDocumentDto[]> {
  return fetchPropertyDocuments(propertyId);
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
  warnings?: {
    duplicateDocuments: { hash: string; fileName: string; propertyName: string }[];
    message: string;
  } | null;
}

export async function confirmPropertyRequest(
  tempId: string,
  txHash: string,
): Promise<void> {
  const res = await fetch(`${NFT_API_BASE_URL}/properties/request/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempId, txHash }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const errorMsg = text || `Failed to confirm request (${res.status})`;
    console.error('confirmPropertyRequest failed:', errorMsg);
    throw new Error(`Backend confirmation failed: ${errorMsg}`);
  }
}

async function parseSubmitError(res: Response): Promise<string> {
  const text = await res.text().catch(() => res.statusText);
  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    if (typeof data.error === 'string' && data.error) return data.error;
    if (typeof data.message === 'string' && data.message) return data.message;
  } catch { /* not JSON */ }
  return text || `Request failed (${res.status})`;
}

export async function submitPropertyRequest(
  form: {
    name: string; location: string; propertyType: string; price: string;
    isForSale: boolean; isForRent: boolean; bedrooms: string; bathrooms: string;
    sqft: string; parking: string; floors: string; yearBuilt: string;
    titleNumber?: string;
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
  if (form.titleNumber?.trim()) body.append('titleNumber', form.titleNumber.trim());
  for (const file of imageFiles) body.append('images', file);
  for (const file of documentFiles) body.append('documents', file);

  const res = await fetch(`${NFT_API_BASE_URL}/properties/request/prepare`, {
    method: 'POST',
    body,
  });
  if (!res.ok) throw new Error(await parseSubmitError(res));
  const data = (await res.json()) as SubmitPropertyRequestResult;
  if (!data?.hashes?.metadataHash || !data?.hashes?.imagesRootHash || !data?.hashes?.documentsRootHash) {
    throw new Error('Server response missing property hashes');
  }
  return data;
}

export async function submitPropertyUpdateRequest(
  dbPropertyId: string,
  form: {
    name: string; location: string; propertyType: string; price: string;
    bedrooms: string; bathrooms: string; sqft: string; parking: string;
    floors: string; yearBuilt: string;
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
  for (const file of imageFiles) body.append('images', file);
  for (const file of documentFiles) body.append('documents', file);

  const res = await fetch(
    `${NFT_API_BASE_URL}/properties/${encodeURIComponent(dbPropertyId)}/update-request`,
    { method: 'POST', body },
  );
  if (!res.ok) throw new Error(await parseSubmitError(res));
  const data = (await res.json()) as SubmitPropertyRequestResult;
  if (!data?.hashes?.metadataHash || !data?.hashes?.imagesRootHash || !data?.hashes?.documentsRootHash) {
    throw new Error('Server response missing property hashes');
  }
  return data;
}

export type PropertyVerifyResult = import('@/types/property-verify').PropertyVerifyPayload;

export async function verifyPropertyIntegrity(tokenId: string): Promise<PropertyVerifyResult> {
  const { fetchPropertyVerifyReport } = await import('@/lib/api/property-verify');
  return fetchPropertyVerifyReport(tokenId);
}

/**
 * Fetch all MINTED (approved) properties belonging to the authenticated user.
 * Requires the JWT access token — calls GET /api/properties/mine.
 * Optionally pass the connected wallet address to broaden the match.
 */
export async function fetchMyApprovedProperties(
  walletAddress?: string,
): Promise<PropertyDbRow[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token) return [];

  const qs = walletAddress ? `?wallet=${encodeURIComponent(walletAddress.toLowerCase())}` : '';
  const res = await fetch(`${NFT_API_BASE_URL}/properties/mine${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { success: boolean; data: PropertyDbRow[] };
  return Array.isArray(data.data) ? data.data : [];
}