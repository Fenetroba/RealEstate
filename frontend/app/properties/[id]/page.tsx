'use client';

import { useParams } from 'next/navigation';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PropertyDetailContent from '@/components/property/PropertyDetailContent';
import PropertyDetailHeader from '@/components/property/PropertyDetailHeader';
import { Button } from '@/components/ui/Button';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { usePropertyDetail } from '@/hooks/usePropertyDetail';
import {
  propertyDetailCopy,
  propertyDetailLayout,
  propertyDetailPageShellClass,
} from '@/lib/constants/property-detail';
import { siteCardTitleClass, typeLead } from '@/lib/site-typography';
import { cn } from '@/lib/utils';

function PropertyDetailLoading() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className={propertyDetailPageShellClass}>
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-border/40" />
          <div className={propertyDetailLayout.pageGrid}>
            <div className="space-y-6">
              <div className="aspect-[16/10] max-h-[460px] animate-pulse rounded-2xl bg-border/40" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-border/40" />
                ))}
              </div>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-border/40" />
          </div>
        </div>
      </div>
    </>
  );
}

function PropertyDetailNotFound() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-5xl" aria-hidden>
          🏠
        </p>
        <h1 className={siteCardTitleClass}>{propertyDetailCopy.notFoundTitle}</h1>
        <p className={cn('max-w-md', typeLead)}>{propertyDetailCopy.notFoundBody}</p>
        <Button variant="primary" href={propertyDetailCopy.backHref}>
          {propertyDetailCopy.backLabel}
        </Button>
      </div>
      <Footer />
    </>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { property, documents, ownershipHistory, loading, docsLoading } = usePropertyDetail(id);

  if (loading) {
    return <PropertyDetailLoading />;
  }

  if (!property) {
    return <PropertyDetailNotFound />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className={propertyDetailPageShellClass}>
          <PropertyDetailHeader property={property} />
          <PropertyDetailContent
            property={property}
            documents={documents}
            ownershipHistory={ownershipHistory}
            docsLoading={docsLoading}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
