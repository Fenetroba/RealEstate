import type { PropertyDocument, PropertyTimelineEvent, TransferRecord } from '@/types';

/**
 * Returns empty arrays for documents, timeline, and transfer history.
 * Real data is loaded asynchronously in usePropertyDetail from the backend API
 * and passed directly to PropertyDetailRecords as `documents` and `ownershipHistory`.
 *
 * Previously this returned mock data which would flash before real data loaded.
 */
export function getRegistryDetailExtras(
  _id: string,
  _owner: string,
  _documentsRootHash: string,
  _isForSale: boolean,
): {
  documents: PropertyDocument[];
  timeline: PropertyTimelineEvent[];
  transferHistory: TransferRecord[];
} {
  return {
    documents: [],
    timeline: [],
    transferHistory: [],
  };
}
