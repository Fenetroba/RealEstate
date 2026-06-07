'use client';

import React from 'react';
import { Provider } from 'react-redux';

import { AuthHydrator } from '@/components/providers/AuthHydrator';
import { KycHydrator } from '@/components/providers/KycHydrator';
import { SavedPropertiesHydrator } from '@/components/providers/SavedPropertiesHydrator';
import { WalletStatusBanner } from '@/components/web3/WalletStatusBanner';
import { Web3Provider } from '@/contexts/Web3Context';
import { store } from '@/store';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Web3Provider>
        <AuthHydrator />
        <KycHydrator />
        <SavedPropertiesHydrator />
        <WalletStatusBanner />
        {children}
      </Web3Provider>
    </Provider>
  );
}
