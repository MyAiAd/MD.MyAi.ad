// src/tests/unit/lib/email-renderer.test.ts
import { renderNewsletterTemplate, personalizeNewsletterForPatient } from '@/lib/email-renderer';

// Mock the renderAsync function from @react-email/render
jest.mock('@react-email/render', () => ({
  renderAsync: jest.fn().mockResolvedValue('<html><body>Test Email</body></html>'),
}));

describe('Email Renderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderNewsletterTemplate', () => {
    it('should render a diabetes newsletter template', async () => {
      const templateData = {
        patientName: 'John Doe',
        provider: {
          name: 'Example Clinic',
          logo: 'https://example.com/logo.png',
          primaryColor: '#0067b8',
        },
        lastA1c: 6.5,
        latestBloodGlucose: 120,
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
        ],
        nextAppointment: 'January 15, 2023 at 2:00 PM',
        unsubscribeUrl: '#unsubscribe',
      };

      const html = await renderNewsletterTemplate('diabetes', templateData);
      expect(html).toBeTruthy();
      expect(html).toContain('<html>');
    });

    it('should render a general health newsletter template', async () => {
      const templateData = {
        patientName: 'John Doe',
        provider: {
          name: 'Example Clinic',
          logo: 'https://example.com/logo.png',
          primaryColor: '#0067b8',
        },
        healthTips: [
          { title: 'Stay Hydrated', content: 'Drink water regularly' },
          { title: 'Exercise Daily', content: '30 minutes of activity' },
        ],
        unsubscribeUrl: '#unsubscribe',
      };

      const html = await renderNewsletterTemplate('general-health', templateData);
      expect(html).toBeTruthy();
      expect(html).toContain('<html>');
    });

    it('should throw an error for an unknown template type', async () => {
      await expect(
        renderNewsletterTemplate('unknown-template' as any, {})
      ).rejects.toThrow('Unknown template type');
    });

    it('should throw an error for custom templates that are not yet implemented', async () => {
      await expect(
        renderNewsletterTemplate('custom', {})
      ).rejects.toThrow('Custom templates are not yet implemented');
    });
  });
});

