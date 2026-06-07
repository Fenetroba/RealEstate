'use client';

import { useCallback, useEffect, useState } from 'react';

import { loadMockRegistryRequests } from '@/lib/mock-registry-requests';
import { EXPECTED_CHAIN_ID } from '@/lib/web3/config';
import {
  contractSupportsRequests,
  filterRequestsByRequester,
  getRegistryRequestsContract,
  loadAllRegistryRequests,
} from '@/lib/web3/registry-requests';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { useWeb3 } from '@/contexts/Web3Context';
import type { RegistryRequest } from '@/types/registry-request';
import { useAppSelector } from '@/store/hooks';

export function useMyRequests() {
  const { contract: signerContract } = useWeb3();
  const address = useAppSelector((s) => s.wallet.address);
  const chainId = useAppSelector((s) => s.wallet.chainId);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const mockMode = isRegistryMockMode();

  const [requests, setRequests] = useState<RegistryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isConnected || !address) {
      console.log('[useMyRequests] Not connected or no address');
      setRequests([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (!mockMode && chainId !== null && chainId !== EXPECTED_CHAIN_ID) {
      console.log('[useMyRequests] Wrong chain ID:', chainId);
      setRequests([]);
      setError(`Switch to chain ${EXPECTED_CHAIN_ID} to load your requests.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useMyRequests] Loading requests for address:', address);
      
      if (mockMode) {
        const mockRequests = loadMockRegistryRequests(address);
        console.log('[useMyRequests] Loaded mock requests:', mockRequests);
        setRequests(mockRequests);
        return;
      }

      const contract = signerContract ?? getRegistryRequestsContract(undefined);
      if (!contract) {
        console.error('[useMyRequests] No contract available');
        setRequests([]);
        setError('Registry contract is not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.');
        return;
      }

      if (!contractSupportsRequests(contract)) {
        console.error('[useMyRequests] Contract does not support requests');
        setRequests([]);
        setError(
          'Could not load requests — contract ABI is missing request views. Sync RealEstate.json from deployment.',
        );
        return;
      }

      console.log('[useMyRequests] Loading all registry requests...');
      const all = await loadAllRegistryRequests(contract);
      console.log('[useMyRequests] All requests:', all);
      
      const filtered = filterRequestsByRequester(all, address);
      console.log('[useMyRequests] Filtered requests for', address, ':', filtered);
      setRequests(filtered);
    } catch (err) {
      console.error('[useMyRequests] Error loading requests:', err);
      setRequests([]);
      setError(err instanceof Error ? err.message : 'Could not load requests');
    } finally {
      setLoading(false);
    }
  }, [address, chainId, isConnected, mockMode, signerContract]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    requests,
    loading,
    error,
    refresh: load,
    isConnected,
    mockMode,
  };
}
