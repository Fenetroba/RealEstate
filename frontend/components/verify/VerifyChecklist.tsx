'use client';

import { Check, FileStack, FolderTree, Link2, X } from 'lucide-react';

import { verifyCheckLabels, verifyCopy } from '@/lib/constants/verify';
import { cn } from '@/lib/utils';
import type { PropertyVerifyReport } from '@/types/property-verify';

interface CheckRow {
  id: string;
  label: string;
  help: string;
  passed: boolean | null;
  icon: typeof Check;
}

function CheckIcon({ passed }: { passed: boolean | null }) {
  if (passed === true) {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <Check className="size-4" aria-hidden />
      </span>
    );
  }
  if (passed === false) {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-red-500/15 text-red-700 dark:text-red-400">
        <X className="size-4" aria-hidden />
      </span>
    );
  }
  return <span className="flex size-8 items-center justify-center rounded-full bg-surface text-muted">—</span>;
}

function buildRows(report: PropertyVerifyReport): CheckRow[] {
  const metadataPass =
    report.metadataHashMatch === true && report.onChainMatch !== false
      ? true
      : report.metadataHashMatch === false || report.onChainMatch === false
        ? false
        : null;

  return [
    {
      id: 'metadata',
      label: verifyCheckLabels.metadata,
      help: verifyCheckLabels.metadataHelp,
      passed: metadataPass,
      icon: Link2,
    },
    {
      id: 'files',
      label: verifyCheckLabels.files,
      help: verifyCheckLabels.filesHelp,
      passed:
        typeof report.allFilesIntact === 'boolean'
          ? report.allFilesIntact
          : report.filesIntegrity?.length
            ? report.filesIntegrity.every((f) => f.match)
            : null,
      icon: FileStack,
    },
    {
      id: 'roots',
      label: `${verifyCheckLabels.imagesRoot} · ${verifyCheckLabels.documentsRoot}`,
      help: 'Merkle-style group hashes for images and documents vs DB and chain.',
      passed:
        report.imagesRootMatch === true && report.documentsRootMatch === true
          ? true
          : report.imagesRootMatch === false || report.documentsRootMatch === false
            ? false
            : null,
      icon: FolderTree,
    },
    {
      id: 'onchain',
      label: verifyCheckLabels.onChain,
      help: 'Latest metadata hash on the contract vs recomputed value.',
      passed:
        typeof report.onChainMatch === 'boolean'
          ? report.onChainMatch
          : report.metadataHashMatch ?? null,
      icon: Link2,
    },
  ];
}

interface VerifyChecklistProps {
  report: PropertyVerifyReport;
}

export function VerifyChecklist({ report }: VerifyChecklistProps) {
  const rows = buildRows(report);

  return (
    <section>
      <h2 className="font-heading text-lg font-semibold text-foreground">{verifyCopy.checksSection}</h2>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {rows.map((row) => (
          <li key={row.id} className="flex gap-4 px-4 py-4 sm:px-5">
            <CheckIcon passed={row.passed} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{row.help}</p>
            </div>
            <span
              className={cn(
                'shrink-0 self-center text-xs font-semibold uppercase tracking-wide',
                row.passed === true && 'text-emerald-700 dark:text-emerald-400',
                row.passed === false && 'text-red-700 dark:text-red-400',
                row.passed === null && 'text-muted',
              )}
            >
              {row.passed === true ? 'OK' : row.passed === false ? 'Fail' : '—'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
