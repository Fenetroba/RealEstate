export type ChainUpdateStatus = 0 | 1 | 2;

export interface RegistryUpdateRequest {
  propertyId: string;
  updateIndex: number;
  requester: string;
  status: ChainUpdateStatus;
  declineReason: string;
  timestampLabel: string;
}
