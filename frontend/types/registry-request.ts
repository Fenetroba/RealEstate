/** On-chain registration request status (RealEstate contract enum). */
export type ChainRequestStatus = 0 | 1 | 2;

export type RegistryRequestStatusLabel = 'Pending' | 'Approved' | 'Declined';

export interface RegistryRequest {
  id: string;
  requester: string;
  name: string;
  location: string;
  propertyType: string;
  priceEth: string;
  isForSale: boolean;
  isForRent: boolean;
  status: ChainRequestStatus;
  declineReason: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
}

export type RegistryRequestFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED';
