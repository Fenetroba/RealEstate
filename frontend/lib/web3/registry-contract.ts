import { Contract, formatEther, JsonRpcProvider, type ContractRunner } from 'ethers';

import type { MetadataVersionEntry, OwnershipHistoryEntry, RegistryProperty } from '@/types/registry-property';
import { CONTRACT_ADDRESS, RPC_URL } from '@/lib/web3/config';
import { CONTRACT_ABI, getContract } from '@/lib/web3/contract';

function toNumber(value: unknown): number {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  return Number(value ?? 0);
}

/**
 * The contract returns properties(i) as:
 *   { id, owner, details: { name, location, propertyType, price, isForSale,
 *     metadataHash, imagesRootHash, documentsRootHash, bedrooms, bathrooms,
 *     sqft, parking, floors, yearBuilt } }
 *
 * ethers v6 with named struct returns an object where nested structs are
 * accessible by name. We normalise both the nested-struct case and the legacy
 * flat case so old mock data still works.
 */
function mapChainProperty(raw: Record<string, unknown>, fallbackIndex: number): RegistryProperty {
  const id = raw.id != null ? String(raw.id) : String(fallbackIndex);

  // Prefer the nested `details` sub-object if present (matches real ABI)
  const details =
    raw.details != null && typeof raw.details === 'object'
      ? (raw.details as Record<string, unknown>)
      : raw;

  // price in the contract is stored as uint256 ETH (whole ether, not wei)
  // index.js submits form.price directly (e.g. "5") and the contract stores it as-is.
  // We multiply by 1e18 only to get a consistent priceEth display value.
  const rawPrice = details.price ?? 0;
  const priceNum = toNumber(rawPrice);
  // If the number looks like it's already in wei (>1e15) use it directly,
  // otherwise treat it as whole ETH and convert.
  const priceWei =
    priceNum > 1e15
      ? BigInt(String(rawPrice))
      : BigInt(priceNum) * BigInt('1000000000000000000');

  return {
    id,
    owner: String(raw.owner ?? ''),
    name: String(details.name ?? `Property #${id}`),
    location: String(details.location ?? ''),
    propertyType: String(details.propertyType ?? ''),
    priceEth: formatEther(priceWei),
    priceWei,
    isForSale: Boolean(details.isForSale),
    isForRent: Boolean(details.isForRent ?? false),
    bedrooms: toNumber(details.bedrooms),
    bathrooms: toNumber(details.bathrooms),
    sqft: toNumber(details.sqft),
    // parking is uint256 in the ABI — treat > 0 as true
    parking: toNumber(details.parking) > 0,
    floors: toNumber(details.floors),
    yearBuilt: toNumber(details.yearBuilt),
    metadataHash: String(details.metadataHash ?? ''),
    imagesRootHash: String(details.imagesRootHash ?? ''),
    documentsRootHash: String(details.documentsRootHash ?? ''),
  };
}

