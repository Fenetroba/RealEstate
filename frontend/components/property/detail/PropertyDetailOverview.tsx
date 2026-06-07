import { FileText, Sparkles } from 'lucide-react';

import {
  amenityIcons,
  amenityLabels,
  propertyDetailCopy,
} from '@/lib/constants/property-detail';
import { getEnabledAmenities } from '@/lib/property-detail';
import { typeBody } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

import { DetailEmptyState, DetailPanel } from './DetailPanel';

interface PropertyDetailOverviewProps {
  property: Property;
}

export default function PropertyDetailOverview({ property }: PropertyDetailOverviewProps) {
  const amenityKeys = getEnabledAmenities(property.amenities);

  return (
    <div className="space-y-6 2xl:space-y-8 3xl:space-y-8 4xl:space-y-10">
      <DetailPanel title={propertyDetailCopy.mainDescriptionTitle} icon={FileText}>
        <p className={cn(typeBody, 'text-muted')}>{property.description}</p>
        {property.investmentType.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {property.investmentType.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground"
              >
                <Sparkles className="size-3 text-accent" />
                {type}
              </span>
            ))}
          </div>
        )}
      </DetailPanel>

      <DetailPanel title={propertyDetailCopy.mainFeaturesTitle} icon={Sparkles}>
        {amenityKeys.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2 2xl:gap-3 lg:grid-cols-3 3xl:grid-cols-4 4xl:gap-4">
            {amenityKeys.map((key) => {
              const Icon = amenityIcons[key];
              return (
                <li
                  key={key}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border border-border bg-surface/80 px-3 py-2.5 text-sm text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0 text-accent" aria-hidden />
                  {amenityLabels[key]}
                </li>
              );
            })}
          </ul>
        ) : (
          <DetailEmptyState icon={Sparkles} message={propertyDetailCopy.emptyFeatures} />
        )}
      </DetailPanel>
    </div>
  );
}
