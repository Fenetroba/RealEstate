import { createSelector } from '@reduxjs/toolkit';

import { isGovWalletAddress } from '@/lib/web3/config';
import type { RootState } from '@/store';

export const selectWalletAddress = (state: RootState) => state.wallet.address;

export const selectIsGovWallet = (state: RootState) =>
  isGovWalletAddress(state.wallet.address);

export const selectWalletBadges = createSelector(
  [
    (state: RootState) => state.wallet.address,
    (state: RootState) => state.wallet.isAdminOnChain,
    (state: RootState) => state.wallet.isConnected,
  ],
  (address, isAdminOnChain, isConnected) => {
    if (!isConnected || !address) return [];

    const badges: { label: string; variant: 'default' | 'gold' | 'verified' }[] = [
      { label: 'Citizen', variant: 'default' },
    ];

    if (isAdminOnChain) {
      badges.push({ label: 'Chain admin', variant: 'verified' });
    }
    if (isGovWalletAddress(address)) {
      badges.push({ label: 'Government', variant: 'gold' });
    }

    return badges;
  },
);
