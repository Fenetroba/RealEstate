'use client';

import { useEffect, useRef, useState } from 'react';

import { fetchPropertyImages } from '@/lib/api/properties';
import { mediaDataUrl } from '@/lib/property-media';
import type { PropertyImageDto } from '@/types/registry-property';

const FALLBACK =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop';

/**
 * Fetches real backend images for a property and returns them as data-URL strings.
 * Falls back to provided URLs (or a default placeholder) while loading or when
 * dbId is unavailable.
 */
export function usePropertyImages(
  dbId: string | null | undefined,
  fallbackUrls?: string[],
): { images: string[]; loading: boolean } {
  // Stable ref so fallbackUrls changes don't re-trigger the effect
  const fallbackRef = useRef<string[]>(
    fallbackUrls && fallbackUrls.length > 0 ? fallbackUrls : [FALLBACK],
  );
  useEffect(() => {
    if (fallbackUrls && fallbackUrls.length > 0) {
      fallbackRef.current = fallbackUrls;
    }
  }, [fallbackUrls]);

  const [images, setImages] = useState<string[]>(fallbackRef.current);
  const [loading, setLoading] = useState<boolean>(Boolean(dbId));

  useEffect(() => {
    if (!dbId) {
      // No DB id — just show fallback immediately
      setImages(fallbackRef.current);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchPropertyImages(dbId)
      .then((dtos: PropertyImageDto[]) => {
        if (cancelled) return;
        if (dtos.length > 0) {
          setImages(dtos.map((dto) => mediaDataUrl(dto)));
        } else {
          setImages(fallbackRef.current);
        }
      })
      .catch(() => {
        if (!cancelled) setImages(fallbackRef.current);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dbId]); // only re-run when dbId changes

  return { images, loading };
}
