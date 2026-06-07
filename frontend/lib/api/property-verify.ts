import { NFT_API_BASE_URL } from '@/lib/web3/config';
import type { PropertyVerifyPayload, PropertyVerifyReport } from '@/types/property-verify';

export class PropertyVerifyApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'PropertyVerifyApiError';
    this.status = status;
  }
}

async function parseVerifyError(res: Response): Promise<never> {
  const text = await res.text().catch(() => res.statusText);
  let message = text || `Verify failed (${res.status})`;
  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    if (data.error) message = data.error;
    else if (data.message) message = data.message;
  } catch {
    /* plain text */
  }
  throw new PropertyVerifyApiError(message, res.status);
}

function normalizeReport(payload: PropertyVerifyPayload, tokenId: string): PropertyVerifyReport {
  const tamperProof =
    typeof payload.tamperProof === 'boolean'
      ? payload.tamperProof
      : payload.ok === true || payload.valid === true;

  return {
    ...payload,
    tokenId: String(payload.tokenId ?? tokenId),
    tamperProof,
    chainError: payload.chainError ?? null,
    filesIntegrity: Array.isArray(payload.filesIntegrity) ? payload.filesIntegrity : [],
    versionHistory: Array.isArray(payload.versionHistory) ? payload.versionHistory : [],
  };
}

export async function fetchPropertyVerifyReport(tokenId: string): Promise<PropertyVerifyReport> {
  const res = await fetch(`${NFT_API_BASE_URL}/verify/${encodeURIComponent(tokenId)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return parseVerifyError(res);
  }

  const data = (await res.json()) as PropertyVerifyPayload;
  return normalizeReport(data, tokenId);
}
