'use client';

import { OwnedPropertyCard } from '@/components/my-properties/OwnedPropertyCard';
import type { RegistryProperty } from '@/types/registry-property';

interface MyPropertiesListProps {
  properties: RegistryProperty[];
  getDbPropertyId: (tokenId: string) => string | null;
  onSubmitUpdate: (property: RegistryProperty) => void;
  onVersionHistory: (property: RegistryProperty) => void;
}

export function MyPropertiesList({
  properties,
  getDbPropertyId,
  onSubmitUpdate,
  onVersionHistory,
}: MyPropertiesListProps) {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <OwnedPropertyCard
          key={property.id}
          property={property}
          dbPropertyId={getDbPropertyId(property.id)}
          hasDbRecord={Boolean(getDbPropertyId(property.id))}
          onSubmitUpdate={() => onSubmitUpdate(property)}
          onVersionHistory={() => onVersionHistory(property)}
        />
      ))}
    </div>
  );
}
