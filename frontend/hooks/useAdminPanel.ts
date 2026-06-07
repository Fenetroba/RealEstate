'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  approveAdminRequest,
  declineAdminRequest,
  fetchAdminRequests,
  type AdminPropertyRequest,
} from '@/lib/api/admin';
import { matchApiRequestToChain } from '@/lib/admin-request-matching';
import { formatCommissionBps } from '@/lib/constants/admin-panel';
import { loadMockPendingUpdates } from '@/lib/mock-registry-updates';
import { loadAllRegistryRequests, getRegistryRequestsContract } from '@/lib/web3/registry-requests';
import {
  loadPendingUpdateRequests,
  readCommissionPercent,
} from '@/lib/web3/registry-update-requests';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { useProperties } from '@/hooks/useProperties';
import { useWeb3 } from '@/contexts/Web3Context';
import type { RegistryRequest } from '@/types/registry-request';
import type { RegistryUpdateRequest } from '@/types/registry-update-request';
import { useAppSelector } from '@/store/hooks';
import { selectAdminPreview, selectIsAppAdmin } from '@/lib/auth-selectors';
import { REGISTRY_MOCK_PREVIEW_ACCOUNT } from '@/lib/web3/registry-mock';
import type { DashboardOverviewStat } from '@/components/dashboard/DashboardOverviewStats';

export interface MintRequestReviewItem {
  chain: RegistryRequest;
  apiMatch: AdminPropertyRequest | null;
}

export function useAdminPanel() {
  const isAppAdmin = useAppSelector(selectIsAppAdmin);
  const adminPreview = useAppSelector(selectAdminPreview);
  const mockMode = isRegistryMockMode();
  const walletAddress = useAppSelector((s) => s.wallet.address);
  const address =
    walletAddress ??
    ((isAppAdmin || adminPreview) && mockMode ? REGISTRY_MOCK_PREVIEW_ACCOUNT : null);
  const { contract: writeContract } = useWeb3();

  const {
    properties,
    propertyDbMap,
    loading: catalogLoading,
    refreshing,
    chainError,
    apiWarning,
    refresh: refreshCatalog,
    readContract,
  } = useProperties();

  const [chainRequests, setChainRequests] = useState<RegistryRequest[]>([]);
  const [apiPending, setApiPending] = useState<AdminPropertyRequest[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<RegistryUpdateRequest[]>([]);
  const [commissionBps, setCommissionBps] = useState<number | null>(null);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registryError, setRegistryError] = useState<string | null>(null);

  const loadRegistryData = useCallback(async () => {
    if (!(isAppAdmin || adminPreview) || !address) {
      console.log('[useAdminPanel] Not admin or no address');
      setChainRequests([]);
      setApiPending([]);
      setPendingUpdates([]);
      setCommissionBps(null);
      return;
    }

    setRegistryLoading(true);
    setRegistryError(null);
    setApiError(null);

    try {
      console.log('[useAdminPanel] Loading registry data...');
      
      if (mockMode) {
        console.log('[useAdminPanel] Using mock mode');
        const { loadAllMockRegistryRequests } = await import('@/lib/mock-registry-requests');
        setChainRequests(loadAllMockRegistryRequests());
        setPendingUpdates(loadMockPendingUpdates());
        setCommissionBps(200);
        setApiPending([]);
        return;
      }

      const contract =
        writeContract ?? readContract ?? getRegistryRequestsContract(undefined);
      if (!contract) {
        throw new Error('Registry contract is not configured.');
      }

      console.log('[useAdminPanel] Loading all requests, updates, and commission...');
      const [allRequests, updates, commission, apiRows] = await Promise.all([
        loadAllRegistryRequests(contract),
        loadPendingUpdateRequests(contract, properties),
        readCommissionPercent(contract),
        fetchAdminRequests(address, 'PENDING').catch((err) => {
          console.error('[useAdminPanel] API requests fetch failed:', err);
          setApiError(err instanceof Error ? err.message : 'Could not load API pending list');
          return [] as AdminPropertyRequest[];
        }),
      ]);

      console.log('[useAdminPanel] Loaded data:', {
        requests: allRequests.length,
        updates: updates.length,
        commission,
        apiRows: apiRows.length,
      });

      setChainRequests(allRequests);
      setPendingUpdates(updates);
      setCommissionBps(commission);
      setApiPending(apiRows);
    } catch (err) {
      console.error('[useAdminPanel] Error loading registry data:', err);
      setRegistryError(err instanceof Error ? err.message : 'Could not load registry data');
      setChainRequests([]);
      setPendingUpdates([]);
    } finally {
      setRegistryLoading(false);
    }
  }, [isAppAdmin, adminPreview, address, mockMode, writeContract, readContract, properties]);

  useEffect(() => {
    void loadRegistryData();
  }, [loadRegistryData]);

  const refresh = useCallback(async () => {
    await Promise.all([refreshCatalog(), loadRegistryData()]);
  }, [refreshCatalog, loadRegistryData]);

  const pendingMint = useMemo(
    (): MintRequestReviewItem[] =>
      chainRequests
        .filter((r) => r.status === 0)
        .map((chain) => ({
          chain,
          apiMatch: matchApiRequestToChain(chain, apiPending),
        })),
    [chainRequests, apiPending],
  );

  const stats = useMemo((): DashboardOverviewStat[] => {
    const pendingMintCount = chainRequests.filter((r) => r.status === 0).length;
    const pendingUpdateCount = pendingUpdates.length;
    const totalPending = pendingMintCount + pendingUpdateCount;
    const approved = chainRequests.filter((r) => r.status === 1).length;
    const declined = chainRequests.filter((r) => r.status === 2).length;
    const listed = properties.filter((p) => p.isForSale).length;

    return [
      { label: 'Total properties', value: String(properties.length) },
      { label: 'Pending requests', value: String(totalPending) },
      { label: 'Approved requests', value: String(approved) },
      { label: 'Declined requests', value: String(declined) },
      { label: 'Listed for sale', value: String(listed) },
      {
        label: 'Commission rate',
        value: commissionBps != null ? formatCommissionBps(commissionBps) : '—',
      },
    ];
  }, [properties, chainRequests, pendingUpdates, commissionBps]);

  const loading = catalogLoading || registryLoading;
  const busy = loading || refreshing;

  return {
    isAppAdmin,
    address,
    writeContract,
    mockMode,
    properties,
    propertyDbMap,
    chainRequests,
    apiPending,
    pendingMint,
    pendingUpdates,
    stats,
    loading: busy,
    chainError,
    apiWarning,
    apiError,
    registryError,
    refresh,
    reloadRegistry: loadRegistryData,
  };
}
