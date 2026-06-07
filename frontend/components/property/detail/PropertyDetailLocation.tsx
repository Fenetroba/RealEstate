import { Globe2, MapPin, Navigation } from 'lucide-react';

import { propertyDetailCopy } from '@/lib/constants/property-detail';
import { formatPropertyLocation, getLocationFacts } from '@/lib/property-detail';
import type { Property } from '@/types';

import { DetailFactGrid, DetailPanel } from './DetailPanel';

interface PropertyDetailLocationProps {
  property: Property;
}

export default function PropertyDetailLocation({ property }: PropertyDetailLocationProps) {
  const facts = getLocationFacts(property);
  const hasCoords = property.location.lat !== 0 || property.location.lng !== 0;

  return (
    <DetailPanel title={propertyDetailCopy.mainLocationTitle} icon={MapPin}>
      <p className="mb-4 flex items-start gap-2 text-sm leading-relaxed text-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        {formatPropertyLocation(property.location)}
      </p>
      <DetailFactGrid facts={facts} />
      {hasCoords ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Navigation className="size-3.5 text-accent" />
          {property.location.lat.toFixed(4)}, {property.location.lng.toFixed(4)}
        </p>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Globe2 className="size-3.5 text-accent" />
          Map coordinates will appear when geocoding is available.
        </p>
      )}
    </DetailPanel>
  );
}
