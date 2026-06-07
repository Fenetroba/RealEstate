'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, History, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import type { Contract } from 'ethers';

import { Button } from '@/components/ui/Button';
import { DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { fetchPropertyVerifyReport } from '@/lib/api/property-verify';
import { verifyCopy } from '@/lib/constants/verify';
import { buildMockVerifyReport } from '@/lib/mock-property-verify';
import { resolveTamperProof } from '@/types/property-verify';
import {
  normalizeMetadataVersions,
  shortenHash,
} from '@/lib/metadata-versions';
import { fetchMetadataVersions } from '@/lib/web3/registry-contract';
import { getReadOnlyRegistryContract } from '@/lib/web3/registry-contract';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
interface VersionHistoryModalProps {
  isOpen: boolean;
  tokenId: string | null;
  propertyName?: string;
  writeContract: Contract | null;
  onClose: () => void;
}

const MOCK_VERSIONS = [
  { metadataHash: 'QmMockV1SunsetMetadata', timestamp: BigInt(1704067200) },
  { metadataHash: 'QmMockV2SunsetMetadataUpdated', timestamp: BigInt(1717200000) },
];

export function VersionHistoryModal({
  isOpen,
  tokenId,
  propertyName,
  writeContract,
  onClose,
}: VersionHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<
    { versionNo: number; metadataHash: string; timestampLabel: string }[]
  >([]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyOk, setVerifyOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen || !tokenId) {
      setVersions([]);
      setError(null);
      setVerifyOk(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setVerifyOk(null);

    void (async () => {
      try {
        if (isRegistryMockMode()) {
          if (!cancelled) {
            setVersions(normalizeMetadataVersions(MOCK_VERSIONS));
          }
          return;
        }

        const contract = writeContract ?? getReadOnlyRegistryContract();
        if (!contract) {
          throw new Error('Registry contract is not available.');
        }

        const rows = await fetchMetadataVersions(contract, tokenId);
        if (!cancelled) {
          setVersions(normalizeMetadataVersions(rows));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load version history');
          setVersions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, tokenId, writeContract]);

  const handleVerify = async () => {
    if (!tokenId) return;
    setVerifyLoading(true);
    setVerifyOk(null);
    try {
      if (isRegistryMockMode()) {
        await new Promise((r) => setTimeout(r, 400));
        setVerifyOk(resolveTamperProof(buildMockVerifyReport(tokenId, propertyName)));
        return;
      }
      const result = await fetchPropertyVerifyReport(tokenId);
      setVerifyOk(resolveTamperProof(result));
    } catch {
      setVerifyOk(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  const verifyHref = tokenId ? `/properties/${tokenId}/verify` : null;

  const title = propertyName
    ? `Version history — ${propertyName}`
    : tokenId
      ? `Version history — NFT #${tokenId}`
      : 'Version history';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" fitContent className="overflow-hidden">
      <DialogHeader
        title={title}
        description="On-chain metadata versions for this property. Hashes change when updates are approved."
        icon={History}
        onClose={onClose}
      />

      <DialogBody className="space-y-4 pt-2">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Loading versions…
          </div>
        ) : error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No metadata versions recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {versions.map((v) => (
              <li key={v.versionNo} className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Version {v.versionNo}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {shortenHash(v.metadataHash, 12)}
                  </p>
                </div>
                <p className="text-xs text-muted sm:text-right">{v.timestampLabel}</p>
              </li>
            ))}
          </ul>
        )}

        {versions.length > 0 && !loading && !error ? (
          <div className="space-y-3 rounded-lg border border-border bg-surface/60 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="size-4" />}
                isLoading={verifyLoading}
                onClick={() => void handleVerify()}
              >
                Quick check
              </Button>
              {verifyOk === true ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="size-4" />
                  Tamper-proof
                </span>
              ) : null}
              {verifyOk === false ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400">
                  <XCircle className="size-4" />
                  Audit failed
                </span>
              ) : null}
            </div>
            {verifyHref ? (
              <Link
                href={verifyHref}
                className="text-sm font-medium text-accent hover:underline"
                onClick={onClose}
              >
                {verifyCopy.linkFullReport}
              </Link>
            ) : null}
          </div>
        ) : null}
      </DialogBody>

      <DialogFooter className="mt-0">
        <Button variant="outline" size="md" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Modal>
  );
}
