'use client';

import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';

import PropertyCard from '@/components/property/PropertyCard';
import PropertyDetailGallery from '@/components/property/detail/PropertyDetailGallery';
import PropertyDetailLocation from '@/components/property/detail/PropertyDetailLocation';
import PropertyDetailOverview from '@/components/property/detail/PropertyDetailOverview';
import PropertyDetailRecords from '@/components/property/detail/PropertyDetailRecords';
import PropertyDetailSidebar from '@/components/property/detail/PropertyDetailSidebar';
import { propertyDetailCopy, propertyDetailLayout } from '@/lib/constants/property-detail';
import { getSimilarProperties } from '@/lib/property-detail';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';
import type { RealDocument, RealOwnershipHistory } from '@/hooks/usePropertyDetail';

interface PropertyDetailContentProps {
  property: Property;
  documents: RealDocument[];
  ownershipHistory: RealOwnershipHistory[];
  docsLoading?: boolean;
}

export default function PropertyDetailContent({ property, documents, ownershipHistory, docsLoading = false }: PropertyDetailContentProps) {
  const [currentImage, setCurrentImage] = useState(0);

  const images = property.media.images;
  const similar = getSimilarProperties(property);

  return (
    <div className="w-full min-w-0">
      <div className={propertyDetailLayout.pageGrid}>
        <div className={propertyDetailLayout.mainColumn}>
          <PropertyDetailGallery
            property={property}
            currentIndex={currentImage}
            onSelect={setCurrentImage}
            onPrevious={() =>
              setCurrentImage((index) => (index - 1 + images.length) % images.length)
            }
            onNext={() => setCurrentImage((index) => (index + 1) % images.length)}
          />

          <PropertyDetailOverview property={property} />

          <PropertyDetailLocation property={property} />

          <PropertyDetailRecords property={property} documents={documents} ownershipHistory={ownershipHistory} docsLoading={docsLoading} />
        </div>

        <PropertyDetailSidebar property={property} />
      </div>

      {similar.length > 0 ? (
        <section className={propertyDetailLayout.similarSection}>
          <h2 className={cn(propertyDetailLayout.sectionTitle, 'mb-5 2xl:mb-6 4xl:mb-8')}>
            <LayoutGrid className="size-5 shrink-0 text-accent 2xl:size-6 4xl:size-7" />
            {propertyDetailCopy.similarTitle}
          </h2>
          <div className={propertyDetailLayout.similarGrid}>
            {similar.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}