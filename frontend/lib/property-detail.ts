import { getPropertyCatalog } from '@/lib/property-catalog-cache';

import { mockProperties } from '@/lib/mockData';

import {

  amenityLabels,

  listingTypeLabels,

  propertyDetailSimilarLimit,

  propertyTypeLabels,

} from '@/lib/constants/property-detail';

import { formatCurrency, formatPropertyPrice, truncateAddress } from '@/lib/utils';

import type { Property, PropertyAmenities, PropertyLocation } from '@/types';

import type { LucideIcon } from 'lucide-react';

import {

  Bath,

  Bed,

  Building2,

  Calendar,

  Car,

  Layers,

  Maximize2,

  Tag,

} from 'lucide-react';



export function getListingLabel(listingType: Property['listingType']): string {

  return listingTypeLabels[listingType];

}



export function formatPropertyLocation(location: PropertyLocation): string {

  const parts = [location.address, location.city, location.state].filter(Boolean);

  return parts.join(', ');

}



export type PropertyHighlightStat = {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
};

/** Top row: beds, baths, area — shown large under the gallery. */
export function getPropertyPrimaryHighlightStats(property: Property): PropertyHighlightStat[] {
  return [
    { icon: Bed, label: 'Bedrooms', value: String(property.bedrooms) },
    { icon: Bath, label: 'Bathrooms', value: String(property.bathrooms) },
    {
      icon: Maximize2,
      label: 'Living area',
      value: property.area.toLocaleString(),
      unit: 'sq ft',
    },
  ];
}

/** Second row: type, year, floors, parking. */
export function getPropertySecondaryHighlightStats(property: Property): PropertyHighlightStat[] {
  const stats: PropertyHighlightStat[] = [
    { icon: Building2, label: 'Type', value: propertyTypeLabels[property.propertyType] },
  ];

  if (property.yearBuilt) {
    stats.push({ icon: Calendar, label: 'Year built', value: String(property.yearBuilt) });
  }
  if (property.floors) {
    stats.push({ icon: Layers, label: 'Floors', value: String(property.floors) });
  }
  if (property.parkingSpaces) {
    stats.push({
      icon: Car,
      label: 'Parking',
      value: String(property.parkingSpaces),
      unit: property.parkingSpaces === 1 ? 'space' : 'spaces',
    });
  }

  return stats;
}

/** @deprecated Use primary + secondary highlight helpers */
export function getPropertyHighlightStats(property: Property): PropertyHighlightStat[] {
  return [...getPropertyPrimaryHighlightStats(property), ...getPropertySecondaryHighlightStats(property)];
}



export function getPropertyQuickGlanceFacts(property: Property): { label: string; value: string }[] {
  return [
    { label: 'Bedrooms', value: String(property.bedrooms) },
    { label: 'Bathrooms', value: String(property.bathrooms) },
    { label: 'Living area', value: `${property.area.toLocaleString()} sq ft` },
    { label: 'Type', value: propertyTypeLabels[property.propertyType] },
  ];
}



export function getPropertySummaryFacts(property: Property): { label: string; value: string }[] {

  const pricePerSqft =

    property.pricePerSqft != null

      ? property.priceCurrency === 'ETH'

        ? `${property.pricePerSqft.toFixed(4)} ETH`

        : formatCurrency(property.pricePerSqft)

      : '—';



  return [

    { label: 'Type', value: propertyTypeLabels[property.propertyType] },

    { label: 'Status', value: property.status },

    { label: 'Listing', value: getListingLabel(property.listingType) },

    { label: 'Bedrooms', value: String(property.bedrooms) },

    { label: 'Bathrooms', value: String(property.bathrooms) },

    { label: 'Living area', value: `${property.area.toLocaleString()} sq ft` },

    { label: 'Year built', value: property.yearBuilt ? String(property.yearBuilt) : '—' },

    { label: 'Floors', value: property.floors ? String(property.floors) : '—' },

    { label: 'Parking', value: property.parkingSpaces ? String(property.parkingSpaces) : '—' },

    { label: 'Price / sq ft', value: pricePerSqft },

    {

      label: 'Registry sale',

      value:

        property.registryForSale === false

          ? 'Not listed'

          : property.registryForSale

            ? 'On-chain listing'

            : '—',

    },

  ];

}



