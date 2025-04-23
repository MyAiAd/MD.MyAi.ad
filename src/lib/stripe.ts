// src/lib/stripe.ts
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

// The pricing plan IDs corresponding to our product tiers
// These would be created in the Stripe dashboard
export const STRIPE_PRICE_IDS = {
  base: process.env.STRIPE_PRICE_ID_BASE || '',
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL || '',
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
};

// Map our internal subscription tiers to Stripe price IDs
export function getPriceIdForTier(tier: 'base' | 'professional' | 'enterprise'): string {
  return STRIPE_PRICE_IDS[tier];
}

// Map Stripe price IDs to our internal subscription tiers
export function getTierForPriceId(priceId: string): 'base' | 'professional' | 'enterprise' | null {
  const entries = Object.entries(STRIPE_PRICE_IDS);
  for (const [tier, id] of entries) {
    if (id === priceId) {
      return tier as 'base' | 'professional' | 'enterprise';
    }
  }
  return null;
}

// Create a Stripe checkout session for a new subscription
export async function createCheckoutSession(
  customerId: string,
  tier: 'base' | 'professional' | 'enterprise',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const priceId = getPriceIdForTier(tier);
  
  if (!priceId) {
    throw new Error(`No price ID found for tier: ${tier}`);
  }
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        tier,
      },
    },
  });
  
  return session;
}

// Create a Stripe checkout session for changing subscription tiers
export async function createUpgradeSession(
  customerId: string,
  subscriptionId: string,
  newTier: 'base' | 'professional' | 'enterprise',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const returnUrl = successUrl;
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session;
}

// Create a new Stripe customer
export async function createCustomer(email: string, name: string): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      isHealthcareProvider: 'true',
    },
  });
  
  return customer;
}

// Retrieve a customer's subscription information
export async function getCustomerSubscription(customerId: string): Promise<{
  subscriptionId: string | null;
  status: string | null;
  tier: 'base' | 'professional' | 'enterprise' | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    expand: ['data.default_payment_method'],
  });
  
  if (subscriptions.data.length === 0) {
    return {
      subscriptionId: null,
      status: null,
      tier: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
  
  const subscription = subscriptions.data[0];
  const priceId = subscription.items.data[0].price.id;
  const tier = getTierForPriceId(priceId);
  
  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    tier,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

// Cancel a subscription at the end of the billing period
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  
  return subscription;
}

// Reactivate a subscription that was set to cancel at period end
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  
  return subscription;
}

