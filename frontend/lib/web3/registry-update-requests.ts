import type { Contract } from 'ethers';

import { formatVersionTimestamp } from '@/lib/metadata-versions';
import type { ChainUpdateStatus, RegistryUpdateRequest } from '@/types/registry-update-request';
import type { RegistryProperty } from '@/types/registry-property';

function toNumber(value: unknown): number {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  return Number(value ?? 0);
}

function toStatus(value: unknown): ChainUpdateStatus {
  const n = toNumber(value);
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 0;
}

function mapUpdateRow(
  propertyId: string,
  updateIndex: number,
  raw: unknown,
): RegistryUpdateRequest {
  let r: Record<string, unknown>;

  if (raw && typeof (raw as { toObject?: () => object }).toObject === 'function') {
    // ethers v6 Result with named fields
    r = (raw as { toObject: () => Record<string, unknown> }).toObject();
  } else if (Array.isArray(raw)) {
    // ABI positional order: [id, propertyId, requester, newMetadataHash,
    //   newImagesRootHash, newDocumentsRootHash, status, declineReason, timestamp]
    const [, , requester, , , , status, declineReason, timestamp] = raw;
    r = { requester, status, declineReason, timestamp };
  } else if (raw && typeof raw === 'object') {
    r = raw as Record<string, unknown>;
  } else {
    r = {};
  }

  return {
    propertyId,
    updateIndex,
    requester: String(r.requester ?? ''),
    status: toStatus(r.status),
    declineReason: String(r.declineReason ?? '').trim(),
    timestampLabel: formatVersionTimestamp(r.timestamp),
  };
}

export function contractSupportsUpdateRequests(contract: Contract): boolean {
  try {
    return typeof contract.getUpdateRequests === 'function';
  } catch {
    return false;
  }
}

export async function loadPendingUpdateRequests(
  contract: Contract,
  properties: RegistryProperty[],
): Promise<RegistryUpdateRequest[]> {
  if (!contractSupportsUpdateRequests(contract)) {
    return [];
  }

  const pending: RegistryUpdateRequest[] = [];

  for (const property of properties) {
    try {
      const raw = await contract.getUpdateRequests(property.id);
      const rows = Array.isArray(raw) ? raw : [];
      rows.forEach((row: unknown, index: number) => {
        const mapped = mapUpdateRow(property.id, index, row);
        if (mapped.status === 0) {
          pending.push(mapped);
        }
      });
    } catch {
      /* property may have no update array */
    }
  }

  return pending.sort((a, b) => {
    const ta = a.timestampLabel;
    const tb = b.timestampLabel;
    return tb.localeCompare(ta);
  });
}

export async function readCommissionPercent(contract: Contract): Promise<number | null> {
  try {
    if (typeof contract.commissionPercent !== 'function') return null;
    const value = await contract.commissionPercent();
    const percent = toNumber(value);
    // Contract returns percentage (2), convert to basis points (200) for display
    return percent * 100;
  } catch {
    return null;
  }
}
