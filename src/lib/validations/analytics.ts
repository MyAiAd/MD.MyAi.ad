// src/lib/validations/analytics.ts
import { z } from 'zod';

// Newsletter analytics validation schema
export const newsletterAnalyticsSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  patient_id: z.string().uuid('Invalid patient ID'),
  email_sent: z.boolean().default(false),
  email_delivered: z.boolean().default(false),
  email_opened: z.boolean().default(false),
  links_clicked: z.array(z.string()).optional(),
  open_timestamp: z.string().optional().nullable(),
  click_timestamps: z.record(z.string()).optional(),
});

export type NewsletterAnalyticsInput = z.infer<typeof newsletterAnalyticsSchema>;

// Health outcome validation schema
export const healthOutcomeSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  patient_id: z.string().uuid('Invalid patient ID'),
  condition: z.string().min(1, 'Condition is required'),
  measurement_type: z.string().min(1, 'Measurement type is required'),
  measurement_value: z.number(),
  measurement_date: z.string(),
  notes: z.string().optional().nullable(),
});

export type HealthOutcomeInput = z.infer<typeof healthOutcomeSchema>;

// API response schemas
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const apiResponseSchema = z.object({
  data: z.any().optional(),
  error: apiErrorSchema.optional(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;


