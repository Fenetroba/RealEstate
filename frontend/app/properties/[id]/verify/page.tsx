'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { VerifyPageContent } from '@/components/verify/VerifyPageContent';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { verifyCopy } from '@/lib/constants/verify';
import {
  propertyDetailCopy,
  propertyDetailPageShellClass,
} from '@/lib/constants/property-detail';
import { usePropertyDetail } from '@/hooks/usePropertyDetail';
import { sitePageLeadClass, sitePageTitleClass } from '@/lib/site-typography';
import { cn } from '@/lib/utils';

export default function PropertyVerifyPage() {
  const params = useParams();
  const tokenId = params?.id as string | undefined;
  const { property, loading: propertyLoading } = usePropertyDetail(tokenId);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-[calc(var(--site-nav-header-height,5rem)+1rem)]">
        <div className={propertyDetailPageShellClass}>
          <header className="mb-8">
            <Link
              href={tokenId ? `/properties/${tokenId}` : propertyDetailCopy.backHref}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {verifyCopy.backToProperty}
            </Link>
            <div className="flex items-start gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"
                aria-hidden
              >
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h1 className={sitePageTitleClass}>{verifyCopy.pageTitle}</h1>
                {property?.title ? (
                  <p className={sitePageLeadClass}>{property.title}</p>
                ) : tokenId ? (
                  <p className={sitePageLeadClass}>NFT #{tokenId}</p>
                ) : null}
              </div>
            </div>
          </header>

          {propertyLoading && !property ? (
            <div className={cn('space-y-4')}>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : tokenId ? (
            <VerifyPageContent tokenId={tokenId} propertyName={property?.title} />
          ) : (
            <p className="text-sm text-muted">Missing property id.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
