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

const optionalNonNegativeNumeric = z
  .string()
  .optional()
  .transform((v) => v ?? '')
  .pipe(z.string());

const propertyNumericFields = {
  bedrooms: requiredNonNegativeNumeric('Bedrooms'),
  bathrooms: requiredNonNegativeNumeric('Bathrooms'),
  sqft: requiredNonNegativeNumeric('Sqft'),
  parking: requiredNonNegativeNumeric('Parking'),
  floors: requiredNonNegativeNumeric('Floors'),
  yearBuilt: yearBuiltField,
};

export const propertyRegistrationSchema = z
  .object({
    name:        requiredTrimmed('Property name'),
    location:    requiredTrimmed('Location'),
    propertyType: propertyTypeSchema,
    isForSale:   z.boolean(),
    isForRent:   z.boolean(),
    price:       z.string().default(''),
    rentPrice:   z.string().default(''),
    ...propertyNumericFields,
  })
  .superRefine((data, ctx) => {
    // Sale price required when listing for sale
    if (data.isForSale && (!data.price.trim() || Number(data.price) < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price'], message: 'Sale price (ETH) is required' });
    }
    // Rent price required when listing for rent
    if (data.isForRent && (!data.rentPrice.trim() || Number(data.rentPrice) < 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rentPrice'], message: 'Monthly rent (ETH) is required' });
    }
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
  const body = propertyRegistrationSchema.safeParse({
    ...form,
    price:     form.isForSale ? form.price : (form.price || '0'),
    rentPrice: form.isForRent ? form.rentPrice : (form.rentPrice || '0'),
  });
  if (!body.success) return firstZodError(body.error);

  // Require coordinates — must have selected a location from the map
  if (form.latitude == null || form.longitude == null) {
    return 'Please select a location using the map picker. Type an address in the location field and choose a suggestion.';
  }

  const images = propertyRegistrationImagesSchema.safeParse(imageCount);
  if (!images.success) return firstZodError(images.error);

  return null;
}

export function validatePropertyUpdateForm(form: PropertyUpdateFormState): string | null {
  const result = propertyUpdateSchema.safeParse(form);
  if (!result.success) return firstZodError(result.error);
  return null;
}