export function getLocationFacts(property: Property): { label: string; value: string }[] {

  const { location } = property;

  return [

    { label: 'Address', value: location.address },

    { label: 'City', value: location.city },

    { label: 'State / region', value: location.state },

    { label: 'Country', value: location.country },

    { label: 'Postal code', value: location.zipCode || '—' },

    ...(location.neighborhood ? [{ label: 'Neighborhood', value: location.neighborhood }] : []),

  ];

}



export function getEnabledAmenities(amenities: PropertyAmenities): (keyof PropertyAmenities)[] {

  return (Object.entries(amenities) as [keyof PropertyAmenities, boolean][])

    .filter(([, enabled]) => enabled)

    .map(([key]) => key);

}



export function getAiInsightMetrics(property: Property): {

  key: string;

  label: string;

  value: number;

  kind: 'risk' | 'score';

}[] {

  const { aiScores } = property;

  return [

    { key: 'risk', label: 'Overall risk', value: aiScores.riskScore, kind: 'risk' },

    { key: 'market', label: 'Market risk', value: aiScores.marketRisk, kind: 'risk' },

    { key: 'crime', label: 'Crime risk', value: aiScores.crimeRisk, kind: 'risk' },

    { key: 'flood', label: 'Flood risk', value: aiScores.floodRisk, kind: 'risk' },

    { key: 'carbon', label: 'Carbon score', value: aiScores.carbonScore, kind: 'score' },

    { key: 'energy', label: 'Energy efficiency', value: aiScores.energyEfficiency, kind: 'score' },

    {

      key: 'investment',

      label: 'Investment potential',

      value: aiScores.investmentPotential,

      kind: 'score',

    },

  ];

}



export function getSimilarProperties(

  property: Property,

  source: Property[] = getPropertyCatalog().length ? getPropertyCatalog() : mockProperties,

  limit = propertyDetailSimilarLimit,

): Property[] {

  return source

    .filter((item) => item.id !== property.id && item.propertyType === property.propertyType)

    .slice(0, limit);

}



export function getFractionalSoldPercent(property: Property): number | null {

  if (!property.isFractional || !property.fractionalShares || !property.availableShares) {

    return null;

  }



  return Math.round(

    ((property.fractionalShares - property.availableShares) / property.fractionalShares) * 100,

  );

}



/** Buyer-facing registry summary — no wallets, hashes, or tx ids. */
export function getPublicRegistrySummary(property: Property): { label: string; value: string }[] {
  const listing =
    property.registryForSale === false
      ? 'Not listed for sale'
      : property.registryForSale
        ? 'Listed on-chain'
        : getListingLabel(property.listingType);

  return [
    { label: 'Verification', value: property.blockchain.isVerified ? 'Verified' : 'Pending' },
    { label: 'Sale status', value: listing },
    {
      label: 'Registry record',
      value: property.blockchain.tokenId ? `#${property.blockchain.tokenId}` : '—',
    },
  ];
}

export function getBlockchainFields(

  property: Property,

): { label: string; value: string }[] {

  const { blockchain } = property;



  return [

    { label: 'NFT token ID', value: blockchain.tokenId ?? 'Not minted' },

    { label: 'Contract', value: blockchain.contractAddress ?? '—' },

    { label: 'Owner wallet', value: blockchain.ownerWallet ?? '—' },

    { label: 'Metadata (IPFS)', value: blockchain.metadataHash ?? '—' },

    { label: 'Images root', value: blockchain.imagesRootHash ?? '—' },

    { label: 'Documents root', value: blockchain.documentsRootHash ?? '—' },

    { label: 'Verification tx', value: blockchain.verificationTxHash ?? '—' },

  ];

}



export function formatBlockchainValue(label: string, value: string): string {

  if (value === '—' || value === 'Not minted') return value;

  if (label === 'NFT token ID') return value;

  if (label.startsWith('Metadata') || label.includes('root')) {

    return value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;

  }



  return truncateAddress(value);

}



export function formatTransferPrice(property: Property, price: number): string {

  if (price === 0) return '—';

  if (property.priceCurrency === 'ETH') {

    return `${price.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;

  }

  return formatCurrency(price);

}


