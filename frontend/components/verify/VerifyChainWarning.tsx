'use client';

import { AlertTriangle } from 'lucide-react';

import { verifyCopy } from '@/lib/constants/verify';

interface VerifyChainWarningProps {
  chainError: string;
}

export function VerifyChainWarning({ chainError }: VerifyChainWarningProps) {
  return (
    <div
      className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30"
      role="alert"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        {verifyCopy.chainWarningTitle}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-amber-800/90 dark:text-amber-200/80">
        {verifyCopy.chainWarningBody}
      </p>
      <p className="mt-2 font-mono text-xs text-amber-900/80 dark:text-amber-300/90">{chainError}</p>
    </div>
  );
}
