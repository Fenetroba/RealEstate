'use client';

import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RefreshCw, Search } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PropertyList } from '@/components/properties/PropertyList';
import SearchFilters from '@/components/property/SearchFilters';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyGridPageSize } from '@/hooks/usePropertyGridPageSize';
import { usePropertyGridTwoRowHeight } from '@/hooks/usePropertyGridTwoRowHeight';
import { filterCatalogProperties } from '@/lib/property-catalog-filters';
import { setPropertyCatalog } from '@/lib/property-catalog-cache';
import { mapRegistryCatalogToProperties } from '@/lib/registry-property-mapper';
import { marketStats } from '@/lib/mockData';
import type { ListingType, PropertyFilters } from '@/types';
import {
  propertiesHeroPanelClass,
  propertiesPageShellClass,
} from '@/lib/constants/properties-browse';
import { typeH1, typeLead } from '@/lib/responsive';
import { typeH3 } from '@/lib/site-typography';
import { cn } from '@/lib/utils';

const propertyGridClass =
  'grid w-full min-w-0 auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3';

function listingTypeFromParam(value: string | null): ListingType | undefined {
  if (value === 'SALE' || value === 'RENT' || value === 'BOTH') return value;
  return undefined;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const {
    properties: registryList,
    propertyDbMap,
    loading: catalogLoading,
    refreshing,
    chainError,
    refresh,
    imageOverrides,
  } = useProperties();

  const catalog = useMemo(
    () => mapRegistryCatalogToProperties(registryList, propertyDbMap, imageOverrides),
    [registryList, propertyDbMap, imageOverrides],
  );
  // const { imageOverrides } = useProperties();
  // const catalog = useMemo(
  //   () => mapRegistryCatalogToProperties(registryList, propertyDbMap, imageOverrides),
  //   [registryList, propertyDbMap, imageOverrides],
  // );

  useEffect(() => {
    if (catalog.length) setPropertyCatalog(catalog);
  }, [catalog]);

  const pageSize = usePropertyGridPageSize();
  const [isFiltering, setIsFiltering] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [filters, setFilters] = useState<PropertyFilters>(() => ({
    query: searchParams.get('query') || '',
    listingType: listingTypeFromParam(searchParams.get('listingType')),
    page: 1,
    limit: 12,
    sortBy: 'newest',
  }));

  const filtered = useMemo(
    () => filterCatalogProperties(catalog, filters),
    [catalog, filters],
  );

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [filtered, pageSize]);

  const visibleProperties = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleFiltersChange = (newFilters: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = () => {
    setIsFiltering(true);
    setVisibleCount(pageSize);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleLoadMore = () => {
    setVisibleCount((count) => Math.min(count + pageSize, filtered.length));
  };

  useEffect(() => {
    const listingType = listingTypeFromParam(searchParams.get('listingType'));
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get('query') ?? prev.query,
      listingType,
    }));
    setVisibleCount(pageSize);
    if (searchParams.get('query') || listingType) {
      setIsFiltering(true);
      const t = setTimeout(() => setIsFiltering(false), 300);
      return () => clearTimeout(t);
    }
  }, [searchParams, pageSize]);

  const isLoading = catalogLoading || isFiltering;
  const listingCount = catalog.length;
  const propertyGridRef = useRef<HTMLDivElement>(null);
  const gridMeasureCount = isLoading
    ? pageSize
    : filtered.length === 0
      ? 0
      : visibleProperties.length;
  const twoRowGridHeight = usePropertyGridTwoRowHeight(propertyGridRef, gridMeasureCount);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className={propertiesPageShellClass}>
          <header data-nav-surface="dark" className={propertiesHeroPanelClass}>
            <h1 className={cn(typeH1, 'mb-2 text-white dark:text-foreground')}>
              Browse listings
            </h1>
            <p className={cn(typeLead, 'text-white/70 dark:text-muted')}>
              Discover{' '}
              {listingCount > 0
                ? listingCount.toLocaleString()
                : marketStats.totalListings.toLocaleString()}
              + blockchain-verified properties
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                placeholder="Search by location, property name..."
                value={filters.query || ''}
                onChange={(e) => handleFiltersChange({ query: e.target.value })}
                leftIcon={<Search className="size-4" />}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                containerClassName="w-full flex-1"
                className="h-12 border-white/20 bg-white text-primary placeholder:text-primary/50 dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted"
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleSearch}
                isLoading={isFiltering}
                leftIcon={<Search className="size-4" />}
                className="w-full shrink-0 sm:w-auto"
              >
                Search
              </Button>
              <Button
                variant="onDarkOutline"
                size="icon"
                onClick={() => void refresh()}
                disabled={catalogLoading || refreshing}
                isLoading={refreshing}
                aria-label="Refresh listings"
                title="Refresh listings"
                className="size-12 shrink-0 dark:border-border dark:text-foreground dark:hover:bg-surface"
              >
                <RefreshCw className="size-5" />
              </Button>
            </div>
          </header>

          {chainError && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {chainError}
            </div>
          )}

          <div
            className={cn(
              'mt-6 flex flex-col gap-8 sm:mt-8',
              'lg:flex-row lg:items-start',
              '2xl:grid 2xl:grid-cols-[20rem_1fr] 2xl:gap-x-8 2xl:gap-y-6',
              '3xl:grid-cols-[22rem_1fr]',
            )}
          >
            <aside
              className={cn(
                'w-full shrink-0 lg:sticky lg:top-[calc(var(--site-nav-header-height,5rem)+0.75rem)] lg:w-80 lg:self-start xl:w-[22rem]',
                '2xl:col-start-1 2xl:row-start-2 2xl:flex 2xl:min-h-0 2xl:w-auto 2xl:flex-col',
              )}
              style={twoRowGridHeight ? { height: twoRowGridHeight } : undefined}
            >
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                isSearching={isFiltering}
                resultCount={filtered.length}
              />
            </aside>

            <div className="min-w-0 flex-1 2xl:contents">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between 2xl:col-start-2 2xl:row-start-1 2xl:mb-0">
                <p className="text-sm text-muted">
                  Showing{' '}
                  <span className="font-semibold text-foreground">
                    {visibleProperties.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
                  {filtered.length === 1 ? 'property' : 'properties'}
                </p>
                <Select
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                    { value: 'area', label: 'Largest Area' },
                  ]}
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => {
                    handleFiltersChange({
                      sortBy: e.target.value as PropertyFilters['sortBy'],
                    });
                  }}
                  containerClassName="w-full sm:w-48"
                />
              </div>

              {isLoading ? (
                <div
                  ref={propertyGridRef}
                  className={cn(propertyGridClass, '2xl:col-start-2 2xl:row-start-2')}
                >
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center 2xl:col-span-2">
                  <div className="mb-4 text-6xl">🏠</div>
                  <h3 className={cn('mb-2', typeH3)}>No properties found</h3>
                  <p className="mb-6 text-muted">
                    {catalog.length === 0
                      ? 'No properties registered yet.'
                      : 'Try adjusting your search filters'}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleFiltersChange({
                        query: '',
                        propertyType: undefined,
                        listingType: undefined,
                      });
                      setVisibleCount(pageSize);
                    }}
                  >
                    {catalog.length === 0 ? 'Refresh' : 'Clear Filters'}
                  </Button>
                </div>
              ) : (
                <>
                  <motion.div
                    ref={propertyGridRef}
                    className="2xl:col-start-2 2xl:row-start-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <PropertyList properties={visibleProperties} className={propertyGridClass} />
                  </motion.div>

                  {hasMore && (
                    <div className="mt-10 flex justify-center 2xl:col-start-2 2xl:row-start-3">
                      <Button variant="outline" size="lg" onClick={handleLoadMore}>
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="2xl:-mt-2 3xl:-mt-3 4xl:-mt-3">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
