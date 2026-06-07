import { NFT_API_BASE_URL } from '@/lib/web3/config';

export type AdminRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminPropertyRequest {
  id: string;
  status: AdminRequestStatus;
  // actual backend field names (from backend/routes/admin.js)
  submittedBy?: string;       // wallet address of requester
  name?: string;              // property name
  location?: string;
  price?: string | number;
  propertyId?: string;
  tokenId?: string | number;
  type?: string;              // 'MINT' | 'UPDATE'
  declineReason?: string;
  metadataSnapshot?: Record<string, unknown>;
  documentIds?: string[];
  createdAt?: string;
  // legacy / fallback aliases
  wallet?: string;
  title?: string;
  chainRequestId?: string | number;
  requestIndex?: string | number;
  [key: string]: unknown;
}

function adminHeaders(wallet: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-gov-wallet': wallet,
  };
}

function parseAdminError(res: Response, fallback: string): Promise<never> {
  return res.text().then((text) => {
    let message = text || fallback;
    try {
      const data = JSON.parse(text) as { error?: string; message?: string };
      if (data.error) message = data.error;
      else if (data.message) message = data.message;
    } catch {
      /* plain text */
    }
    if (res.status === 401) {
      throw new Error(message || 'Missing government wallet header.');
    }
    if (res.status === 403) {
      throw new Error(message || 'This wallet is not authorized for admin actions.');
    }
    if (res.status === 502) {
      throw new Error(message || 'Registry service could not complete the on-chain action.');
    }
    throw new Error(message || `${fallback} (${res.status})`);
  });
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    return parseAdminError(res, 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function fetchAdminRequests(
  wallet: string,
  status: AdminRequestStatus = 'PENDING',
): Promise<AdminPropertyRequest[]> {
  const params = new URLSearchParams({ status });
  const res = await fetch(`${NFT_API_BASE_URL}/admin/requests?${params}`, {
    headers: adminHeaders(wallet),
    cache: 'no-store',
  });
  const data = await parseJson<AdminPropertyRequest[] | { requests: AdminPropertyRequest[] }>(res);
  return Array.isArray(data) ? data : (data.requests ?? []);
}

export interface ApproveAdminResult {
  tokenId?: string;
  txHash?: string;
  message?: string;
  [key: string]: unknown;
}

export async function approveAdminRequest(
  wallet: string,
  dbRequestId: string,
  onChainRequestId?: number,
  onChainUpdateIndex?: number,
): Promise<ApproveAdminResult> {
  const res = await fetch(
    `${NFT_API_BASE_URL}/admin/approve/${encodeURIComponent(dbRequestId)}`,
    {
      method: 'POST',
      headers: adminHeaders(wallet),
      body: JSON.stringify({ onChainRequestId, onChainUpdateIndex }),
    },
  );
  return parseJson(res);
}

export async function approveUpdateAdminRequest(
  wallet: string,
  dbRequestId: string,
  onChainUpdateIndex: number,
): Promise<ApproveAdminResult> {
  const res = await fetch(
    `${NFT_API_BASE_URL}/admin/approve/${encodeURIComponent(dbRequestId)}`,
    {
      method: 'POST',
      headers: adminHeaders(wallet),
      body: JSON.stringify({ onChainUpdateIndex }),
    },
  );
  return parseJson(res);
}

export async function declineUpdateAdminRequest(
  wallet: string,
  dbRequestId: string,
  reason: string,
): Promise<unknown> {
  const res = await fetch(
    `${NFT_API_BASE_URL}/admin/decline/${encodeURIComponent(dbRequestId)}`,
    {
      method: 'POST',
      headers: adminHeaders(wallet),
      body: JSON.stringify({ reason }),
    },
  );
  return parseJson(res);
}

export async function declineAdminRequest(
  wallet: string,
  dbRequestId: string,
  reason: string,
): Promise<unknown> {
  const res = await fetch(
    `${NFT_API_BASE_URL}/admin/decline/${encodeURIComponent(dbRequestId)}`,
    {
      method: 'POST',
      headers: adminHeaders(wallet),
      body: JSON.stringify({ reason }),
    },
  );
  return parseJson(res);
}
