'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { verifyCopy } from '@/lib/constants/verify';
import { cn } from '@/lib/utils';
import type { PropertyVerifyReport } from '@/types/property-verify';

interface VerifyTechnicalDetailsProps {
  report: PropertyVerifyReport;
}

function HashRow({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="grid gap-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[10rem_1fr]">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="break-all font-mono text-xs text-foreground">{value}</dd>
    </div>
  );
}

export function VerifyTechnicalDetails({ report }: VerifyTechnicalDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            {verifyCopy.technicalSection}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{verifyCopy.technicalHint}</p>
        </div>
        <ChevronDown
          className={cn('size-5 shrink-0 text-muted transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? (
        <dl className="border-t border-border">
          <HashRow label="DB metadata hash" value={report.dbMetadataHash} />
          <HashRow label="Recomputed metadata" value={report.recomputedMetadataHash} />
          <HashRow label="On-chain hash" value={report.onChainHash} />
        </dl>
      ) : null}
    </section>
  );
}
