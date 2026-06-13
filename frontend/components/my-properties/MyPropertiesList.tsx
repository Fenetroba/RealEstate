'use client';

import type { Contract } from 'ethers';
import { OwnedPropertyCard } from '@/components/my-properties/OwnedPropertyCard';
import type { RegistryProperty } from '@/types/registry-property';

interface MyPropertiesListProps {
  properties:       RegistryProperty[];
  getDbPropertyId:  (tokenId: string) => string | null;
  writeContract:    Contract | null;
  onSubmitUpdate:   (property: RegistryProperty) => void;
  onVersionHistory: (property: RegistryProperty) => void;
  onRefresh:        () => void;
}

export function MyPropertiesList({
  properties,
  getDbPropertyId,
  writeContract,
  onSubmitUpdate,
  onVersionHistory,
  onRefresh,
}: MyPropertiesListProps) {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <OwnedPropertyCard
          key={property.id}
          property={property}
          dbPropertyId={getDbPropertyId(property.id)}
          hasDbRecord={Boolean(getDbPropertyId(property.id))}
          writeContract={writeContract}
          onSubmitUpdate={() => onSubmitUpdate(property)}
          onVersionHistory={() => onVersionHistory(property)}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
