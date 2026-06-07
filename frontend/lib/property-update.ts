import type { RegistryProperty } from '@/types/registry-property';
import {
  PROPERTY_REGISTRATION_TYPES,
  YEAR_BUILT_MAX,
  YEAR_BUILT_MIN,
  type PropertyRegistrationType,
} from '@/lib/submit-property';

export type PropertyUpdateFormState = {
  name: string;
  location: string;
  propertyType: PropertyRegistrationType;
  price: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  parking: string;
  floors: string;
  yearBuilt: string;
};

export function registryPropertyToUpdateForm(
  property: RegistryProperty,
): PropertyUpdateFormState {
  const type = PROPERTY_REGISTRATION_TYPES.includes(
    property.propertyType as PropertyRegistrationType,
  )
    ? (property.propertyType as PropertyRegistrationType)
    : 'Villa';

  return {
    name: property.name,
    location: property.location,
    propertyType: type,
    price: property.priceEth,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    sqft: String(property.sqft),
    parking: property.parking ? '1' : '0',
    floors: String(property.floors),
    yearBuilt:
      property.yearBuilt >= YEAR_BUILT_MIN
        ? String(property.yearBuilt)
        : '',
  };
}

export { PROPERTY_REGISTRATION_TYPES };
