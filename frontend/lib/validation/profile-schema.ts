import { z } from 'zod';

import { requiredTrimmed } from '@/lib/validation/fields';

export const profileFormSchema = z.object({
  first_name: requiredTrimmed('First name').min(2, 'First name must be at least 2 characters'),
  last_name: requiredTrimmed('Last name').min(2, 'Last name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().max(30, 'Phone number is too long'),
  location: z.string().trim().max(200, 'Location is too long'),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or less'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
