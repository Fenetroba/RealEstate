'use client';

import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import type { ListingType, PropertyFilters, PropertyType } from '@/types';

interface SearchFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: Partial<PropertyFilters>) => void;
  onSearch: () => void;
  isSearching?: boolean;
  resultCount?: number;
  className?: string;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'LAND', label: 'Land' },
];

const listingOptions: { value: ListingType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'BOTH', label: 'Sale & Rent' },
];

const filterPillClass = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
    active
      ? 'border-primary bg-primary text-white dark:border-accent dark:bg-accent dark:text-primary'
      : 'border-border bg-surface text-muted hover:border-accent/50 hover:text-accent',
  );

export default function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  isSearching,
  resultCount,
  className,
}: SearchFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(filters.propertyType || []);

  useEffect(() => {
    setSelectedTypes(filters.propertyType || []);
  }, [filters.propertyType]);

  const togglePropertyType = (type: PropertyType) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(next);
    onFiltersChange({ propertyType: next.length > 0 ? next : undefined });
  };

  const handleListingChange = (value: ListingType | '') => {
    onFiltersChange({ listingType: value || undefined });
  };

  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
    filters.minArea,
    filters.maxArea,
    filters.propertyType?.length,
    filters.listingType,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedTypes([]);
    onFiltersChange({
      location: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      minArea: undefined,
      maxArea: undefined,
      propertyType: undefined,
      listingType: undefined,
    });
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-4 sm:p-5',
        '2xl:flex 2xl:h-full 2xl:min-h-0 2xl:flex-col',
        className,
      )}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-accent" />
          <h2 className="font-heading text-base font-bold text-foreground">Filters</h2>
        </div>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
            {activeFilterCount}
          </span>
        )}
      </div>

      <div className="space-y-3 2xl:min-h-0 2xl:flex-1 2xl:overflow-y-auto 2xl:overscroll-contain">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Listing</p>
          <div className="flex flex-wrap gap-2">
            {listingOptions.map((option) => {
              const active =
                option.value === ''
                  ? !filters.listingType
                  : filters.listingType === option.value;

              return (
                <button
                  key={option.value || 'all'}
                  type="button"
                  onClick={() => handleListingChange(option.value)}
                  className={filterPillClass(active)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Property type</p>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((option) => {
              const active = selectedTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => togglePropertyType(option.value)}
                  className={filterPillClass(active)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min price (ETH)"
            type="number"
            min={0}
            step="any"
            placeholder="0"
            value={filters.minPrice || ''}
            onChange={(e) =>
              onFiltersChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <Input
            label="Max price (ETH)"
            type="number"
            min={0}
            step="any"
            placeholder="Any"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              onFiltersChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min sqft"
            type="number"
            placeholder="0"
            value={filters.minArea || ''}
            onChange={(e) =>
              onFiltersChange({ minArea: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <Input
            label="Max sqft"
            type="number"
            placeholder="Any"
            value={filters.maxArea || ''}
            onChange={(e) =>
              onFiltersChange({ maxArea: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Bedrooms"
            options={[
              { value: '', label: 'Any' },
              { value: '1', label: '1+' },
              { value: '2', label: '2+' },
              { value: '3', label: '3+' },
              { value: '4', label: '4+' },
              { value: '5', label: '5+' },
            ]}
            value={filters.bedrooms?.toString() || ''}
            onChange={(e) =>
              onFiltersChange({ bedrooms: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <Select
            label="Bathrooms"
            options={[
              { value: '', label: 'Any' },
              { value: '1', label: '1+' },
              { value: '2', label: '2+' },
              { value: '3', label: '3+' },
              { value: '4', label: '4+' },
            ]}
            value={filters.bathrooms?.toString() || ''}
            onChange={(e) =>
              onFiltersChange({ bathrooms: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Max risk"
            options={[
              { value: '', label: 'Any' },
              { value: '20', label: '≤20' },
              { value: '40', label: '≤40' },
              { value: '60', label: '≤60' },
              { value: '80', label: '≤80' },
            ]}
            value={filters.maxRiskScore?.toString() || ''}
            onChange={(e) =>
              onFiltersChange({
                maxRiskScore: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Select
            label="Min carbon"
            options={[
              { value: '', label: 'Any' },
              { value: '80', label: '80+' },
              { value: '60', label: '60+' },
              { value: '40', label: '40+' },
            ]}
            value={filters.minCarbonScore?.toString() || ''}
            onChange={(e) =>
              onFiltersChange({
                minCarbonScore: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={onSearch}
          isLoading={isSearching}
          className="w-full dark:bg-accent dark:text-primary dark:hover:bg-accent-light"
        >
          Apply Filters
        </Button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-red-500 transition-colors hover:text-red-600"
          >
            <X className="size-4" />
            Clear all filters
          </button>
        )}

        {resultCount !== undefined && (
          <p className="border-t border-border pt-4 text-center text-sm text-muted">
            <span className="font-semibold text-foreground">{resultCount.toLocaleString()}</span>{' '}
            properties found
          </p>
        )}
      </div>
    </div>
  );
}
