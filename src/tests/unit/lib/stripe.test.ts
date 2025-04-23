// src/tests/unit/lib/stripe.test.ts
import {
  getPriceIdForTier,
  getTierForPriceId,
  createCheckoutSession,
  createCustomer,
} from '@/lib/stripe';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe');

describe('Stripe Helpers', () => {
  let mockStripe;
  
  beforeEach(() => {
    mockStripe = {
      customers: {
        create: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
    };
    
    (Stripe as unknown as jest.Mock).mockImplementation(() => mockStripe);
  });

  describe('getPriceIdForTier', () => {
    it('should return the correct price ID for each tier', () => {
      // Mock environment variables
      process.env.STRIPE_PRICE_ID_BASE = 'price_base';
      process.env.STRIPE_PRICE_ID_PROFESSIONAL = 'price_pro';
      process.env.STRIPE_PRICE_ID_ENTERPRISE = 'price_enterprise';
      
      expect(getPriceIdForTier('base')).toBe('price_base');
      expect(getPriceIdForTier('professional')).toBe('price_pro');
      expect(getPriceIdForTier('enterprise')).toBe('price_enterprise');
    });
  });

  describe('getTierForPriceId', () => {
    it('should return the correct tier for each price ID', () => {
      // Mock environment variables
      process.env.STRIPE_PRICE_ID_BASE = 'price_base';
      process.env.STRIPE_PRICE_ID_PROFESSIONAL = 'price_pro';
      process.env.STRIPE_PRICE_ID_ENTERPRISE = 'price_enterprise';
      
      expect(getTierForPriceId('price_base')).toBe('base');
      expect(getTierForPriceId('price_pro')).toBe('professional');
      expect(getTierForPriceId('price_enterprise')).toBe('enterprise');
      expect(getTierForPriceId('unknown_price')).toBeNull();
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a Stripe checkout session with correct parameters', async () => {
      // Mock environment variables
      process.env.STRIPE_PRICE_ID_PROFESSIONAL = 'price_pro';
      
      const mockSession = { id: 'cs_123', url: 'https://checkout.stripe.com/123' };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);
      
      const result = await createCheckoutSession(
        'cus_123',
        'professional',
        'https://example.com/success',
        'https://example.com/cancel'
      );
      
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_pro',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        subscription_data: {
          metadata: {
            tier: 'professional',
          },
        },
      });
      
      expect(result).toBe(mockSession);
    });

    it('should throw an error if price ID is not found for the tier', async () => {
      // Clear environment variables
      process.env.STRIPE_PRICE_ID_PROFESSIONAL = '';
      
      await expect(
        createCheckoutSession(
          'cus_123',
          'professional',
          'https://example.com/success',
          'https://example.com/cancel'
        )
      ).rejects.toThrow('No price ID found for tier: professional');
    });
  });

  describe('createCustomer', () => {
    it('should create a Stripe customer with correct parameters', async () => {
      const mockCustomer = { id: 'cus_123', email: 'test@example.com' };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      
      const result = await createCustomer('test@example.com', 'Test Clinic');
      
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test Clinic',
        metadata: {
          isHealthcareProvider: 'true',
        },
      });
      
      expect(result).toBe(mockCustomer);
    });
  });
});

