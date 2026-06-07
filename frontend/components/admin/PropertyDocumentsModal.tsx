'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, FileText, ImageIcon, Loader2 } from 'lucide-react';

import { DialogBody, DialogHeader } from '@/components/ui/Dialog';
import { Modal } from '@/components/ui/Modal';
import { 
  fetchPropertyDocuments, 
  fetchPropertyImages,
  fetchRequestDocuments,
  fetchRequestImages,
} from '@/lib/api/properties';
import { documentLabel, imageAltText, mediaDataUrl, openMediaInNewTab } from '@/lib/property-media';
import type { PropertyDocumentDto, PropertyImageDto } from '@/types/registry-property';

interface PropertyDocumentsModalProps {
  isOpen: boolean;
  dbId: string | null;
  title: string;
  onClose: () => void;
  /** If true, fetch from request endpoints instead of property endpoints (for pending requests) */
  isRequest?: boolean;
}

export function PropertyDocumentsModal({
  isOpen,
  dbId,
  title,
  onClose,
  isRequest = false,
}: PropertyDocumentsModalProps) {
  const [images, setImages] = useState<PropertyImageDto[]>([]);
  const [documents, setDocuments] = useState<PropertyDocumentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!dbId) return;
    setLoading(true);
    setError(null);
    try {
      // For pending requests, use request endpoints; for approved properties, use property endpoints
      const [imgs, docs] = await Promise.all([
        isRequest ? fetchRequestImages(dbId) : fetchPropertyImages(dbId),
        isRequest ? fetchRequestDocuments(dbId) : fetchPropertyDocuments(dbId),
      ]);
      setImages(imgs);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load files');
      setImages([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [dbId, isRequest]);

  useEffect(() => {
    if (isOpen && dbId) {
      void load();
    } else if (!isOpen) {
      setImages([]);
      setDocuments([]);
      setError(null);
    }
  }, [isOpen, dbId, load]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" fitContent className="overflow-hidden">
      <DialogHeader
        title={title}
        description="Images and documents from the registry API for this submission."
        icon={FileText}
        iconTone="accent"
        onClose={onClose}
      />
      <DialogBody className="max-h-[min(65vh,560px)] space-y-6 overflow-y-auto pt-2">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Loading media…
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <>
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ImageIcon className="size-4 text-accent" aria-hidden />
                Images ({images.length})
              </h3>
              {images.length === 0 ? (
                <p className="text-sm text-muted">No images returned for this property.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img, i) => (
                    <button
                      key={`${i}-${img.name ?? 'img'}`}
                      type="button"
                      onClick={() => openMediaInNewTab(img)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaDataUrl(img)}
                        alt={imageAltText(img, i)}
                        className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="size-4 text-accent" aria-hidden />
                Documents ({documents.length})
              </h3>
              {documents.length === 0 ? (
                <p className="text-sm text-muted">No documents returned for this property.</p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc, i) => (
                    <li key={`${i}-${doc.name ?? 'doc'}`}>
                      <button
                        type="button"
                        onClick={() => openMediaInNewTab(doc)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-accent hover:bg-surface cursor-pointer"
                      >
                        <ExternalLink className="size-4 shrink-0" aria-hidden />
                        {documentLabel(doc, i)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </DialogBody>
    </Modal>
  );
}
