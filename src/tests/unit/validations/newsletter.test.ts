// src/tests/unit/validations/newsletter.test.ts
import { newsletterTemplateSchema } from '@/lib/validations/newsletter';

describe('Newsletter Validation Schemas', () => {
  describe('newsletterTemplateSchema', () => {
    it('should validate a valid newsletter template', () => {
      const validTemplate = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Diabetes Monthly Update',
        subject: 'Your Monthly Diabetes Management Update',
        content: [
          {
            id: 'block-1',
            type: 'text',
            content: { text: 'Hello {first_name}, here is your monthly update.' },
            conditions: ['diabetes'],
            medications: [],
            dietary: [],
          },
          {
            id: 'block-2',
            type: 'image',
            content: { src: 'https://example.com/image.jpg', alt: 'Health graphic' },
            conditions: [],
            medications: [],
            dietary: [],
          },
        ],
        target_conditions: ['diabetes'],
        is_active: true,
      };

      const result = newsletterTemplateSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it('should reject a template with missing required fields', () => {
      const invalidTemplate = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        // Missing name and subject
        content: [],
      };

      const result = newsletterTemplateSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errorPaths = result.error.issues.map(issue => issue.path[0]);
        expect(errorPaths).toContain('name');
        expect(errorPaths).toContain('subject');
      }
    });

    it('should set default values for optional fields', () => {
      const minimalTemplate = {
        provider_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Diabetes Monthly Update',
        subject: 'Your Monthly Diabetes Management Update',
        content: [],
      };

      const result = newsletterTemplateSchema.safeParse(minimalTemplate);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.is_active).toBe(true);
        expect(result.data.target_conditions).toBeUndefined();
        expect(result.data.target_medications).toBeUndefined();
        expect(result.data.target_dietary).toBeUndefined();
      }
    });
  });
});

