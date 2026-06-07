import { z } from 'zod';

import {
  PROPERTY_REGISTRATION_TYPES,
  YEAR_BUILT_MAX,
  YEAR_BUILT_MIN,
  type PropertyRegistrationFormState,
} from '@/lib/submit-property';
import type { PropertyUpdateFormState } from '@/lib/property-update';
import { requiredNonNegativeNumeric, requiredTrimmed } from '@/lib/validation/fields';
import { firstZodError } from '@/lib/validation/zod-utils';

const propertyTypeSchema = z.enum(PROPERTY_REGISTRATION_TYPES);

const yearBuiltField = requiredNonNegativeNumeric('Year built').refine((raw) => {
  const year = Number(raw);
  return year >= YEAR_BUILT_MIN && year <= YEAR_BUILT_MAX;
}, `Valid year built (${YEAR_BUILT_MIN}–${YEAR_BUILT_MAX})`);

const propertyNumericFields = {
  price: requiredNonNegativeNumeric('Price (ETH)'),
  bedrooms: requiredNonNegativeNumeric('Bedrooms'),
  bathrooms: requiredNonNegativeNumeric('Bathrooms'),
  sqft: requiredNonNegativeNumeric('Sqft'),
  parking: requiredNonNegativeNumeric('Parking'),
  floors: requiredNonNegativeNumeric('Floors'),
  yearBuilt: yearBuiltField,
};

export const propertyRegistrationSchema = z.object({
  name: requiredTrimmed('Property name'),
  location: requiredTrimmed('Location'),
  propertyType: propertyTypeSchema,
  isForSale: z.boolean(),
  isForRent: z.boolean(),
  ...propertyNumericFields,
});

export const propertyUpdateSchema = z.object({
  name: requiredTrimmed('Property name'),
  location: requiredTrimmed('Location'),
  propertyType: propertyTypeSchema,
  ...propertyNumericFields,
});

export const propertyRegistrationImagesSchema = z
  .number()
  .int()
  .min(3, 'Please upload at least 3 images');

export function validatePropertyRegistrationForm(
  form: PropertyRegistrationFormState,
  imageCount: number,
): string | null {
  const body = propertyRegistrationSchema.safeParse(form);
  if (!body.success) return firstZodError(body.error);

  const images = propertyRegistrationImagesSchema.safeParse(imageCount);
  if (!images.success) return firstZodError(images.error);

  return null;
}

export function validatePropertyUpdateForm(form: PropertyUpdateFormState): string | null {
  const result = propertyUpdateSchema.safeParse(form);
  if (!result.success) return firstZodError(result.error);
  return null;
}
