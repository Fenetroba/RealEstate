import { NFT_API_BASE_URL } from '@/lib/web3/config';

export type {
  AdminRequestStatus,
  AdminPropertyRequest,
  ApproveAdminResult,
} from '@/lib/api/admin';

export {
  fetchAdminRequests,
  approveAdminRequest,
  declineAdminRequest,
} from '@/lib/api/admin';

/** @deprecated Use AdminPropertyRequest from @/lib/api/admin */
export type NftPropertyRequest = import('@/lib/api/admin').AdminPropertyRequest;

function adminHeaders(wallet: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-gov-wallet': wallet,
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** @deprecated Use fetchPropertyCatalog from @/lib/api/properties */
export async function fetchPublicProperties(): Promise<unknown> {
  const res = await fetch(`${NFT_API_BASE_URL}/properties`, {
    cache: 'no-store',
  });
  return parseJson(res);
}
