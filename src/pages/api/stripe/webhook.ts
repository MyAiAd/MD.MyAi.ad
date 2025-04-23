// src/pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { getTierForPriceId } from '@/lib/stripe';

// Disable body parser to get raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Map Stripe subscription status to our provider status
function mapSubscriptionStatus(status: string): 'active' | 'inactive' | 'trial' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'inactive';
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
      return 'inactive';
    default:
      return 'inactive';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    return res.status(400).json({ error: { message: 'Missing stripe-signature header' } });
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Add other webhook events as needed
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: { message: (error as Error).message } });
  }
}

// Handle subscription created or updated
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;
  const tier = getTierForPriceId(priceId);
  
  if (!tier) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }
  
  // Get max patients based on tier
  let max_patients = 1000; // Default for base tier
  if (tier === 'professional') {
    max_patients = 3000;
  } else if (tier === 'enterprise') {
    max_patients = 10000; // No actual limit, but we set a high number
  }
  
  // Update the provider record
  const { data: providers, error } = await supabase
    .from('healthcare_providers')
    .update({
      stripe_subscription_id: subscriptionId,
      subscription_tier: tier,
      subscription_status: mapSubscriptionStatus(status),
      max_patients,
      stripe_subscription_data: subscription as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)
    .select();
  
  if (error) {
    console.error('Error updating provider subscription:', error);
    throw error;
  }
  
  if (!providers || providers.length === 0) {
    console.error(`No provider found with Stripe customer ID: ${customerId}`);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Update the provider record
  const { error } = await supabase
    .from('healthcare_providers')
    .update({
      subscription_status: 'inactive',
      stripe_subscription_data: subscription as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
  
  if (error) {
    console.error('Error updating provider subscription on deletion:', error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return; // Not a subscription invoice
  }
  
  // You could record the payment in your database or update usage statistics
  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return; // Not a subscription invoice
  }
  
  // Update the provider status to reflect the payment failure
  const { error } = await supabase
    .from('healthcare_providers')
    .update({
      subscription_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
  
  if (error) {
    console.error('Error updating provider status on payment failure:', error);
    throw error;
  }
  
  // You might want to send a notification to the provider about the payment failure
  // This would be implemented in a separate service
}