export function getReadOnlyRegistryContract(): Contract | null {
  if (!CONTRACT_ADDRESS) return null;
  try {
    const provider = new JsonRpcProvider(RPC_URL);
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch {
    return null;
  }
}

export function getRegistryContract(runner: ContractRunner): Contract {
  return getContract(runner);
}

export async function loadRegistryProperties(
  contract: Contract,
): Promise<RegistryProperty[]> {
  try {
    const totalBn: bigint = await contract.getTotalProperties();
    const total = Number(totalBn);
    
    // If there are no properties, return empty array
    if (total === 0) {
      return [];
    }
    
    const list: RegistryProperty[] = [];

    for (let i = 0; i < total; i++) {
      const raw = await contract.properties(i);
      let record: Record<string, unknown>;

      if (raw && typeof (raw as { toObject?: () => object }).toObject === 'function') {
        // ethers v6 Result object — toObject() expands named fields including nested structs
        record = (raw as { toObject: () => Record<string, unknown> }).toObject();
      } else if (Array.isArray(raw)) {
        // Array positional decode: [id, owner, details_tuple, ...]
        // details_tuple = [name, location, propertyType, price, isForSale,
        //   metadataHash, imagesRootHash, documentsRootHash,
        //   bedrooms, bathrooms, sqft, parking, floors, yearBuilt]
        const [id, owner, detailsRaw] = raw;
        if (Array.isArray(detailsRaw)) {
          const [
            name, location, propertyType, price, isForSale,
            metadataHash, imagesRootHash, documentsRootHash,
            bedrooms, bathrooms, sqft, parking, floors, yearBuilt,
          ] = detailsRaw;
          record = {
            id, owner,
            details: {
              name, location, propertyType, price, isForSale,
              metadataHash, imagesRootHash, documentsRootHash,
              bedrooms, bathrooms, sqft, parking, floors, yearBuilt,
            },
          };
        } else {
          // Fallback: treat as flat (old mock data)
          record = raw as unknown as Record<string, unknown>;
        }
      } else {
        record = (raw ?? {}) as Record<string, unknown>;
      }

      list.push(mapChainProperty(record, i));
    }
    
    return list;
  } catch (error) {
    // Handle case where contract returns empty data or function doesn't exist
    console.warn('Could not load registry properties:', error);
    return [];
  }
}

export async function fetchOwnershipHistory(
  contract: Contract,
  tokenId: string,
): Promise<OwnershipHistoryEntry[]> {
  try {
    const raw = await contract.getOwnershipHistory(tokenId);
    const rows = Array.isArray(raw) ? raw : [];
    
    // If no ownership history, return empty array
    if (rows.length === 0) {
      return [];
    }
    
    return rows.map((row: unknown) => {
      let r: Record<string, unknown>;
      if (typeof (row as { toObject?: () => Record<string, unknown> }).toObject === 'function') {
        r = (row as { toObject: () => Record<string, unknown> }).toObject();
      } else if (Array.isArray(row)) {
        // [from, to, price, timestamp]
        const [from, to, price, timestamp] = row;
        r = { from, to, price, timestamp };
      } else {
        r = row as Record<string, unknown>;
      }
      return {
        // Map 'from'/'to' as owner for display; keep raw fields too
        owner: String(r.to ?? r.owner ?? ''),
        from: String(r.from ?? ''),
        to: String(r.to ?? ''),
        timestamp: r.timestamp as OwnershipHistoryEntry['timestamp'],
        price: r.price as OwnershipHistoryEntry['price'],
      };
    });
  } catch (error) {
    // Handle case where contract returns empty data or ownership history doesn't exist
    console.warn('Could not fetch ownership history for token', tokenId, error);
    return [];
  }
}

export async function fetchMetadataVersions(
  contract: Contract,
  tokenId: string,
): Promise<MetadataVersionEntry[]> {
  try {
    const raw = await contract.getMetadataVersions(tokenId);
    const rows = Array.isArray(raw) ? raw : [];
    
    // If no versions, return empty array
    if (rows.length === 0) {
      return [];
    }
    
    return rows.map((row: unknown) => {
      let r: Record<string, unknown>;

      if (typeof (row as { toObject?: () => Record<string, unknown> }).toObject === 'function') {
        r = (row as { toObject: () => Record<string, unknown> }).toObject();
      } else if (Array.isArray(row)) {
        // Positional: [versionNo, metadataHash, imagesRootHash, documentsRootHash, timestamp]
        const [versionNo, metadataHash, imagesRootHash, documentsRootHash, timestamp] = row;
        r = { versionNo, metadataHash, imagesRootHash, documentsRootHash, timestamp };
      } else {
        r = (row ?? {}) as Record<string, unknown>;
      }

      return {
        versionNo: r.versionNo != null ? Number(r.versionNo) : undefined,
        metadataHash: typeof r.metadataHash === 'string'
          ? r.metadataHash
          : String(r.metadataHash ?? r.hash ?? ''),
        imagesRootHash: String(r.imagesRootHash ?? ''),
        documentsRootHash: String(r.documentsRootHash ?? ''),
        timestamp: r.timestamp as MetadataVersionEntry['timestamp'],
      };
    });
  } catch (error) {
    // Handle case where contract returns empty data or versions don't exist
    console.warn('Could not fetch metadata versions for token', tokenId, error);
    return [];
  }
}
