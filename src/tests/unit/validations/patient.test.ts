// src/tests/unit/validations/patient.test.ts
import { patientSchema, bulkPatientImportSchema } from '@/lib/validations/patient';
import { z } from 'zod';

describe('Patient Validation Schemas', () => {
  describe('patientSchema', () => {
    it('should validate a valid patient object', () => {
      const validPatient = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'patient@example.com',
        first_name: 'John',
        last_name: 'Doe',
        health_conditions: ['diabetes', 'hypertension'],
        medications: ['metformin'],
        dietary_restrictions: [],
        consent_status: 'active' as const,
      };

      const result = patientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it('should reject a patient with an invalid email', () => {
      const invalidPatient = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'not-an-email',
        first_name: 'John',
        last_name: 'Doe',
        consent_status: 'active' as const,
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject a patient with missing required fields', () => {
      const invalidPatient = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'patient@example.com',
        // Missing first_name and last_name
      };

      const result = patientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errorPaths = result.error.issues.map(issue => issue.path[0]);
        expect(errorPaths).toContain('first_name');
        expect(errorPaths).toContain('last_name');
      }
    });

    it('should set default values for optional fields', () => {
      const minimalPatient = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'patient@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = patientSchema.safeParse(minimalPatient);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.health_conditions).toEqual([]);
        expect(result.data.medications).toEqual([]);
        expect(result.data.dietary_restrictions).toEqual([]);
        expect(result.data.consent_status).toBe('pending');
      }
    });
  });

  describe('bulkPatientImportSchema', () => {
    it('should validate an array of valid patients', () => {
      const validPatients = [
        {
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'patient1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          consent_status: 'active' as const,
        },
        {
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'patient2@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          consent_status: 'pending' as const,
        },
      ];

      const result = bulkPatientImportSchema.safeParse(validPatients);
      expect(result.success).toBe(true);
    });

    it('should reject if any patient in the array is invalid', () => {
      const mixedPatients = [
        {
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'patient1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          consent_status: 'active' as const,
        },
        {
          provider_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'invalid-email',
          first_name: 'Jane',
          last_name: 'Smith',
          consent_status: 'pending' as const,
        },
      ];

      const result = bulkPatientImportSchema.safeParse(mixedPatients);
      expect(result.success).toBe(false);
    });
  });
});

