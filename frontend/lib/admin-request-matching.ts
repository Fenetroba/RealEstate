import type { AdminPropertyRequest } from '@/lib/api/admin';
import type { RegistryRequest } from '@/types/registry-request';

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function chainIndexCandidates(chain: RegistryRequest): string[] {
  return [chain.id, String(Number(chain.id))].filter(Boolean);
}

function apiIndexCandidates(row: AdminPropertyRequest): string[] {
  const fields = [row.chainRequestId, row.requestIndex, row.tokenId];
  return fields
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) => String(v));
}

function apiWallet(row: AdminPropertyRequest): string {
  // backend returns submittedBy — fall back to wallet for legacy
  return norm(String(row.submittedBy ?? row.wallet ?? ''));
}

function apiName(row: AdminPropertyRequest): string {
  // backend returns name — fall back to title for legacy
  return norm(String(row.name ?? row.title ?? ''));
}

/** DB row id for admin approve/decline API routes. */
export function resolveAdminRequestDbId(row: AdminPropertyRequest): string {
  return row.id;
}

/** DB property id for catalog media endpoints (images/documents). */
export function resolvePropertyDbId(row: AdminPropertyRequest): string {
  const propertyId = row.propertyId != null ? String(row.propertyId).trim() : '';
  if (propertyId) return propertyId;
  return row.id;
}

export function resolvePreviewDbId(
  chain: RegistryRequest,
  apiRow: AdminPropertyRequest | null,
  propertyDbMap: Record<string, string>,
): string | null {
  if (apiRow) {
    const fromApi = resolvePropertyDbId(apiRow);
    if (fromApi) return fromApi;
  }
  for (const key of chainIndexCandidates(chain)) {
    if (propertyDbMap[key]) return propertyDbMap[key];
  }
  return null;
}

export function matchApiRequestToChain(
  chain: RegistryRequest,
  apiPending: AdminPropertyRequest[],
): AdminPropertyRequest | null {
  const chainIds = new Set(chainIndexCandidates(chain).map(norm));

  for (const row of apiPending) {
    const apiIds = apiIndexCandidates(row);
    if (apiIds.some((id) => chainIds.has(norm(id)))) {
      return row;
    }
  }

  const requester = norm(chain.requester);
  const name = norm(chain.name);
  const location = norm(chain.location);

  for (const row of apiPending) {
    const rowWallet = apiWallet(row);
    const rowName = apiName(row);
    const rowLocation = row.location ? norm(String(row.location)) : '';

    // Primary match: wallet address — same logic as index.js
    if (rowWallet && rowWallet === requester) return row;

    // Secondary: wallet + name/location fuzzy
    if (rowWallet && rowWallet === requester) {
      if (rowName && rowName === name) return row;
      if (rowLocation && rowLocation === location) return row;
    }

    // Tertiary: name + location without wallet
    if (rowName && rowName === name && rowLocation && rowLocation === location) return row;
  }

  return null;
}
