import type { Property } from '@/types';

let catalog: Property[] = [];

export function setPropertyCatalog(properties: Property[]) {
  catalog = properties;
}

export function getPropertyCatalog(): Property[] {
  return catalog;
}

export function getPropertyFromCatalog(id: string): Property | undefined {
  return catalog.find((p) => p.id === id);
}
