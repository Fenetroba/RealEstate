import type {
  ChainRequestStatus,
  RegistryRequestFilter,
  RegistryRequestStatusLabel,
} from '@/types/registry-request';

export function requestStatusLabel(status: ChainRequestStatus): RegistryRequestStatusLabel {
  if (status === 1) return 'Approved';
  if (status === 2) return 'Declined';
  return 'Pending';
}

export function requestStatusHelp(status: ChainRequestStatus): string {
  if (status === 1) {
    return 'Minted on the registry. You can find it under Properties.';
  }
  if (status === 2) {
    return 'Not minted. Review the reason below and submit a new request if needed.';
  }
  return 'Waiting for government review. It is not listed publicly yet.';
}

export function filterToChainStatus(
  filter: RegistryRequestFilter,
): ChainRequestStatus | null {
  if (filter === 'PENDING') return 0;
  if (filter === 'APPROVED') return 1;
  if (filter === 'DECLINED') return 2;
  return null;
}

export function matchesRequestFilter(
  status: ChainRequestStatus,
  filter: RegistryRequestFilter,
): boolean {
  const target = filterToChainStatus(filter);
  if (target === null) return true;
  return status === target;
}

export function formatRequestPrice(eth: string): string {
  const n = Number(eth);
  if (!Number.isFinite(n)) return `${eth} ETH`;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
}

export function formatPropertyTypeLabel(raw: string): string {
  const t = raw.trim();
  if (!t) return 'Property';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
