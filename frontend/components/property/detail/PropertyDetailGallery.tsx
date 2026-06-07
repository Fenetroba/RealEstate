'use client';

import { ChevronLeft, ChevronRight, Images, Loader2 } from 'lucide-react';

import PropertyDetailHighlightStrip from '@/components/property/detail/PropertyDetailHighlightStrip';
import { usePropertyImages } from '@/hooks/usePropertyImages';
import { propertyDetailLayout } from '@/lib/constants/property-detail';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyDetailGalleryProps {
  property: Property;
  currentIndex: number;
  onSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PropertyDetailGallery({
  property,
  currentIndex,
  onSelect,
  onPrevious,
  onNext,
}: PropertyDetailGalleryProps) {
  const fallbackUrls = property.media.images.length
    ? property.media.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'];

  // Fetch real backend images when a dbId is available
  const dbId = property.blockchain?.dbId ?? null;
  const { images, loading: imagesLoading } = usePropertyImages(dbId, fallbackUrls);

  const hasMultiple = images.length > 1;
  // Clamp currentIndex in case the real image count differs from mock
  const safeIndex = Math.min(currentIndex, images.length - 1);

  return (
    <section
      className={cn(propertyDetailLayout.panel, 'min-w-0')}
      aria-label="Property photos"
    >
      <div className={propertyDetailLayout.galleryImage}>
        {imagesLoading ? (
          <div className="flex size-full items-center justify-center bg-border/20">
            <Loader2 className="size-8 animate-spin text-muted" aria-label="Loading images" />
          </div>
        ) : (
          <img
            src={images[safeIndex]}
            alt={`${property.title}, photo ${safeIndex + 1} of ${images.length}`}
            className="size-full object-cover"
            draggable={false}
          />
        )}

        {hasMultiple && !imagesLoading && (
          <>
            <button
              type="button"
              onClick={onPrevious}
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm 2xl:size-10 4xl:size-11"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5 2xl:size-6" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm 2xl:size-10 4xl:size-11"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5 2xl:size-6" />
            </button>
            <p className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2.5 py-1 text-xs text-white 2xl:text-sm">
              <Images className="size-3.5 2xl:size-4" />
              {safeIndex + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {hasMultiple && !imagesLoading && (
        <div className="min-w-0 border-t border-border">
          <div
            className={cn(
              'flex gap-2 overflow-x-auto overscroll-x-contain p-3',
              'sm:gap-3 sm:p-4 2xl:gap-4 2xl:p-5 3xl:p-6 4xl:p-7',
              '[scrollbar-width:thin]',
            )}
          >
            {images.map((image, index) => (
              <button
                key={`${index}`}
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === safeIndex}
                className={cn(
                  'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity',
                  'sm:h-[4.5rem] sm:w-28 2xl:h-20 2xl:w-32 3xl:h-[5.5rem] 3xl:w-36 4xl:h-24 4xl:w-40',
                  index === safeIndex
                    ? 'border-accent opacity-100'
                    : 'border-border opacity-75 hover:opacity-100',
                )}
              >
                <img src={image} alt="" className="size-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      <PropertyDetailHighlightStrip property={property} />
    </section>
  );
}
