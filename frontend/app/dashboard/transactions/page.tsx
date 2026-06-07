'use client';

import Link from 'next/link';
import { ExternalLink, FileText, Loader2, RefreshCw, Wallet } from 'lucide-react';

import { DashboardDataTable, DashboardTableBody, DashboardTableHead, DashboardTableRow, DashboardTd, DashboardTh } from '@/components/dashboard/DashboardDataTable';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  DashboardTableAction,
  DashboardTableActions,
} from '@/components/dashboard/DashboardTableActions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWeb3 } from '@/contexts/Web3Context';
import {
  formatTransferAmountEth,
  useWalletRegistryTransfers,
  type WalletTransferRole,
} from '@/hooks/useWalletRegistryTransfers';
import { getExplorerTxUrl } from '@/lib/registry-explorer';
import { formatDate, truncateAddress } from '@/lib/utils';

const roleLabels: Record<WalletTransferRole, string> = {
  minted: 'Minted',
  received: 'Received',
  sent: 'Sent',
};

const roleBadgeVariant = {
  minted: 'navy' as const,
  received: 'success' as const,
  sent: 'warning' as const,
};

function ConnectGate() {
  return (
    <DashboardEmptyState
      icon={Wallet}
      title="Connect your wallet"
      description="We show registry transfer records where your address is the sender or receiver (demo history is attached per NFT in the catalog)."
      action={
        <div className="flex justify-center">
          <WalletConnectControl fullWidth />
        </div>
      }
    />
  );
}

export default function TransactionsPage() {
  const {
    transfers,
    loading,
    refreshing,
    chainError,
    mockMode,
    refresh,
    isConnected,
  } = useWalletRegistryTransfers();

  return (
    <DashboardShell>
      <DashboardHeader
        title="On-chain activity"
        description="Transfer history from the property registry for NFTs in the catalog that involve your wallet. Amounts are in ETH when recorded."
        actions={
          isConnected ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                refreshing || loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )
              }
              onClick={() => void refresh()}
              disabled={loading || refreshing}
            >
              Refresh
            </Button>
          ) : null
        }
      />

      {mockMode && isConnected ? (
        <p className="-mt-4 mb-6 text-xs text-muted">
          Demo mode — transfer rows come from registry mock metadata, not a live indexer.
        </p>
      ) : null}

      {!isConnected ? (
        <ConnectGate />
      ) : (
        <>
          {chainError ? (
            <div
              className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {chainError}
            </div>
          ) : null}

          <DashboardPanel title={`Transfers (${transfers.length})`} bodyClassName="p-0">
            {loading && transfers.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading activity…
              </div>
            ) : transfers.length === 0 ? (
              <DashboardEmptyState
                icon={FileText}
                title="No transfers for your wallet"
                description="Buy, rent, or receive a property NFT to see transfers here. Purchases and listings happen on each property page in ETH."
                className="border-0"
                action={
                  <Link href="/properties">
                    <Button variant="primary">View marketplace</Button>
                  </Link>
                }
              />
            ) : (
              <DashboardDataTable>
                <DashboardTableHead>
                  <tr>
                    <DashboardTh>Property</DashboardTh>
                    <DashboardTh>Type</DashboardTh>
                    <DashboardTh>Date</DashboardTh>
                    <DashboardTh>Amount</DashboardTh>
                    <DashboardTh>Tx hash</DashboardTh>
                    <DashboardTh className="text-right">Actions</DashboardTh>
                  </tr>
                </DashboardTableHead>
                <DashboardTableBody>
                  {transfers.map((row) => {
                    const explorerUrl = getExplorerTxUrl(row.transfer.txHash);
                    return (
                      <DashboardTableRow key={`${row.tokenId}-${row.transfer.txHash}`}>
                        <DashboardTd>
                          <Link
                            href={`/properties/${row.tokenId}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {row.propertyTitle}
                          </Link>
                          <p className="text-xs text-muted">NFT #{row.tokenId}</p>
                        </DashboardTd>
                        <DashboardTd>
                          <Badge variant={roleBadgeVariant[row.role]} size="sm">
                            {roleLabels[row.role]}
                          </Badge>
                        </DashboardTd>
                        <DashboardTd className="whitespace-nowrap text-muted">
                          {formatDate(row.transfer.timestamp)}
                        </DashboardTd>
                        <DashboardTd className="whitespace-nowrap font-semibold text-foreground">
                          {formatTransferAmountEth(row.transfer.price)}
                        </DashboardTd>
                        <DashboardTd>
                          <span className="font-mono text-xs text-muted">
                            {truncateAddress(row.transfer.txHash)}
                          </span>
                        </DashboardTd>
                        <DashboardTd>
                          <DashboardTableActions>
                            {explorerUrl ? (
                              <DashboardTableAction
                                label="View on explorer"
                                href={explorerUrl}
                                external
                                icon={<ExternalLink className="size-4" />}
                              />
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </DashboardTableActions>
                        </DashboardTd>
                      </DashboardTableRow>
                    );
                  })}
                </DashboardTableBody>
              </DashboardDataTable>
            )}
          </DashboardPanel>
        </>
      )}
    </DashboardShell>
  );
}
