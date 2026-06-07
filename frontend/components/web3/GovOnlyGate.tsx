'use client';

import { ShieldAlert, Wallet } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { Button } from '@/components/ui/Button';
import { selectIsAppAdmin } from '@/lib/auth-selectors';
import { GOV_WALLET } from '@/lib/web3/config';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { selectIsGovWallet } from '@/lib/wallet-selectors';
import { useAppSelector } from '@/store/hooks';
import { useWeb3 } from '@/contexts/Web3Context';

interface GovOnlyGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function GovOnlyGate({
  children,
  title = 'Government access required',
  description = 'Connect the configured government wallet to use this area.',
}: GovOnlyGateProps) {
  const { connect } = useWeb3();
  const mockMode = isRegistryMockMode();
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const isGov = useAppSelector(selectIsGovWallet);
  const isAppAdmin = useAppSelector(selectIsAppAdmin);
  const address = useAppSelector((s) => s.wallet.address);
  const isConnecting = useAppSelector((s) => s.wallet.isConnecting);

  const canAccessGovTools = isGov || (mockMode && isAppAdmin);

  if (mockMode && isAppAdmin) {
    return <>{children}</>;
  }

  if (!isConnected) {
    return (
      <DashboardEmptyState
        icon={Wallet}
        title="Connect your wallet"
        description="Listing review uses the real-estate-nft registry API with government wallet authorization."
        action={
          <Button variant="primary" onClick={() => void connect()} disabled={isConnecting}>
            Wallet
          </Button>
        }
      />
    );
  }

  if (!canAccessGovTools) {
    return (
      <DashboardEmptyState
        icon={ShieldAlert}
        title={title}
        description={
          description +
          (GOV_WALLET
            ? ` Connected: ${address?.slice(0, 6)}…${address?.slice(-4)}. Expected gov wallet is configured in NEXT_PUBLIC_GOV_WALLET, or sign in with an ADMIN account (mock mode).`
            : ' Set NEXT_PUBLIC_GOV_WALLET in your environment to match the backend GOV_WALLET, or use an ADMIN account in mock mode.')
        }
        action={
          <Button href="/dashboard" variant="outline">
            Back to dashboard
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
