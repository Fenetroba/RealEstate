import type { PropertyRegistrationFormState } from '@/lib/submit-property';
import type { RegistryRequest } from '@/types/registry-request';
import { REGISTRY_MOCK_PREVIEW_ACCOUNT } from '@/lib/web3/registry-mock';

const OTHER = '0x70997970C51812dc3A010C07b9e81eD500000000';
const MOCK_REQUESTS_STORAGE_KEY = 'edenet-mock-registry-requests-v1';

function req(
  partial: Omit<RegistryRequest, 'priceEth'> & { priceEth: string },
): RegistryRequest {
  return {
    ...partial,
    priceEth: partial.priceEth,
  };
}

const ALL_MOCK: RegistryRequest[] = [
  req({
    id: '2',
    requester: REGISTRY_MOCK_PREVIEW_ACCOUNT,
    name: 'Sunset Villa',
    location: 'Addis Ababa, Ethiopia',
    propertyType: 'Villa',
    priceEth: '5',
    isForSale: true,
    isForRent: false,
    status: 0,
    declineReason: '',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
  }),
  req({
    id: '1',
    requester: REGISTRY_MOCK_PREVIEW_ACCOUNT,
    name: 'Lake House',
    location: 'Bahir Dar, Ethiopia',
    propertyType: 'Villa',
    priceEth: '3',
    isForSale: true,
    isForRent: false,
    status: 1,
    declineReason: '',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2100,
  }),
  req({
    id: '0',
    requester: REGISTRY_MOCK_PREVIEW_ACCOUNT,
    name: 'Old Plot',
    location: 'Hawassa, Ethiopia',
    propertyType: 'Land',
    priceEth: '2',
    isForSale: false,
    isForRent: false,
    status: 2,
    declineReason: 'Incomplete documents — please resubmit with proof of ownership.',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 5000,
  }),
  req({
    id: '3',
    requester: OTHER,
    name: 'CBD Office Floor',
    location: 'Addis Ababa, Ethiopia',
    propertyType: 'Commercial',
    priceEth: '8',
    isForSale: true,
    isForRent: true,
    status: 0,
    declineReason: '',
    bedrooms: 0,
    bathrooms: 2,
    sqft: 4500,
  }),
];

function readStoredMockRequests(): RegistryRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOCK_REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RegistryRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredMockRequests(requests: RegistryRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
}

function mergeMockRequests(): RegistryRequest[] {
  const stored = readStoredMockRequests();
  const byId = new Map<string, RegistryRequest>();
  for (const r of ALL_MOCK) byId.set(r.id, r);
  for (const r of stored) byId.set(r.id, r);
  return [...byId.values()];
}

export function loadAllMockRegistryRequests(): RegistryRequest[] {
  return mergeMockRequests().sort((a, b) => Number(b.id) - Number(a.id));
}

export function loadMockRegistryRequests(account: string): RegistryRequest[] {
  const wallet = account.toLowerCase();
  return loadAllMockRegistryRequests().filter(
    (r) => r.requester.toLowerCase() === wallet,
  );
}

function nextMockRequestId(existing: RegistryRequest[]): string {
  let max = 0;
  for (const r of existing) {
    const n = Number.parseInt(r.id, 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return String(max + 1);
}

function parseOptionalInt(value: string): number {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function appendMockRegistryRequest(
  requester: string,
  form: PropertyRegistrationFormState,
): RegistryRequest {
  const all = loadAllMockRegistryRequests();
  const entry = req({
    id: nextMockRequestId(all),
    requester,
    name: form.name.trim(),
    location: form.location.trim(),
    propertyType: form.propertyType,
    priceEth: form.price.trim() || '0',
    isForSale: form.isForSale,
    isForRent: form.isForRent,
    status: 0,
    declineReason: '',
    bedrooms: parseOptionalInt(form.bedrooms),
    bathrooms: parseOptionalInt(form.bathrooms),
    sqft: parseOptionalInt(form.sqft),
  });

  const stored = readStoredMockRequests();
  stored.push(entry);
  writeStoredMockRequests(stored);
  return entry;
}

/** Demo account when wallet not connected in mock mode */
export function mockPreviewAccountForRequests(): string {
  return REGISTRY_MOCK_PREVIEW_ACCOUNT;
}
