// jest.setup.js
import '@testing-library/jest-dom';
import { setGlobalConfig } from '@storybook/testing-react';
import * as globalStorybookConfig from './.storybook/preview';

// Configure React Testing Library
import { configure } from '@testing-library/react';

configure({
  testIdAttribute: 'data-testid',
});

// Make Storybook config available in test files
setGlobalConfig(globalStorybookConfig);

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
    route: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          in: jest.fn(),
          order: jest.fn(),
          range: jest.fn(),
          filter: jest.fn(),
          contains: jest.fn(),
        })),
        order: jest.fn(() => ({
          range: jest.fn(),
        })),
        range: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

// Mock Redis client
jest.mock('@/lib/redis', () => ({
  getRedisClient: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    lPush: jest.fn(),
    rPopLPush: jest.fn(),
    lRem: jest.fn(),
    hIncrBy: jest.fn(),
    hGetAll: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    sAdd: jest.fn(),
    sRem: jest.fn(),
    lRange: jest.fn(),
    lLen: jest.fn(),
    bRPopLPush: jest.fn(),
  })),
  redisKeys: {
    patient: jest.fn((id) => `patient:${id}`),
    patientsByProvider: jest.fn((providerId) => `provider:${providerId}:patients`),
    newsletterQueue: 'queue:newsletters',
    newsletterProcessing: 'processing:newsletters',
    newsletterFailed: 'failed:newsletters',
    rateLimitKey: jest.fn((key) => `ratelimit:${key}`),
    campaignStats: jest.fn((campaignId) => `campaign:${campaignId}:stats`),
    sessionData: jest.fn((sessionId) => `session:${sessionId}`),
  },
  closeRedisConnection: jest.fn(),
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
    },
    subscriptions: {
      list: jest.fn(),
      update: jest.fn(),
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
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});
