'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import PropertyCard from '@/components/property/PropertyCard';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { HorizontalScrollRow } from '@/components/ui/HorizontalScrollRow';
import { Button } from '@/components/ui/Button';
import { useProperties } from '@/hooks/useProperties';
import { LANDING_FEATURED_CARD_COUNT } from '@/lib/constants/landing';
import {
  propertyListingCardRowGapClass,
  propertyListingCardWidthClass,
} from '@/lib/constants/properties-browse';
import { selectLandingFeaturedProperties } from '@/lib/landing-featured';
//import { mockProperties } from '@/lib/mockData';
import { mapRegistryCatalogToProperties } from '@/lib/registry-property-mapper';
import {
  landingMainInnerClass,
  landingSectionClass,
  landingSectionHeaderMbClass,
} from '@/lib/landing-page-layout';
import { LandingSectionHeader } from '@/components/home/LandingSectionHeader';
import { cn } from '@/lib/utils';

export default function FeaturedProperties() {

  const { properties: registryList, propertyDbMap, imageOverrides, loading: catalogLoading } = useProperties();
  const catalog = useMemo(
    () => mapRegistryCatalogToProperties(registryList, propertyDbMap, imageOverrides),
    [registryList, propertyDbMap, imageOverrides],
  );
  
  // const { properties: registryList, propertyDbMap, loading: catalogLoading } = useProperties();
  // const catalog = useMemo(
  //   () => mapRegistryCatalogToProperties(registryList, propertyDbMap),
  //   [registryList, propertyDbMap],
  // );

  // const featured = useMemo(() => {
  //   const source = catalog.length > 0 ? catalog : mockProperties;
  //   return selectLandingFeaturedProperties(source);
  // }, [catalog]);

  const featured = useMemo(() => {
    if (catalog.length === 0) return [];
    return selectLandingFeaturedProperties(catalog);
  }, [catalog]);
  const isLoading = catalogLoading && featured.length === 0;

  return (
    <section className={landingSectionClass}>
      <div className={landingMainInnerClass}>
        <div
          className={cn(
            landingSectionHeaderMbClass,
            'flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center',
          )}
        >
          <div>
            <LandingSectionHeader
              eyebrow="Premium Listings"
              title="Featured Properties"
              description="Handpicked premium properties with blockchain verification"
              className="!mb-0"
            />
          </div>
          <Link href="/properties">
            <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All Properties
            </Button>
          </Link>
        </div>

        <HorizontalScrollRow
          className={propertyListingCardRowGapClass}
          itemClassName={propertyListingCardWidthClass}
        >
        {isLoading
            ? Array.from({ length: LANDING_FEATURED_CARD_COUNT }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            : featured.length === 0
            ? (
                <p className="text-gray-400 text-sm py-8">
                  No featured properties yet — check back after properties are approved on the registry.
                </p>
              )
            : featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
        </HorizontalScrollRow>
      </div>
    </section>
  );
}
