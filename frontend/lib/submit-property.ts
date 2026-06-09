export const PROPERTY_REGISTRATION_TYPES = [
  'Villa',
  'Building',
  'Apartment',
  'Land',
] as const;

export type PropertyRegistrationType = (typeof PROPERTY_REGISTRATION_TYPES)[number];

export const YEAR_BUILT_MIN = 1800;
export const YEAR_BUILT_MAX = 2100;

export interface PropertyRegistrationFormState {
  name: string;
  location: string;
  propertyType: PropertyRegistrationType;
  price: string;
  isForSale: boolean;
  isForRent: boolean;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  parking: string;
  floors: string;
  yearBuilt: string;
  titleNumber: string;
}

export const emptyPropertyRegistrationForm = (): PropertyRegistrationFormState => ({
  name: '',
  location: '',
  propertyType: 'Villa',
  price: '',
  isForSale: false,
  isForRent: false,
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  parking: '',
  floors: '',
  yearBuilt: '',
  titleNumber: '',
});

export interface PropertyRequestHashes {
  metadataHash: string;
  imagesRootHash: string;
  documentsRootHash: string;
}

export interface SubmitPropertyRequestResponse {
  requestId: string;
  propertyId: string;
  hashes: PropertyRequestHashes;
}

export function formToUint256(value: string): bigint {
  const trimmed = value.trim();
  if (trimmed.includes('.')) {
    throw new Error('Use whole numbers for numeric fields');
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error('Invalid number');
  }
  return BigInt(Math.floor(n));
}
