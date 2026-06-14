'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, ExternalLink,
  FileText, Loader2, RefreshCw, Sparkles, Wallet,
} from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store/hooks';
import { useWeb3 } from '@/contexts/Web3Context';
import {
  getReadOnlyRegistryContract,
  fetchOwnershipHistory,
} from '@/lib/web3/registry-contract';
import { fetchPropertyCatalog } from '@/lib/api/properties';
import { formatRelativeTime, truncateAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TxRow {
  tokenId:       string;
  propertyName:  string;
  role:          'minted' | 'received' | 'sent';
  from:          string;
  to:            string;
  priceEth:      string;
  timestamp:     number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ethFromBigish(raw: bigint | number | string | undefined): string {
  if (!raw) return '—';
  try {
    const wei = typeof raw === 'bigint' ? raw : BigInt(String(raw));
    if (wei === 0n) return '—';
    // Convert from wei to ETH
    const eth = Number(wei) / 1e18;
    return eth > 0 ? `${eth.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH` : '—';
  } catch {
    return '—';
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const walletAddress = useAppSelector((s) => s.wallet.address);
  const isConnected   = useAppSelector((s) => s.wallet.isConnected);
  const { contract: signerContract } = useWeb3();

  const [rows,    setRows]    = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);

    try {
      const wallet = walletAddress.toLowerCase();
      const zero   = '0x0000000000000000000000000000000000000000';

      // Get DB catalog to map tokenId → property name
      const catalog = await fetchPropertyCatalog();
      const nameMap: Record<string, string> = {};
      for (const row of catalog.rows) {
        const r = row as Record<string, unknown>;
        const tid = String(r.tokenId ?? r.token_id ?? '');
        if (tid) nameMap[tid] = String(r.name ?? `Property #${tid}`);
      }

      const contract = signerContract ?? getReadOnlyRegistryContract();
      if (!contract) {
        setError('Connect your wallet or configure the contract address to load activity.');
        return;
      }

      // Get total NFTs on chain
      let total = 0;
      try {
        const t = await contract.getTotalProperties();
        total = Number(t);
      } catch { total = 0; }

      const result: TxRow[] = [];

      // Fetch ownership history for each token
      await Promise.all(
        Array.from({ length: total }, (_, i) => String(i)).map(async (tid) => {
          try {
            const history = await fetchOwnershipHistory(contract, tid);
            for (const h of history) {
              const from = String(h.from ?? '').toLowerCase();
              const to   = String(h.to   ?? '').toLowerCase();

              let role: TxRow['role'] | null = null;
              if (from === zero && to === wallet) role = 'minted';
              else if (to === wallet)              role = 'received';
              else if (from === wallet)            role = 'sent';

              if (!role) continue;

              result.push({
                tokenId:      tid,
                propertyName: nameMap[tid] ?? `Property #${tid}`,
                role,
                from:         String(h.from ?? ''),
                to:           String(h.to   ?? ''),
                priceEth:     ethFromBigish(h.price as bigint | number | string | undefined),
                timestamp:    typeof h.timestamp === 'bigint'
                  ? Number(h.timestamp) * 1000
                  : (Number(h.timestamp ?? 0)) * 1000,
              });
            }
          } catch { /* skip token */ }
        }),
      );

      // Sort newest first
      result.sort((a, b) => b.timestamp - a.timestamp);
      setRows(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, signerContract]);

  useEffect(() => {
    if (isConnected && walletAddress) void load();
  }, [isConnected, walletAddress, load]);

  // ── Render ────────────────────────────────────────────────────────────────

  const roleConfig = {
    minted:   { label: 'Minted',   icon: <Sparkles    className="size-3.5" />, variant: 'default'  as const, color: 'text-blue-600'  },
    received: { label: 'Received', icon: <ArrowDownLeft className="size-3.5" />, variant: 'verified' as const, color: 'text-green-600' },
    sent:     { label: 'Sent',     icon: <ArrowUpRight  className="size-3.5" />, variant: 'warning'  as const, color: 'text-amber-600' },
  };

  return (
    <DashboardShell>
      <DashboardHeader
        title="On-chain activity"
        description="Property transfer history for your wallet — purchases, sales, and mints from the blockchain."
        actions={
          isConnected ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </Button>
          ) : null
        }
      />

      {!isConnected ? (
        <DashboardEmptyState
          icon={Wallet}
          title="Connect your wallet"
          description="Connect MetaMask to see your on-chain property transfer history."
        />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <DashboardPanel title={`Transfers (${rows.length})`} bodyClassName="p-0">
          {loading && rows.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <Loader2 className="size-5 animate-spin" />
              Loading on-chain activity…
            </div>
          ) : rows.length === 0 ? (
            <DashboardEmptyState
              icon={FileText}
              title="No on-chain transactions yet"
              description="Buy, sell, or receive a property NFT to see your transfer history here."
              className="border-0"
              action={
                <Link href="/properties">
                  <Button variant="primary">Browse marketplace</Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {rows.map((row, i) => {
                const cfg = roleConfig[row.role];
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      row.role === 'received' ? 'bg-green-100 dark:bg-green-900/30'
                      : row.role === 'sent'   ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30',
                    )}>
                      <span className={cfg.color}>{cfg.icon}</span>
                    </div>

                    {/* Property info */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/properties/${row.tokenId}`}
                        className="font-semibold text-foreground hover:text-accent truncate block"
                      >
                        {row.propertyName}
                      </Link>
                      <p className="text-xs text-muted">
                        {row.role === 'sent'
                          ? `To ${truncateAddress(row.to)}`
                          : row.role === 'minted'
                          ? 'Minted to your wallet'
                          : `From ${truncateAddress(row.from)}`}
                      </p>
                    </div>

                    {/* Badge */}
                    <Badge variant={cfg.variant} size="sm" className="shrink-0 gap-1">
                      {cfg.icon}
                      {cfg.label}
                    </Badge>

                    {/* Amount */}
                    <p className={cn('shrink-0 text-sm font-semibold', cfg.color)}>
                      {row.priceEth}
                    </p>

                    {/* Date */}
                    <p className="shrink-0 text-xs text-muted hidden sm:block">
                      {row.timestamp > 0 ? formatRelativeTime(new Date(row.timestamp).toISOString()) : '—'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardPanel>
      )}
    </DashboardShell>
  );
}
