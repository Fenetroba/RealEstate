import type { ChainUpdateStatus } from '@/types/registry-update-request';

export function updateStatusLabel(status: ChainUpdateStatus): string {
  if (status === 1) return 'Approved';
  if (status === 2) return 'Declined';
  return 'Pending';
}

export function updateStatusHelp(status: ChainUpdateStatus): string {
  if (status === 1) {
    return 'Metadata version is live on the registry.';
  }
  if (status === 2) {
    return 'Update was rejected. The owner can submit a revised request.';
  }
  return 'Awaiting government signature to apply new metadata on-chain.';
}
