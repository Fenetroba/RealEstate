import { Download, ExternalLink, FileText, History, Shield } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { propertyDetailCopy, propertyDetailLayout } from '@/lib/constants/property-detail';
import { getFractionalSoldPercent, getPublicRegistrySummary } from '@/lib/property-detail';
import { getPublicRegistryExplorerUrl } from '@/lib/registry-explorer';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Property } from '@/types';
import type { RealDocument, RealOwnershipHistory } from '@/hooks/usePropertyDetail';

import { DetailFactGrid, DetailPanel } from './DetailPanel';

interface PropertyDetailRecordsProps {
  property: Property;
  documents: RealDocument[];
  ownershipHistory: RealOwnershipHistory[];
}

export default function PropertyDetailRecords({ property, documents, ownershipHistory }: PropertyDetailRecordsProps) {
  const registrySummary = getPublicRegistrySummary(property);
  const explorerUrl = getPublicRegistryExplorerUrl(property);
  const soldPercent = getFractionalSoldPercent(property);
  const hasDocuments = documents.length > 0 || property.documents.length > 0;
  const useRealDocs  = documents.length > 0;
  const hasHistory = ownershipHistory.length > 0 || property.timeline.length > 0;
  const useRealHistory = ownershipHistory.length > 0;

  return (
    <div className="space-y-6 2xl:space-y-8 3xl:space-y-8 4xl:space-y-10">
      <DetailPanel title={propertyDetailCopy.mainOwnershipTitle} icon={Shield}>
        <div
          className={cn(
            'mb-5 flex gap-3 rounded-xl border px-4 py-3',
            property.blockchain.isVerified
              ? 'border-success/30 bg-success/10'
              : 'border-warning/30 bg-warning/10',
          )}
        >
          <Shield className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {property.blockchain.isVerified
                ? propertyDetailCopy.verifiedTitle
                : propertyDetailCopy.pendingTitle}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {property.blockchain.isVerified
                ? propertyDetailCopy.verifiedBody
                : propertyDetailCopy.pendingBody}
            </p>
          </div>
        </div>

        <DetailFactGrid facts={registrySummary} />

        {explorerUrl ? (
          <div className="mt-5">
            <Button variant="outline" size="md" href={explorerUrl} className="w-full sm:w-auto">
              <ExternalLink className="size-4" />
              {propertyDetailCopy.viewOnExplorerLabel}
            </Button>
          </div>
        ) : null}
      </DetailPanel>

      {hasDocuments && (
        <DetailPanel title={propertyDetailCopy.mainDocumentsTitle} icon={FileText}>
          <ul className="space-y-2">
            {useRealDocs
              ? documents.map((doc) => {
                  const isPDF = doc.mimeType?.toLowerCase().includes('pdf');
                  const dataUrl = `data:${doc.mimeType};base64,${doc.data}`;
                  return (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 hover:bg-card transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileText className="size-4 shrink-0 text-accent" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted">
                            {isPDF ? 'PDF Document' : doc.mimeType}
                            {isPDF && ' · Click to download'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={dataUrl}
                        download={doc.name}
                        aria-label={`Download ${doc.name}`}
                        className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface hover:border-accent transition-colors"
                      >
                        <Download className="size-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    </li>
                  );
                })
              : property.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-accent" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted">{doc.type} · {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" href={doc.url} aria-label={`Open ${doc.name}`}>
                      <ExternalLink className="size-4" />
                    </Button>
                  </li>
                ))
            }
          </ul>
        </DetailPanel>
      )}

      {hasHistory && (
        <DetailPanel title={propertyDetailCopy.mainHistoryTitle} icon={History}>
          <ul className="space-y-5">
            {useRealHistory
              ? ownershipHistory.map((event, index) => {
                  // Convert Wei to ETH (divide by 1e18)
                  const priceWei = BigInt(event.price || '0');
                  const priceEth = Number(priceWei) / 1e18;
                  
                  const date = event.timestamp 
                    ? new Date(event.timestamp * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })
                    : null;
                  
                  const isInitialMint = event.from === '0x0000000000000000000000000000000000000000';
                  const fromDisplay = isInitialMint ? '🏛️ Government (Minted)' : event.from;
                  const priceDisplay = isInitialMint ? 'Initial Mint' : `${priceEth.toFixed(1)} ETH`;

                  return (
                    <li key={`${index}-${event.timestamp}`} className="rounded-xl border border-border bg-surface px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div>
                              <p className="text-xs font-medium text-muted uppercase tracking-wide">From:</p>
                              <p className="mt-0.5 font-mono text-sm text-foreground break-all">
                                {fromDisplay}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted uppercase tracking-wide">To:</p>
                              <p className="mt-0.5 font-mono text-sm text-foreground break-all">
                                {event.to}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-muted">Price:</span>
                            <span className="font-semibold text-accent">{priceDisplay}</span>
                          </div>
                          {date && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-muted">Date:</span>
                              <span className="text-xs text-muted">{date}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })
              : property.timeline.map((event) => (
                  <li key={event.id} className="relative pl-6">
                    <span
                      className="absolute left-0 top-1.5 size-2.5 rounded-full border-2 border-accent bg-card"
                      aria-hidden
                    />
                    <span className="absolute bottom-0 left-[4px] top-4 w-px bg-border" aria-hidden />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-foreground">{event.title}</p>
                      {event.price != null && (
                        <p className="text-sm font-semibold text-accent">
                          {property.priceCurrency === 'ETH'
                            ? `${event.price} ETH`
                            : formatCurrency(event.price)}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{event.description}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(event.date)}</p>
                  </li>
                ))
            }
          </ul>
        </DetailPanel>
      )}

      {property.isFractional && property.sharePrice && soldPercent !== null && (
        <DetailPanel title={propertyDetailCopy.fractionalTitle} icon={Shield}>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
              <dt className="text-muted">Share price</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {formatCurrency(property.sharePrice)}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
              <dt className="text-muted">Available</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {property.availableShares?.toLocaleString() ?? '0'}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
              <dt className="text-muted">Total shares</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {property.fractionalShares?.toLocaleString() ?? '0'}
              </dd>
            </div>
          </dl>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent" style={{ width: `${soldPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{soldPercent}% allocated</p>
        </DetailPanel>
      )}
    </div>
  );
}