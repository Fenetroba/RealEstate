'use client';

import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

import { verifyCopy } from '@/lib/constants/verify';
import { cn } from '@/lib/utils';
import type { PropertyVerifyReport } from '@/types/property-verify';

interface VerifyTamperBannerProps {
  report: PropertyVerifyReport;
  className?: string;
}

export function VerifyTamperBanner({ report, className }: VerifyTamperBannerProps) {
  const pass = report.tamperProof;

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 sm:p-8',
        pass
          ? 'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-800/50 dark:bg-emerald-950/35'
          : 'border-red-200/80 bg-red-50/90 dark:border-red-800/50 dark:bg-red-950/35',
        className,
      )}
      role="status"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-2xl',
            pass ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/15 text-red-700 dark:text-red-400',
          )}
          aria-hidden
        >
          {pass ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {verifyCopy.tamperProofTitle}
          </p>
          <h1
            className={cn(
              'mt-1 font-heading text-2xl font-bold sm:text-3xl',
              pass ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100',
            )}
          >
            {pass ? 'Passed' : 'Failed'}
          </h1>
          <p
            className={cn(
              'mt-2 max-w-2xl text-sm leading-relaxed',
              pass ? 'text-emerald-800/90 dark:text-emerald-200/90' : 'text-red-800/90 dark:text-red-200/90',
            )}
          >
            {pass ? verifyCopy.tamperProofPass : verifyCopy.tamperProofFail}
          </p>
          {report.propertyName ? (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground">
              <ShieldCheck className="size-4 text-accent" aria-hidden />
              <span className="font-medium">{report.propertyName}</span>
              <span className="text-muted">· NFT #{report.tokenId}</span>
              {report.currentVersion != null ? (
                <span className="text-muted">· Version {report.currentVersion}</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">NFT #{report.tokenId}</p>
          )}
        </div>
      </div>
      {!pass ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-200/60 bg-white/50 px-4 py-3 text-xs text-red-900/80 dark:border-red-900/40 dark:bg-black/20 dark:text-red-200/90">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          Review the checks and file list below to see which layer diverged.
        </p>
      ) : null}
    </div>
  );
}
