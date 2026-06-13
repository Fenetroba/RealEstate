'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight, CheckCircle2, Copy, Download,
  ExternalLink, History, MapPin, Pencil, Tag, X,
} from 'lucide-react';

import { DashboardEntityCard } from '@/components/dashboard/DashboardEntityCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TransferModal } from '@/components/my-properties/TransferModal';
import { formatPropertyTypeLabel, formatRequestPrice } from '@/lib/registry-request-labels';
import { fetchPropertyImages } from '@/lib/api/properties';
import { printOwnershipCertificate } from '@/lib/ownership-certificate';
import { typeBodySm } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/api/client';
import type { RegistryProperty } from '@/types/registry-property';
import type { Contract } from 'ethers';

interface OwnedPropertyCardProps {
  property:        RegistryProperty;
  dbPropertyId:    string | null;
  hasDbRecord:     boolean;
  writeContract:   Contract | null;
  onSubmitUpdate:  () => void;
  onVersionHistory: () => void;
  onRefresh:       () => void;
}

export function OwnedPropertyCard({
  property,
  dbPropertyId,
  hasDbRecord,
  writeContract,
  onSubmitUpdate,
  onVersionHistory,
  onRefresh,
}: OwnedPropertyCardProps) {
  const [thumb, setThumb] = useState(
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  );
  const [copied,           setCopied]           = useState(false);
  const [transferOpen,     setTransferOpen]     = useState(false);
  const [delisting,        setDelisting]        = useState(false);
  const walletAddress = useAppSelector((s) => s.wallet.address);

  useEffect(() => {
    if (!dbPropertyId) return;
    fetchPropertyImages(dbPropertyId)
      .then((imgs) => {
        if (imgs.length > 0) setThumb(`data:${imgs[0].mimeType};base64,${imgs[0].data}`);
      })
      .catch(() => {});
  }, [dbPropertyId]);

  const listingNote =
    property.isForSale && property.isForRent ? 'Listed for sale & rent'
    : property.isForSale                      ? 'Listed for sale'
    : property.isForRent                      ? 'Listed for rent'
    : 'Not listed';
  const isListed = property.isForSale || property.isForRent;

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCopyVerifyLink = async () => {
    const url = `${window.location.origin}/properties/${property.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCertificate = () => {
    printOwnershipCertificate({
      propertyName: property.name,
      location:     property.location,
      propertyType: property.propertyType,
      tokenId:      property.id,
      ownerWallet:  property.owner,
      metadataHash: property.metadataHash,
      issuedAt:     new Date().toISOString(),
    });
  };

  const handleDelist = async () => {
    if (!dbPropertyId) return;
    setDelisting(true);
    try {
      await apiClient.post(`/properties/${dbPropertyId}/delist`, {
        wallet: walletAddress,
      });
      onRefresh();
    } catch { /* silent */ }
    finally { setDelisting(false); }
  };

  return (
    <>
      <DashboardEntityCard className="w-full p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Image */}
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:h-40 sm:w-40">
            <img src={thumb} alt="" className="size-full object-cover" draggable={false} />
            <span className={cn(
              'absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold',
              isListed
                ? 'bg-green-600 text-white'
                : 'bg-surface/90 text-muted border border-border',
            )}>
              {listingNote}
            </span>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            {/* Title row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-heading text-base font-semibold text-foreground leading-tight">
                {property.name}
              </h3>
              <Link href={`/properties/${property.id}`}>
                <Badge variant="default" size="sm" className="shrink-0 font-mono text-xs hover:opacity-80">
                  NFT #{property.id}
                </Badge>
              </Link>
            </div>

            {/* Location + type */}
            <p className={cn(typeBodySm, 'flex items-center gap-1.5')}>
              <MapPin className="size-3.5 shrink-0 text-accent" />
              <span className="truncate">
                {property.location}
                <span className="text-muted"> · </span>
                {formatPropertyTypeLabel(property.propertyType)}
              </span>
            </p>

            {/* Price */}
            <p className="font-heading text-sm font-semibold text-accent">
              {formatRequestPrice(property.priceEth)}
            </p>

            {!hasDbRecord && (
              <p className="text-xs text-amber-600">Registry files not linked yet.</p>
            )}

            {/* ── Owner Actions ── */}
            <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">

              {/* 1. Download certificate */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="size-4" />}
                onClick={handleDownloadCertificate}
                title="Download ownership certificate (PDF)"
              >
                Certificate
              </Button>

              {/* 2. Copy verification link */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={copied
                  ? <CheckCircle2 className="size-4 text-green-600" />
                  : <Copy className="size-4" />}
                onClick={() => void handleCopyVerifyLink()}
                title="Copy verification link"
              >
                {copied ? 'Copied!' : 'Share'}
              </Button>

              {/* 3. View on detail page */}
              <Link href={`/properties/${property.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink className="size-4" />}
                  title="View property page"
                >
                  View
                </Button>
              </Link>

              {/* 4. Submit metadata update */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="size-4" />}
                onClick={onSubmitUpdate}
                title="Submit metadata update request"
              >
                Update
              </Button>

              {/* 5. Version history */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<History className="size-4" />}
                onClick={onVersionHistory}
                title="View on-chain version history"
              >
                History
              </Button>

              {/* 6. Transfer ownership */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowRight className="size-4" />}
                onClick={() => setTransferOpen(true)}
                title="Transfer to another wallet"
              >
                Transfer
              </Button>

              {/* 7. Delist — only shown when currently listed */}
              {isListed && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={delisting
                    ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    : <X className="size-4" />}
                  onClick={() => void handleDelist()}
                  disabled={delisting || !dbPropertyId}
                  className="text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                  title="Remove from marketplace"
                >
                  {delisting ? 'Delisting…' : 'Delist'}
                </Button>
              )}

              {/* 8. List on marketplace — only when not listed */}
              {!isListed && (
                <Link href={`/properties/${property.id}`} className="ml-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Tag className="size-4" />}
                  >
                    List on marketplace
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </DashboardEntityCard>

      {/* Transfer modal */}
      <TransferModal
        isOpen={transferOpen}
        tokenId={property.id}
        propertyName={property.name}
        writeContract={writeContract}
        onClose={() => setTransferOpen(false)}
        onSuccess={() => { setTransferOpen(false); onRefresh(); }}
      />
    </>
  );
}
