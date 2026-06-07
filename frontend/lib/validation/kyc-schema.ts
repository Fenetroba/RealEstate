import { z } from 'zod';

import { KYC_REQUIRED_KINDS, type KycDocKind } from '@/lib/kyc/types';
import { firstZodError } from '@/lib/validation/zod-utils';

export const KYC_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const kycUploadFileSchema = z
  .instanceof(File, { message: 'Please choose a file' })
  .refine((file) => file.size <= KYC_MAX_FILE_BYTES, 'Maximum size is 10MB per image.')
  .refine(
    (file) => file.type.startsWith('image/'),
    'Please upload an image file (JPEG, PNG, or WebP).',
  );

export function validateKycUploadFile(file: File): string | null {
  const result = kycUploadFileSchema.safeParse(file);
  if (!result.success) return firstZodError(result.error);
  return null;
}

export function validateKycReadyForSubmit(uploadedKinds: Set<KycDocKind>): string | null {
  const missing = KYC_REQUIRED_KINDS.filter((k) => !uploadedKinds.has(k));
  if (missing.length === 0) return null;
  return 'Upload ID front, ID back, and a selfie before submitting.';
}
