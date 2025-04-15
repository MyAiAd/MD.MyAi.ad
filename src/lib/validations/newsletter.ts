// src/lib/validations/newsletter.ts
import { z } from 'zod';

// Base content block schema for newsletter templates
const contentBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'button', 'divider', 'spacer', 'health-info']),
  content: z.record(z.any()),
  conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
});

// Newsletter template validation schema
export const newsletterTemplateSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject line is required'),
  content: z.array(contentBlockSchema),
  target_conditions: z.array(z.string()).optional(),
  target_medications: z.array(z.string()).optional(),
  target_dietary: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

export type NewsletterTemplateInput = z.infer<typeof newsletterTemplateSchema>;

// Newsletter campaign validation schema
export const newsletterCampaignSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  template_id: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Campaign name is required'),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'paused']).default('draft'),
  scheduled_date: z.string().optional().nullable(),
});

export type NewsletterCampaignInput = z.infer<typeof newsletterCampaignSchema>;

// Health condition validation
export const healthConditionSchema = z.object({
  name: z.string().min(1, 'Condition name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type HealthConditionInput = z.infer<typeof healthConditionSchema>;

// Medication validation
export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;


