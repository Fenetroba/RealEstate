'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { DashboardOverviewStats, type DashboardOverviewStat } from '@/components/dashboard/DashboardOverviewStats';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { mockUser } from '@/lib/mockData';
import { dashboardCardClass, dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { appProseMaxClass, typeH1, typeLead, typeNavLink } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import { selectIsAppAdmin } from '@/lib/auth-selectors';
import { useAppSelector } from '@/store/hooks';

type UserMode = 'BUYER' | 'SELLER' | 'TENANT';

const buyerStats: DashboardOverviewStat[] = [
  { label: 'Marketplace', value: 'Browse', change: 'Verified on-chain listings', positive: true },
  { label: 'Saved', value: 'Listings', change: 'Bookmark from /properties', positive: true },
  { label: 'Activity', value: 'Requests', change: 'Registration & updates', positive: true },
];

const sellerStats: DashboardOverviewStat[] = [
  { label: 'Registry', value: 'NFTs', change: 'Wallet-owned properties', positive: true },
  { label: 'Marketplace', value: 'Listings', change: 'Sale & rent flags on-chain', positive: true },
  { label: 'Requests', value: 'Queue', change: 'Submit & track approvals', positive: true },
];

const tenantStats: DashboardOverviewStat[] = [
  { label: 'Rentals', value: 'ETH', change: 'Pay on property detail page', positive: true },
  { label: 'Browse', value: 'Rent', change: 'Filter listings for rent', positive: true },
  { label: 'Requests', value: 'Track', change: 'Registry submissions', positive: true },
];

const adminStats: DashboardOverviewStat[] = [
  { label: 'Approvals', value: 'Queue', change: 'Property & update requests', positive: true },
  { label: 'Identity', value: 'Review', change: 'ID and selfie submissions', positive: true },
  { label: 'Users', value: 'Admin', change: 'Platform management', positive: true },
];

const modeCopy: Record<UserMode, { subtitle: string; primary: { label: string; href: string } }> = {
  BUYER: {
    subtitle: 'Track saved homes, portfolio performance, and new listing matches.',
    primary: { label: 'Browse listings', href: '/properties' },
  },
  SELLER: {
    subtitle: 'Manage registry NFTs, marketplace listings, and registration requests.',
    primary: { label: 'Submit registration', href: '/dashboard/listings/create' },
  },
  TENANT: {
    subtitle: 'Find rentals on the marketplace and complete rent in ETH on each property page.',
    primary: { label: 'Browse rentals', href: '/properties?listingType=RENT' },
  },
};

const quickLinks: Record<UserMode, { label: string; href: string }[]> = {
  BUYER: [
    { label: 'Saved listings', href: '/dashboard/saved' },
    { label: 'My requests', href: '/dashboard/my-requests' },
    { label: 'On-chain activity', href: '/dashboard/transactions' },
  ],
  SELLER: [
    { label: 'Marketplace listings', href: '/dashboard/listings' },
    { label: 'Registry NFTs', href: '/dashboard/my-properties' },
    { label: 'Submit registration', href: '/dashboard/listings/create' },
  ],
  TENANT: [
    { label: 'My rental', href: '/dashboard/my-rental' },
    { label: 'Browse rentals', href: '/properties?listingType=RENT' },
    { label: 'Notifications', href: '/dashboard/notifications' },
    { label: 'KYC', href: '/dashboard/verification' },
  ],
};

const adminLinks = [
  { label: 'Admin dashboard', href: '/dashboard/property-approvals' },
  { label: 'Submit registration', href: '/dashboard/listings/create' },
  { label: 'My properties', href: '/dashboard/my-properties' },
  { label: 'My requests', href: '/dashboard/my-requests' },
  { label: 'Identity review', href: '/dashboard/verifications' },
  { label: 'Users', href: '/dashboard/users' },
];

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [userMode, setUserMode] = useState<UserMode>('BUYER');

  const firstName = user?.first_name || mockUser.first_name;
  const isAppAdmin = useAppSelector(selectIsAppAdmin);

  const stats = isAppAdmin
    ? adminStats
    : userMode === 'SELLER'
      ? sellerStats
      : userMode === 'TENANT'
        ? tenantStats
        : buyerStats;

  const copy = isAppAdmin
    ? {
        subtitle: 'Review property approvals and manual identity (ID + selfie) submissions.',
        primary: { label: 'Admin dashboard', href: '/dashboard/property-approvals' },
      }
    : modeCopy[userMode];

  const links = isAppAdmin ? adminLinks : quickLinks[userMode];

  return (
    <DashboardShell>
      <header className="mb-10">
        <DashboardSectionLabel className="mb-3">Overview</DashboardSectionLabel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className={appProseMaxClass}>
            <h1 className={typeH1}>Welcome back</h1>
            <p className={cn(typeLead, 'mt-2 md:mt-3')}>{copy.subtitle}</p>
          </div>
          <Link href={copy.primary.href} className="shrink-0">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="size-4" />}>
              {copy.primary.label}
            </Button>
          </Link>
        </div>

        {!isAppAdmin && (
          <div className="mt-8 flex gap-6 border-b border-border">
            {(['BUYER', 'SELLER'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setUserMode(mode)}
                className={cn(
                  '-mb-px border-b-2 pb-3 font-semibold transition-colors',
                  typeNavLink,
                  userMode === mode
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted hover:text-foreground',
                )}
              >
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
            <div
              className={cn(
                '-mb-px border-b-2 border-transparent pb-3 font-semibold text-muted/50',
                typeNavLink,
              )}
            >
              Tenant <span className="ml-1 text-xs">(Coming Soon)</span>
            </div>
          </div>
        )}
      </header>

      <section className={cn(dashboardPanelClass, 'w-full min-w-0')}>
        <DashboardSectionLabel className="mb-6">At a glance</DashboardSectionLabel>
        <DashboardOverviewStats stats={stats} />
      </section>

      <section className="mt-8">
        <DashboardSectionLabel className="mb-5">Quick links</DashboardSectionLabel>
        <div className={cn(dashboardCardClass, 'w-full min-w-0 divide-y divide-border overflow-hidden')}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface sm:px-6 md:px-7 lg:px-8 2xl:px-8 3xl:px-8 4xl:px-9"
            >
              <span className={cn(typeNavLink, 'font-medium text-foreground')}>{link.label}</span>
              <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
