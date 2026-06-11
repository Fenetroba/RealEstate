'use client';

import dynamic from 'next/dynamic';
import { Globe2, Loader2, MapPin, Mountain, Navigation } from 'lucide-react';

import { propertyDetailCopy } from '@/lib/constants/property-detail';
import { formatPropertyLocation, getLocationFacts } from '@/lib/property-detail';
import type { Property } from '@/types';
import { PropertyLocationAnalysis } from './PropertyLocationAnalysis';

import { DetailFactGrid, DetailPanel } from './DetailPanel';

// Leaflet map is SSR-unsafe — load dynamically
const LeafletMap = dynamic(() => import('@/components/maps/LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl bg-surface">
      <Loader2 className="size-5 animate-spin text-accent" />
    </div>
  ),
});

interface PropertyDetailLocationProps {
  property: Property;
}

export default function PropertyDetailLocation({ property }: PropertyDetailLocationProps) {
  const facts     = getLocationFacts(property);
  const lat       = property.location.lat;
  const lng       = property.location.lng;
  const hasCoords = lat != null && lng != null && (lat !== 0 || lng !== 0);
  const elevation = property.location.elevation;

  const position: [number, number] = hasCoords ? [lat, lng] : [9.03, 38.74];

  return (
    <DetailPanel title={propertyDetailCopy.mainLocationTitle} icon={MapPin}>
      {/* Address text */}
      <p className="mb-4 flex items-start gap-2 text-sm leading-relaxed text-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        {formatPropertyLocation(property.location)}
      </p>

      <DetailFactGrid facts={facts} />

      {/* Coordinates + elevation */}
      {hasCoords ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Navigation className="size-3.5 text-accent" />
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
          {elevation != null && (
            <span className="flex items-center gap-1">
              <Mountain className="size-3.5 text-accent" />
              {elevation} m elevation
            </span>
          )}
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Globe2 className="size-3.5 text-accent" />
          Map coordinates will appear once a location is selected.
        </p>
      )}

      {/* Embedded OpenStreetMap — free, no API key */}
      {hasCoords && (
        <div
          className="mt-4 overflow-hidden rounded-xl border border-border"
          style={{ height: 240 }}
        >
          <LeafletMap
            position={position}
            onDragEnd={() => { /* read-only on detail page */ }}
          />
        </div>
      )}

      {/* Nearby amenities & accessibility analysis */}
      {hasCoords && (
        <PropertyLocationAnalysis lat={lat} lng={lng} />
      )}

      <p className="mt-2 text-[10px] text-muted">
        Map data © <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >OpenStreetMap</a> contributors
      </p>
    </DetailPanel>
  );
}
