import { Contract, formatEther, type ContractRunner } from 'ethers';

import type { ChainRequestStatus, RegistryRequest } from '@/types/registry-request';
import { CONTRACT_ADDRESS } from '@/lib/web3/config';
import { getContract } from '@/lib/web3/contract';
import { getReadOnlyRegistryContract } from '@/lib/web3/registry-contract';

function toNumber(value: unknown): number {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return Number(value ?? 0);
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  return toNumber(value) !== 0;
}

function toStatus(value: unknown): ChainRequestStatus {
  const n = toNumber(value);
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 0;
}

/** Maps `requests(i)` return value.
 * ABI: { id, requester, details: { name, location, propertyType, price, isForSale,
 *   metadataHash, imagesRootHash, documentsRootHash, bedrooms, bathrooms, sqft,
 *   parking, floors, yearBuilt }, status, declineReason }
 */
export function mapChainRequest(raw: unknown, index: number): RegistryRequest {
  if (Array.isArray(raw)) {
    // Positional: [id, requester, details_tuple, status, declineReason]
    const [, requester, detailsRaw, status, declineReason] = raw;
    if (Array.isArray(detailsRaw)) {
      const [
        name, location, propertyType, price, isForSale,
        , , , // metadataHash, imagesRootHash, documentsRootHash
        bedrooms, bathrooms, sqft,
      ] = detailsRaw;
      return buildRequest(index, {
        requester, name, location, propertyType, price, isForSale,
        isForRent: false, bedrooms, bathrooms, sqft, status, declineReason,
      });
    }
    // Fallback flat array (old format)
    return buildRequest(index, {
      requester,
      name: raw[2], location: raw[3], propertyType: raw[4], price: raw[5],
      isForSale: raw[6], bedrooms: raw[10], bathrooms: raw[11], sqft: raw[12],
      status: raw[16], declineReason: raw[17],
    });
  }

  const r = raw as Record<string, unknown>;

  // Handle named-struct from ethers toObject() — details may be nested
  const details =
    r.details != null && typeof r.details === 'object'
      ? (r.details as Record<string, unknown>)
      : r;

  return buildRequest(index, {
    requester: r.requester,
    name: details.name,
    location: details.location,
    propertyType: details.propertyType,
    price: details.price,
    isForSale: details.isForSale,
    isForRent: details.isForRent,
    bedrooms: details.bedrooms,
    bathrooms: details.bathrooms,
    sqft: details.sqft,
    status: r.status,
    declineReason: r.declineReason,
  });
}

function buildRequest(
  index: number,
  r: Record<string, unknown>,
): RegistryRequest {
  // price in contract is stored as whole ETH integer (index.js submits form.price directly)
  const rawPrice = r.price ?? 0;
  const priceNum = toNumber(rawPrice);
  // If > 1e15 it's already in wei; otherwise treat as whole ETH
  const priceWei =
    priceNum > 1e15
      ? BigInt(String(rawPrice))
      : BigInt(priceNum) * BigInt('1000000000000000000');

  return {
    id: String(index),
    requester: String(r.requester ?? ''),
    name: String(r.name ?? `Request #${index}`),
    location: String(r.location ?? ''),
    propertyType: String(r.propertyType ?? ''),
    priceEth: formatEther(priceWei),
    isForSale: toBool(r.isForSale),
    isForRent: toBool(r.isForRent),
    status: toStatus(r.status),
    declineReason: String(r.declineReason ?? '').trim(),
    bedrooms: toNumber(r.bedrooms),
    bathrooms: toNumber(r.bathrooms),
    sqft: toNumber(r.sqft),
  };
}

export function filterRequestsByRequester(
  requests: RegistryRequest[],
  account: string,
): RegistryRequest[] {
  const wallet = account.toLowerCase();
  return requests.filter((r) => r.requester.toLowerCase() === wallet);
}

export function sortRequestsNewestFirst(requests: RegistryRequest[]): RegistryRequest[] {
  return [...requests].sort((a, b) => Number(b.id) - Number(a.id));
}

export function contractSupportsRequests(contract: Contract): boolean {
  try {
    return typeof contract.getTotalRequests === 'function';
  } catch {
    return false;
  }
}

export async function loadAllRegistryRequests(
  contract: Contract,
): Promise<RegistryRequest[]> {
  if (!contractSupportsRequests(contract)) {
    throw new Error(
      'Contract ABI is missing getTotalRequests. Update abi/RealEstate.json from the deployed artifact.',
    );
  }

  try {
    const totalBn: bigint = await contract.getTotalRequests();
    const total = Number(totalBn);
    
    console.log(`[loadAllRegistryRequests] Total requests in contract: ${total}`);
    
    // If there are no requests, return empty array
    if (total === 0) {
      console.log('[loadAllRegistryRequests] No requests found in contract');
      return [];
    }
    
    const list: RegistryRequest[] = [];

    for (let i = 0; i < total; i++) {
      try {
        const raw = await contract.requests(i);
        console.log(`[loadAllRegistryRequests] Loaded request ${i}:`, raw);
        list.push(mapChainRequest(raw, i));
      } catch (err) {
        // Log but continue if one request fails
        console.error(`[loadAllRegistryRequests] Could not load request ${i}:`, err);
      }
    }

    console.log(`[loadAllRegistryRequests] Successfully loaded ${list.length} requests`);
    return sortRequestsNewestFirst(list);
  } catch (error) {
    // Only catch empty data errors, re-throw others
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('could not decode') || errMsg.includes('BAD_DATA')) {
      console.log('[loadAllRegistryRequests] No requests in contract yet (empty data)');
      return [];
    }
    // Re-throw other errors so they bubble up
    console.error('[loadAllRegistryRequests] Error loading requests:', error);
    throw error;
  }
}

export function getRegistryRequestsContract(
  runner?: ContractRunner | null,
): Contract | null {
  if (!CONTRACT_ADDRESS) return null;
  if (runner) {
    try {
      return getContract(runner);
    } catch {
      return null;
    }
  }
  return getReadOnlyRegistryContract();
}
