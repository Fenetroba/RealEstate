'use client';

import { useMemo, useState } from 'react';
import { Heart, Search } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardFiltersBar } from '@/components/dashboard/DashboardFiltersBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSearchField } from '@/components/dashboard/DashboardSearchField';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/Button';
import { FilterSelectDropdown } from '@/components/ui/FilterSelectDropdown';
import { useDashboardSearch } from '@/hooks/useDashboardSearch';
import { useProperties } from '@/hooks/useProperties';
import { dashboardCardGridClass } from '@/lib/constants/dashboard-layout';
import { filterCatalogProperties } from '@/lib/property-catalog-filters';
import { mapRegistryCatalogToProperties } from '@/lib/registry-property-mapper';
import { useAppSelector } from '@/store/hooks';
import type { ListingType, PropertyFilters } from '@/types';
import { cn } from '@/lib/utils';

type SavedListingTab = 'ALL' | ListingType;

const sortOptions = [
  { value: 'newest',     label: 'Recently saved' },
  { value: 'price_asc',  label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'area',       label: 'Largest area' },
];

function listingTabToFilter(tab: SavedListingTab): PropertyFilters['listingType'] {
  return tab === 'ALL' ? undefined : tab;
}

export default function SavedPropertiesPage() {
  const savedIds = useAppSelector((s) => s.property.savedProperties);
  const { properties: registryList, propertyDbMap, imageOverrides } = useProperties();

  const search = useDashboardSearch();
  const [listingTab, setListingTab] = useState<SavedListingTab>('ALL');
  const [sortBy, setSortBy] = useState<PropertyFilters['sortBy']>('newest');

  // Build catalog ONLY from real registry properties — no mock data
  const catalog = useMemo(() => {
    const allReal = mapRegistryCatalogToProperties(registryList, propertyDbMap, imageOverrides);
    const byId = new Map(allReal.map((p) => [p.id, p]));
    return savedIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [registryList, propertyDbMap, imageOverrides, savedIds]);

  const tabCounts = useMemo(() => {
    const countFor = (tab: SavedListingTab) =>
      filterCatalogProperties(catalog, { listingType: listingTabToFilter(tab) }).length;
    return {
      ALL:  catalog.length,
      SALE: countFor('SALE'),
      RENT: countFor('RENT'),
      BOTH: countFor('BOTH'),
    };
  }, [catalog]);

  const filters = useMemo<PropertyFilters>(
    () => ({
      query:       search.appliedQuery,
      listingType: listingTabToFilter(listingTab),
      sortBy:      sortBy || 'newest',
    }),
    [search.appliedQuery, listingTab, sortBy],
  );

  const filtered = useMemo(
    () => filterCatalogProperties(catalog, filters),
    [catalog, filters],
  );

  const hasActiveFilters =
    search.appliedQuery.length > 0 || listingTab !== 'ALL' || sortBy !== 'newest';

  const clearFilters = () => {
    search.clearSearch();
    setListingTab('ALL');
    setSortBy('newest');
  };

  const listingTabs = [
    { id: 'ALL'  as const, label: 'All',        count: tabCounts.ALL  },
    { id: 'SALE' as const, label: 'For sale',   count: tabCounts.SALE },
    { id: 'RENT' as const, label: 'For rent',   count: tabCounts.RENT },
    { id: 'BOTH' as const, label: 'Sale & rent',count: tabCounts.BOTH },
  ].filter((tab) => tab.id === 'ALL' || tab.count > 0 || listingTab === tab.id);

  const description =
    catalog.length === 0
      ? 'Save listings from the marketplace to compare them here.'
      : filtered.length === catalog.length
        ? `${catalog.length} saved ${catalog.length === 1 ? 'property' : 'properties'}`
        : `Showing ${filtered.length} of ${catalog.length} saved`;

  return (
    <DashboardShell>
      <DashboardHeader title="Saved listings" description={description} />

      {catalog.length > 0 && (
        <>
          <DashboardFiltersBar className="mt-6 mb-8">
            <DashboardSearchField
              name="saved-listings-search"
              placeholder="Search by name, city, address, type…"
              aria-label="Search saved properties"
              value={search.queryInput}
              onChange={search.setQueryInput}
              onSearch={search.runSearch}
              onClear={search.clearSearch}
            />
            <FilterSelectDropdown
              value={sortBy || 'newest'}
              onChange={(v) => setSortBy(v as PropertyFilters['sortBy'])}
              options={sortOptions}
              aria-label="Sort saved properties"
              className="w-52 shrink-0"
            />
          </DashboardFiltersBar>

          <DashboardFilterTabs
            className="mb-6"
            options={listingTabs.map((t) => ({ id: t.id, label: t.label, count: t.count }))}
            value={listingTab}
            onChange={(id) => setListingTab(id as SavedListingTab)}
          />

          {hasActiveFilters && filtered.length > 0 && (
            <p className="-mt-2 mb-4 text-sm text-muted">
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-accent hover:underline"
              >
                Clear filters
              </button>
            </p>
          )}
        </>
      )}

      {catalog.length === 0 ? (
        <DashboardEmptyState
          icon={Heart}
          title="No saved properties"
          description="Tap the heart icon on any listing to save it here."
          action={
            <Button href="/properties" variant="primary">
              View marketplace
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <DashboardEmptyState
          icon={Search}
          title="No matches"
          description="Try a different keyword, listing type, or sort order."
          action={
            <Button type="button" variant="primary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className={cn(dashboardCardGridClass, 'w-full min-w-0')}>
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
