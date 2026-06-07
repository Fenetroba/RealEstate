import { z } from 'zod';

/** Trimmed non-empty string required for a labeled field. */
export function requiredTrimmed(label: string) {
  return z.string().trim().min(1, `${label} is required`);
}

/** Numeric string: required, finite, non-negative. */
export function requiredNonNegativeNumeric(label: string) {
  return z
    .string()
    .trim()
    .min(1, `Please fill in ${label}`)
    .refine((raw) => {
      const n = Number(raw);
      return Number.isFinite(n) && n >= 0;
    }, `${label} cannot be negative`);
}

export const passwordFieldSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');
