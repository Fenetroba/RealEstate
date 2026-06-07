'use client';

import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';

import { VerifyChainWarning } from '@/components/verify/VerifyChainWarning';
import { VerifyChecklist } from '@/components/verify/VerifyChecklist';
import { VerifyFilesTable } from '@/components/verify/VerifyFilesTable';
import { VerifyTamperBanner } from '@/components/verify/VerifyTamperBanner';
import { VerifyTechnicalDetails } from '@/components/verify/VerifyTechnicalDetails';
import { VerifyVersionHistory } from '@/components/verify/VerifyVersionHistory';
import { Button } from '@/components/ui/Button';
import { verifyCopy } from '@/lib/constants/verify';
import { usePropertyVerify } from '@/hooks/usePropertyVerify';

interface VerifyPageContentProps {
  tokenId: string;
  propertyName?: string;
}

function VerifyLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 rounded-2xl bg-border/40" />
      <div className="h-48 rounded-xl bg-border/30" />
      <div className="h-64 rounded-xl bg-border/30" />
    </div>
  );
}

function VerifyErrorState({
  message,
  status,
  tokenId,
}: {
  message: string;
  status: number | null;
  tokenId: string;
}) {
  const isNotFound = status === 404;
  const isNotMinted = status === 400;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {isNotFound
          ? verifyCopy.notFoundTitle
          : isNotMinted
            ? verifyCopy.notMintedTitle
            : 'Audit unavailable'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {isNotFound
          ? verifyCopy.notFoundBody
          : isNotMinted
            ? verifyCopy.notMintedBody
            : message}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="primary" href={`/properties/${tokenId}`}>
          {verifyCopy.backToProperty}
        </Button>
        <Button variant="outline" href="/properties">
          {verifyCopy.backToListings}
        </Button>
      </div>
    </div>
  );
}

export function VerifyPageContent({ tokenId, propertyName }: VerifyPageContentProps) {
  const { report, loading, error, errorStatus, mockMode, refresh } = usePropertyVerify(tokenId, {
    propertyName,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{verifyCopy.pageSubtitle}</p>
          {mockMode ? (
            <p className="mt-2 text-xs text-muted">{verifyCopy.mockNotice}</p>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={
            loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />
          }
          onClick={() => void refresh()}
          disabled={loading}
        >
          {verifyCopy.runAgain}
        </Button>
      </div>

      {loading && !report ? <VerifyLoadingSkeleton /> : null}

      {error && !report ? (
        <VerifyErrorState message={error} status={errorStatus} tokenId={tokenId} />
      ) : null}

      {report ? (
        <>
          <VerifyTamperBanner report={report} />
          {report.chainError ? <VerifyChainWarning chainError={report.chainError} /> : null}
          <VerifyChecklist report={report} />

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {verifyCopy.filesSection}
            </h2>
            <div className="mt-4">
              <VerifyFilesTable files={report.filesIntegrity ?? []} />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {verifyCopy.versionsSection}
            </h2>
            <div className="mt-4">
              <VerifyVersionHistory hashes={report.versionHistory ?? []} />
            </div>
          </section>

          <VerifyTechnicalDetails report={report} />

          <p className="text-xs leading-relaxed text-muted">{verifyCopy.disclaimer}</p>

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button variant="primary" href={`/properties/${tokenId}`}>
              {verifyCopy.backToProperty}
            </Button>
            <Link href="/properties" className="inline-flex items-center text-sm font-medium text-accent hover:underline">
              {verifyCopy.backToListings}
            </Link>
          </div>
        </>
      ) : null}

      {loading && report ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {verifyCopy.loading}
        </p>
      ) : null}
    </div>
  );
}
