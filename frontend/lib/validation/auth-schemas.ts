import { z } from 'zod';

import { passwordFieldSchema } from '@/lib/validation/fields';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email'),
    password: passwordFieldSchema,
    confirmPassword: z.string(),
    role: z.literal('USER'),
    agreeToTerms: z.boolean().refine((value) => value, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterForm = z.infer<typeof registerSchema>;
