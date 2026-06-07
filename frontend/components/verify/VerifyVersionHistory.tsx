'use client';
import { formatVersionTimestamp, shortenHash } from '@/lib/metadata-versions';
import { verifyCopy } from '@/lib/constants/verify';

type VersionEntry = { versionNo: number; metadataHash: string; timestamp: number } | string;

interface VerifyVersionHistoryProps {
  hashes: VersionEntry[];
}

export function VerifyVersionHistory({ hashes }: VerifyVersionHistoryProps) {
  if (hashes.length === 0) {
    return <p className="text-sm text-muted">{verifyCopy.versionsEmpty}</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {hashes.map((entry, index) => {
        const isObj = typeof entry === 'object' && entry !== null;
        const versionNo = isObj ? entry.versionNo : index + 1;
        const hash = isObj ? entry.metadataHash : entry;
        const timestamp = isObj ? entry.timestamp : null;
        return (
          <li
            key={`${index}-${hash.slice(0, 8)}`}
            className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-foreground">Version {versionNo}</p>
              <p className="font-mono text-xs text-muted">{shortenHash(hash, 14)}</p>
            </div>
            {timestamp ? (
              <p className="text-xs text-muted sm:text-right">
                {formatVersionTimestamp(timestamp)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}