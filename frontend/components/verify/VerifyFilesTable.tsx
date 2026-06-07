'use client';

import { FileText, ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { verifyCopy } from '@/lib/constants/verify';
import { shortenHash } from '@/lib/metadata-versions';
import type { VerifyFileIntegrityRow } from '@/types/property-verify';

interface VerifyFilesTableProps {
  files: VerifyFileIntegrityRow[];
}

function fileIcon(type: string) {
  const t = type.toUpperCase();
  if (t === 'IMAGE') return ImageIcon;
  return FileText;
}

export function VerifyFilesTable({ files }: VerifyFilesTableProps) {
  if (files.length === 0) {
    return <p className="text-sm text-muted">{verifyCopy.filesEmpty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/80 text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">File</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Stored</th>
            <th className="px-4 py-3 font-medium">Recomputed</th>
            <th className="px-4 py-3 font-medium">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {files.map((file, i) => {
            const Icon = fileIcon(file.fileType);
            return (
              <tr key={`${file.fileName}-${i}`}>
                <td className="px-4 py-3 font-medium text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-4 text-accent" aria-hidden />
                    {file.fileName}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{file.fileType}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {shortenHash(file.storedHash, 8)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {shortenHash(file.recomputedHash, 8)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={file.match ? 'success' : 'danger'} size="sm">
                    {file.match ? 'Match' : 'Mismatch'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
