import { mockProperties } from '@/lib/mockData';
import type { Property, PropertyStatus } from '@/types';

const myListingOverrides: {
  sourceId: string;
  status: PropertyStatus;
  views: number;
  saves: number;
}[] = [
  { sourceId: '1', status: 'ACTIVE', views: 2847, saves: 312 },
  { sourceId: '2', status: 'ACTIVE', views: 1924, saves: 186 },
  { sourceId: '3', status: 'ACTIVE', views: 856, saves: 94 },
  { sourceId: '4', status: 'PENDING', views: 124, saves: 18 },
  { sourceId: '5', status: 'SOLD', views: 3412, saves: 401 },
  { sourceId: '6', status: 'PENDING', views: 42, saves: 6 },
];

export const mockMyListings: Property[] = myListingOverrides.map(
  ({ sourceId, status, views, saves }) => {
    const base = mockProperties.find((p) => p.id === sourceId);
    if (!base) {
      throw new Error(`Missing mock property ${sourceId}`);
    }

    return {
      ...base,
      status,
      views,
      saves,
      OWNERId: 'user1',
    };
  },
);

export function getMyListingStats(listings: Property[]) {
  const active = listings.filter((l) => l.status === 'ACTIVE').length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const totalSaves = listings.reduce((sum, l) => sum + l.saves, 0);

  return {
    total: listings.length,
    active,
    totalViews,
    totalSaves,
  };
}
