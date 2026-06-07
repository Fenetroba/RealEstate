'use client';

import PropertyCard from '@/components/property/PropertyCard';
import type { Property } from '@/types';

interface PropertyListProps {
  properties: Property[];
  className?: string;
}

export function PropertyList({ properties, className }: PropertyListProps) {
  return (
    <div className={className ?? 'grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3'}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} className="h-full" />
      ))}
    </div>
  );
}
