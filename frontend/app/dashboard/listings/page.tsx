'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FilePlus, Loader2, Plus, RefreshCw, Wallet } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardOverviewStats, type DashboardOverviewStat } from '@/components/dashboard/DashboardOverviewStats';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MyListingRow } from '@/components/dashboard/MyListingRow';
import { UnlistedOwnedRow } from '@/components/dashboard/UnlistedOwnedRow';
import { Button } from '@/components/ui/Button';
import { useWeb3 } from '@/contexts/Web3Context';
import { Pagination } from '@/components/ui/Pagination';
import {
  marketplaceListingsConnectDescription,
  marketplaceListingsConnectTitle,
  marketplaceListingsPageDescription,
  marketplaceListingsPageTitle,
} from '@/lib/constants/dashboard-portfolio';
import { dashboardCardClass, dashboardPanelClass, dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';
import {
  filterListedProperties,
  useMyMarketplaceListings,
} from '@/hooks/useMyMarketplaceListings';
import { paginateItems } from '@/lib/pagination';
import { typeNavLink } from '@/lib/responsive';
import { cn } from '@/lib/utils';

type ListingTab = 'all' | 'sale' | 'rent' | 'unlisted';

const PAGE_SIZE = 6;

const tabs: { id: ListingTab; label: string }[] = [
  { id: 'all', label: 'All listed' },
  { id: 'sale', label: 'For sale' },
  { id: 'rent', label: 'For rent' },
  { id: 'unlisted', label: 'Not listed' },
];

function MarketplaceListingsConnectGate() {
  const { connect } = useWeb3();
  return (
    <DashboardEmptyState
      icon={Wallet}
      title={marketplaceListingsConnectTitle}
      description={marketplaceListingsConnectDescription}
      action={
        <div className="flex justify-center">
          <Button variant="primary" onClick={() => void connect()}>Connect Wallet</Button>
        </div>
      }
    />
  );
}

export default function MarketplaceListingsPage() {
  const [activeTab, setActiveTab] = useState<ListingTab>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    listedProperties,
    unlistedRegistry,
    counts,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh,
    isConnected,
  } = useMyMarketplaceListings();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredListed = useMemo(
    () =>
      activeTab === 'unlisted'
        ? []
        : filterListedProperties(listedProperties, activeTab),
    [listedProperties, activeTab],
  );

  const filteredUnlisted = activeTab === 'unlisted' ? unlistedRegistry : [];

  const listedPagination = useMemo(
    () => paginateItems(filteredListed, currentPage, PAGE_SIZE),
    [filteredListed, currentPage],
  );

  const unlistedPagination = useMemo(
    () => paginateItems(filteredUnlisted, currentPage, PAGE_SIZE),
    [filteredUnlisted, currentPage],
  );

  const pagination = activeTab === 'unlisted' ? unlistedPagination : listedPagination;
  const listCount =
    activeTab === 'unlisted' ? filteredUnlisted.length : filteredListed.length;

  useEffect(() => {
    if (currentPage > pagination.totalPages && pagination.totalPages > 0) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const tabCounts = useMemo(
    () => ({
      all: listedProperties.length,
      sale: filterListedProperties(listedProperties, 'sale').length,
      rent: filterListedProperties(listedProperties, 'rent').length,
      unlisted: unlistedRegistry.length,
    }),
    [listedProperties, unlistedRegistry],
  );

  const stats: DashboardOverviewStat[] = useMemo(
    () => [
      { label: 'Owned NFTs', value: String(counts.owned) },
      {
        label: 'On marketplace',
        value: String(counts.listed),
        change: counts.listed === 1 ? '1 live listing' : `${counts.listed} live listings`,
        positive: counts.listed > 0,
      },
      {
        label: 'For sale',
        value: String(counts.forSale),
        change: counts.unlisted > 0 ? `${counts.unlisted} not listed yet` : 'All owned NFTs listed',
        positive: counts.forSale > 0,
      },
      {
        label: 'For rent',
        value: String(counts.forRent),
        change: 'From on-chain registry flags',
        positive: counts.forRent > 0,
      },
    ],
    [counts],
  );

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title={marketplaceListingsPageTitle}
          description={marketplaceListingsPageDescription}
          actions={
            isConnected ? (
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/my-properties">
                  <Button variant="outline" size="sm">
                    Registry NFTs
                  </Button>
                </Link>
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
                <Link href="/dashboard/listings/create">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="size-4" />}>
                    Submit registration
                  </Button>
                </Link>
              </div>
            ) : null
          }
        />

        {mockMode && isConnected ? (
          <p className="-mt-4 text-xs text-muted">
            Demo mode — listing status comes from the registry mock. Connect a live contract for
            production.
          </p>
        ) : null}

        {apiWarning && isConnected ? (
          <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
            {apiWarning}
          </p>
        ) : null}

        {!isConnected ? (
          <MarketplaceListingsConnectGate />
        ) : (
          <>
            {chainError ? (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {chainError}
              </div>
            ) : null}

            <div className="flex gap-6 overflow-x-auto border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    '-mb-px shrink-0 border-b-2 pb-3 font-semibold transition-colors',
                    typeNavLink,
                    activeTab === tab.id
                      ? 'border-accent text-foreground'
                      : 'border-transparent text-muted hover:text-foreground',
                  )}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    ({tabCounts[tab.id]})
                  </span>
                </button>
              ))}
            </div>

            <section className={cn(dashboardPanelClass, 'w-full min-w-0')}>
              <DashboardSectionLabel className="mb-6 block">Your portfolio</DashboardSectionLabel>
              <DashboardOverviewStats stats={stats} />
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between gap-4">
                <DashboardSectionLabel className="block">
                  {activeTab === 'unlisted'
                    ? 'Owned — not on marketplace'
                    : tabs.find((t) => t.id === activeTab)?.label}
                </DashboardSectionLabel>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-accent"
                >
                  View marketplace
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {loading && listCount === 0 && !chainError ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  Loading your listings…
                </div>
              ) : listCount === 0 ? (
                <DashboardEmptyState
                  icon={FilePlus}
                  title={
                    activeTab === 'unlisted'
                      ? 'All owned NFTs are listed'
                      : 'Nothing listed in this view'
                  }
                  description={
                    activeTab === 'unlisted'
                      ? 'Every NFT in your wallet is flagged for sale or rent on the registry.'
                      : 'Register a property, then open its page to list for sale or rent.'
                  }
                  action={
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Link href="/dashboard/listings/create">
                        <Button variant="primary" leftIcon={<Plus className="size-4" />}>
                          Submit registration
                        </Button>
                      </Link>
                      {activeTab !== 'unlisted' ? (
                        <Link href="/dashboard/my-properties">
                          <Button variant="outline">Registry NFTs</Button>
                        </Link>
                      ) : null}
                    </div>
                  }
                />
              ) : (
                <div className={cn(dashboardCardClass, 'overflow-hidden')}>
                  {activeTab === 'unlisted'
                    ? unlistedPagination.items.map((property) => (
                        <UnlistedOwnedRow key={property.id} property={property} />
                      ))
                    : listedPagination.items.map((listing) => (
                        <MyListingRow key={listing.id} listing={listing} />
                      ))}
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
