'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  PropertyVerifyApiError,
  fetchPropertyVerifyReport,
} from '@/lib/api/property-verify';
import { buildMockVerifyReport } from '@/lib/mock-property-verify';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import type { PropertyVerifyReport } from '@/types/property-verify';

export interface UsePropertyVerifyState {
  report: PropertyVerifyReport | null;
  loading: boolean;
  error: string | null;
  errorStatus: number | null;
  mockMode: boolean;
  refresh: () => Promise<void>;
}

export function usePropertyVerify(
  tokenId: string | undefined,
  options?: { propertyName?: string; enabled?: boolean },
): UsePropertyVerifyState {
  const mockMode = isRegistryMockMode();
  const enabled = options?.enabled !== false && !!tokenId;

  const [report, setReport] = useState<PropertyVerifyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!tokenId || !enabled) {
      setReport(null);
      setError(null);
      setErrorStatus(null);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      if (mockMode) {
        await new Promise((r) => setTimeout(r, 500));
        setReport(buildMockVerifyReport(tokenId, options?.propertyName));
        return;
      }

      const data = await fetchPropertyVerifyReport(tokenId);
      setReport(data);
    } catch (err) {
      setReport(null);
      if (err instanceof PropertyVerifyApiError) {
        setError(err.message);
        setErrorStatus(err.status);
      } else {
        setError(err instanceof Error ? err.message : 'Could not run integrity audit');
        setErrorStatus(null);
      }
    } finally {
      setLoading(false);
    }
  }, [tokenId, enabled, mockMode, options?.propertyName]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    report,
    loading,
    error,
    errorStatus,
    mockMode,
    refresh: load,
  };
}
