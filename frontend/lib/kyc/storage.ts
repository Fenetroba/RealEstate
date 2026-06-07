import type { KycSubmission } from '@/lib/kyc/types';
import { KYC_STORAGE_KEY } from '@/lib/kyc/types';

export function readKycSubmissions(): KycSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KYC_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KycSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeKycSubmissions(submissions: KycSubmission[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(submissions));
}
