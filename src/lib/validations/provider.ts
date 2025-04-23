// src/lib/validations/provider.ts
import { z } from 'zod';

// Healthcare Provider validation schema
export const providerSchema = z.object({
  name: z.string().min(2, 'Provider name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subscription_tier: z.enum(['base', 'professional', 'enterprise']).default('base'),
  subscription_status: z.enum(['active', 'inactive', 'trial']).default('trial'),
  max_patients: z.number().int().positive().default(1000),
  custom_domain: z.string().optional().nullable(),
  branding_settings: z.record(z.any()).optional().nullable(),
});

export type ProviderInput = z.infer<typeof providerSchema>;

// Provider authentication schema
export const providerAuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type ProviderAuthInput = z.infer<typeof providerAuthSchema>;

// Password reset schema
export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

