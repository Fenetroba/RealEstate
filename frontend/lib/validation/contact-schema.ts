import { z } from 'zod';

import { requiredTrimmed } from '@/lib/validation/fields';

export const contactFormSchema = z.object({
  fullName: requiredTrimmed('Full name').min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email'),
  companyName: z.string().trim().max(120, 'Company name is too long'),
  subject: z.string().trim().max(200, 'Subject is too long'),
  message: requiredTrimmed('Message').min(10, 'Message must be at least 10 characters'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function contactValuesFromFormData(formData: FormData): ContactFormValues {
  return {
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    companyName: String(formData.get('companyName') ?? ''),
    subject: String(formData.get('subject') ?? ''),
    message: String(formData.get('message') ?? ''),
  };
}
