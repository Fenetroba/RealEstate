'use client';

import { useMemo } from 'react';

import { useProperties } from '@/hooks/useProperties';
import { registryToProperty } from '@/lib/registry-property-mapper';
import { useAppSelector } from '@/store/hooks';
import type { TransferRecord } from '@/types';

export type WalletTransferRole = 'minted' | 'received' | 'sent';

export interface WalletRegistryTransferRow {
  tokenId: string;
  propertyTitle: string;
  transfer: TransferRecord;
  role: WalletTransferRole;
}

function roleForTransfer(
  transfer: TransferRecord,
  wallet: string,
): WalletTransferRole | null {
  const from = transfer.from.toLowerCase();
  const to = transfer.to.toLowerCase();
  const zero = '0x0000000000000000000000000000000000000000';

  if (from === zero && to === wallet) return 'minted';
  if (to === wallet) return 'received';
  if (from === wallet) return 'sent';
  return null;
}

export function formatTransferAmountEth(price: number): string {
  if (!price || price <= 0) return '—';
  return `${price.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
}

export function useWalletRegistryTransfers() {
  const address = useAppSelector((s) => s.wallet.address);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);

  const { properties, loading, refreshing, chainError, mockMode, refresh } = useProperties();

  const transfers = useMemo(() => {
    if (!address) return [];
    const wallet = address.toLowerCase();
    const rows: WalletRegistryTransferRow[] = [];

    for (const registry of properties) {
      const mapped = registryToProperty(registry);
      const history = mapped.blockchain.transferHistory ?? [];

      for (const transfer of history) {
        const role = roleForTransfer(transfer, wallet);
        if (!role) continue;
        rows.push({
          tokenId: registry.id,
          propertyTitle: registry.name,
          transfer,
          role,
        });
      }
    }

    return rows.sort(
      (a, b) =>
        new Date(b.transfer.timestamp).getTime() - new Date(a.transfer.timestamp).getTime(),
    );
  }, [properties, address]);

  return {
    transfers,
    loading,
    refreshing,
    chainError,
    mockMode,
    refresh,
    isConnected,
  };
}
