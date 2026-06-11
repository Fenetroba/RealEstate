'use client';

/**
 * LeafletMapInner — imperative Leaflet map, avoids "already initialized" error.
 *
 * Uses useEffect to create/destroy the Leaflet map instance manually instead
 * of relying on MapContainer, which cannot survive React's HMR remounts.
 */

import { useEffect, useRef } from 'react';
import type L from 'leaflet';

interface LeafletMapInnerProps {
  position:  [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}

export default function LeafletMapInner({ position, onDragEnd }: LeafletMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);
  const onDragRef    = useRef(onDragEnd);

  // Keep latest callback without re-running effects
  useEffect(() => { onDragRef.current = onDragEnd; }, [onDragEnd]);

  // ── Init map once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // If already initialized (HMR), destroy previous instance first
    if ((containerRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
      mapRef.current?.remove();
      mapRef.current  = null;
      markerRef.current = null;
    }

    // Dynamic import so Leaflet only loads client-side
    let cancelled = false;

    void (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (cancelled || !containerRef.current) return;

      // Fix broken default icon paths in bundlers
      // @ts-expect-error – _getIconUrl is a private method
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, {
        center:          position,
        zoom:            14,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(position, { draggable: true }).addTo(map);

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        onDragRef.current(lat, lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onDragRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current    = map;
      markerRef.current = marker;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current    = null;
      markerRef.current = null;
    };
  // Only run on mount — position updates handled separately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update marker + pan map when position prop changes ────────────────────
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const latlng = { lat: position[0], lng: position[1] };
    markerRef.current.setLatLng(latlng);
    mapRef.current.flyTo(latlng, mapRef.current.getZoom(), { animate: true, duration: 0.6 });
  }, [position]);

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
      aria-label="Property location map"
    />
  );
}
