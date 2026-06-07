import type { MetadataVersionEntry } from '@/types/registry-property';

export function formatVersionTimestamp(ts: unknown): string {
  if (ts == null) return '—';
  const n =
    typeof ts === 'bigint'
      ? Number(ts)
      : typeof ts === 'number'
        ? ts
        : Number(ts);
  if (!Number.isFinite(n) || n <= 0) return '—';
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function shortenHash(hash: string, chars = 10): string {
  const h = hash.trim();
  if (h.length <= chars * 2 + 3) return h || '—';
  return `${h.slice(0, chars)}…${h.slice(-4)}`;
}

export function normalizeMetadataVersions(
  rows: MetadataVersionEntry[],
): { versionNo: number; metadataHash: string; timestampLabel: string }[] {
  return rows.map((row, index) => {
    const rawHash = row.metadataHash ?? row.hash ?? '';
    const metadataHash = typeof rawHash === 'string'
      ? rawHash
      : String(rawHash);
    return {
      versionNo: row.versionNo != null ? Number(row.versionNo) : index + 1,
      metadataHash,
      timestampLabel: formatVersionTimestamp(row.timestamp),
    };
  });
}
