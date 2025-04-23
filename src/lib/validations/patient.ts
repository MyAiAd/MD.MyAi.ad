// src/lib/validations/patient.ts
import { z } from 'zod';

// Patient validation schema
export const patientSchema = z.object({
  provider_id: z.string().uuid('Invalid provider ID'),
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional().nullable(),
  health_conditions: z.array(z.string()).optional().default([]),
  medications: z.array(z.string()).optional().default([]),
  dietary_restrictions: z.array(z.string()).optional().default([]),
  consent_status: z.enum(['active', 'pending', 'revoked']).default('pending'),
  consent_date: z.string().optional().nullable(),
  preferred_frequency: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
});

export type PatientInput = z.infer<typeof patientSchema>;

// Bulk patient import schema
export const bulkPatientImportSchema = z.array(patientSchema);

export type BulkPatientImportInput = z.infer<typeof bulkPatientImportSchema>;

// Patient update schema
export const patientUpdateSchema = patientSchema.partial().extend({
  id: z.string().uuid('Invalid patient ID'),
});

export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;

