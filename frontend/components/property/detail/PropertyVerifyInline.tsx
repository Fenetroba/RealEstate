'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { fetchPropertyVerifyReport } from '@/lib/api/property-verify';
import type { PropertyVerifyReport } from '@/types/property-verify';

interface PropertyVerifyInlineProps {
  tokenId: string;
  propertyName?: string;
}

export function PropertyVerifyInline({ tokenId, propertyName }: PropertyVerifyInlineProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PropertyVerifyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerify = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPropertyVerifyReport(tokenId);
      setReport(data);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not run integrity audit');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const versions = report?.versionHistory ?? [];
  const tamperProof = report?.tamperProof;

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Integrity audit</span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={loading}
            leftIcon={!loading ? <ShieldCheck className="size-4" /> : undefined}
            onClick={() => void runVerify()}
          >
            {report ? 'Re-check' : 'Check integrity'}
          </Button>
          {report && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface"
              aria-label={open ? 'Collapse' : 'Expand'}
            >
              {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Result banner */}
      {report && !loading && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            tamperProof
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          }`}
        >
          {tamperProof ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <div>
            <p className={`font-semibold ${tamperProof ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {tamperProof ? '✅ Tamper-proof verified' : '❌ Integrity check failed'}
            </p>
            {tamperProof ? (
              <ul className="mt-1 space-y-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                <li>📁 {report.filesIntegrity?.length ?? 0} files intact — bytes match stored hashes</li>
                {report.imagesRootMatch !== false && <li>🌿 Image root hash matches on-chain</li>}
                {report.documentsRootMatch !== false && <li>📄 Document root hash matches on-chain</li>}
                <li>🏛️ Verified against blockchain — no tampering detected</li>
              </ul>
            ) : (
              <ul className="mt-1 space-y-0.5 text-xs text-red-700 dark:text-red-400">
                {!report.metadataHashMatch && <li>⚠️ Metadata hash mismatch</li>}
                {!report.imagesRootMatch && <li>⚠️ Image files may have been tampered with</li>}
                {!report.documentsRootMatch && <li>⚠️ Document files may have been tampered with</li>}
                {!report.allFilesIntact && (
                  <li>⚠️ {report.filesIntegrity?.filter((f) => !f.match).length ?? 0} file(s) failed hash check</li>
                )}
                {report.chainError && <li>⚠️ Chain error: {report.chainError}</li>}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {/* Version history */}
      {open && versions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">
            Metadata versions ({versions.length})
          </p>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {versions.map((version, index) => {
              // Handle both object and string formats
              const isObject = typeof version === 'object' && version !== null;
              const versionNo = isObject ? (version as { versionNo: number }).versionNo : index + 1;
              const hash = isObject ? (version as { metadataHash: string }).metadataHash : String(version);
              const timestamp = isObject ? (version as { timestamp: number }).timestamp : null;
              
              // Format date if timestamp exists
              const dateStr = timestamp 
                ? new Date(timestamp * 1000).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '/')
                : null;

              return (
                <li
                  key={`${index}-${hash.slice(0, 8)}`}
                  className="flex flex-col gap-1.5 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">Version {versionNo}</p>
                    {dateStr && (
                      <p className="text-xs text-muted">{dateStr}</p>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted break-all">{hash}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {open && versions.length === 0 && report && (
        <p className="text-xs text-muted">No version history found.</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <Loader2 className="size-4 animate-spin" />
          Running integrity audit…
        </div>
      )}
    </div>
  );
}
