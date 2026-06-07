import type { LucideIcon } from 'lucide-react';
import {
  AirVent,
  Car,
  Dumbbell,
  Flame,
  Home,
  Leaf,
  Lock,
  PawPrint,
  Sofa,
  TreePine,
  Waves,
  Wifi,
  Building2,
} from 'lucide-react';

import { propertiesHeroPanelClass, propertiesPageShellClass } from '@/lib/constants/properties-browse';
import {
  appPanelPaddingClass,
  appPanelRadiusClass,
  gridCardsClass,
  typeBodySm,
  typeH1,
  typeH2,
  typeStatValue,
} from '@/lib/responsive';
import { cn } from '@/lib/utils';
import type { Property, PropertyAmenities, ListingType } from '@/types';

export const propertyDetailCopy = {
  backHref: '/properties',
  backLabel: 'Back to listings',
  similarTitle: 'More like this',
  sidebarPriceLabel: 'Asking price',
  verifiedTitle: 'Verified on registry',
  verifiedBody: 'This property is recorded on the EDENET registry.',
  pendingTitle: 'Verification pending',
  pendingBody: 'On-chain verification has not been completed yet.',
  mainDescriptionTitle: 'About this property',
  mainDetailsTitle: 'Property details',
  mainFeaturesTitle: 'Amenities',
  mainOwnershipTitle: 'Registry & verification',
  viewOnExplorerLabel: 'View on block explorer',
  mainDocumentsTitle: 'Documents',
  mainTransfersTitle: 'Transfer history',
  mainHistoryTitle: 'Listing history',
  mainLocationTitle: 'Location',
  highlightsTitle: 'More details',
  emptyHistory: 'No timeline events yet.',
  emptyTransfers: 'No on-chain transfers recorded.',
  emptyFeatures: 'No amenities listed for this property.',
  emptyDocuments: 'No documents uploaded yet.',
  fractionalTitle: 'Fractional ownership',
  registryListed: 'Listed on-chain',
  registryNotListed: 'Not listed for sale',
  metaViews: (count: number) => `${count.toLocaleString()} views`,
  metaSaves: (count: number) => `${count.toLocaleString()} saves`,
  notFoundTitle: 'Property not found',
  notFoundBody: 'This listing may have been removed or the link is incorrect.',
} as const;

export const propertyDetailActions = {
  offer: { label: 'Make an offer', href: '/dashboard/my-requests' },
  viewing: { label: 'Book a viewing', href: '/contact' },
} as const;

export const amenityLabels: Record<keyof PropertyAmenities, string> = {
  parking: 'Parking',
  pool: 'Pool',
  gym: 'Gym',
  security: 'Security',
  elevator: 'Elevator',
  garden: 'Garden',
  balcony: 'Balcony',
  airConditioning: 'Air conditioning',
  heating: 'Heating',
  internet: 'Internet',
  furnished: 'Furnished',
  petFriendly: 'Pet friendly',
};

export const amenityIcons: Record<keyof PropertyAmenities, LucideIcon> = {
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  security: Lock,
  elevator: Building2,
  garden: TreePine,
  balcony: Home,
  airConditioning: AirVent,
  heating: Flame,
  internet: Wifi,
  furnished: Sofa,
  petFriendly: PawPrint,
};

export const listingTypeLabels: Record<ListingType, string> = {
  SALE: 'For sale',
  RENT: 'For rent',
  BOTH: 'Sale & rent',
};

/** Same shell as browse listings — nav offset + gutters */
export const propertyDetailPageShellClass = cn(
  propertiesPageShellClass,
  'space-y-6 sm:space-y-8 2xl:space-y-10',
);

export const propertyDetailHeroClass = propertiesHeroPanelClass;

export const propertyDetailLayout = {
  pageGrid: cn(
    'grid w-full min-w-0 grid-cols-1 items-start',
    'gap-6 sm:gap-7 md:gap-8',
    'lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,20rem)] lg:gap-8',
    '2xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22.5rem)] 2xl:gap-10',
    '3xl:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] 3xl:gap-10',
    '4xl:grid-cols-[minmax(0,1fr)_minmax(22.5rem,27.5rem)] 4xl:gap-12',
  ),
  mainColumn: cn(
    'min-w-0 space-y-6',
    '2xl:space-y-8 3xl:space-y-8 4xl:space-y-10',
  ),
  panel: cn(appPanelRadiusClass, 'overflow-hidden border border-border bg-card'),
  panelHeader: cn(
    'flex items-center gap-2.5 border-b border-border',
    'px-5 py-4 sm:px-6 md:px-7 lg:px-8 2xl:px-8 3xl:px-8 4xl:px-9',
  ),
  panelTitle: cn(typeH2, 'text-foreground'),
  panelBody: appPanelPaddingClass,
  sectionTitle: cn(typeH2, 'flex items-center gap-2 text-foreground'),
  factGrid: cn(
    'grid grid-cols-1 gap-x-4 gap-y-3',
    typeBodySm,
    'sm:grid-cols-2 lg:grid-cols-3',
    '2xl:gap-x-6 2xl:gap-y-4 3xl:gap-x-8 4xl:gap-x-10',
  ),
  factLabel: 'text-muted',
  factValue: 'font-medium text-foreground',
  similarGrid: gridCardsClass,
  /** Sticky only for the main detail column; pair with similar section below the grid. */
  sidebarSticky: cn(
    'w-full min-w-0 lg:self-start',
    'lg:sticky lg:top-[calc(var(--site-nav-header-height,5rem)+0.75rem)]',
    'lg:max-h-[calc(100vh-var(--site-nav-header-height,5rem)-1.5rem)] lg:overflow-y-auto lg:overscroll-contain',
  ),
  similarSection: cn(
    'mt-8 border-t border-border pt-8',
    '2xl:mt-10 2xl:pt-10 3xl:mt-10 3xl:pt-10 4xl:mt-12 4xl:pt-12',
  ),
  header: propertyDetailHeroClass,
  headerBackLink: cn(
    typeBodySm,
    'mb-4 inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-accent',
    'dark:text-muted dark:hover:text-accent',
  ),
  headerTitle: cn(typeH1, 'text-white dark:text-foreground'),
  headerPrice: cn(typeStatValue, 'text-accent'),
  headerMeta: cn(
    typeBodySm,
    'mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-white/70 dark:text-muted',
  ),
  galleryImage: cn(
    'relative aspect-[16/10] w-full min-w-0',
    'max-h-[22rem] sm:max-h-[24rem] md:max-h-[26rem] lg:max-h-[28rem]',
    '2xl:max-h-[32rem] 3xl:max-h-[36rem] 4xl:max-h-[40rem]',
  ),
  highlightPad: 'border-t border-border bg-card overflow-hidden',
  twoColSection: cn(
    'grid gap-6 lg:grid-cols-2',
    '2xl:gap-8 3xl:gap-8 4xl:gap-10',
  ),
} as const;

export const propertyDetailSimilarLimit = 2;

export const propertyTypeLabels: Record<Property['propertyType'], string> = {
  HOUSE: 'House',
  APARTMENT: 'Apartment',
  CONDO: 'Condo',
  VILLA: 'Villa',
  COMMERCIAL: 'Commercial',
  LAND: 'Land',
  TOWNHOUSE: 'Townhouse',
};
