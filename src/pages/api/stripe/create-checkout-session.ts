// src/pages/api/stripe/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createCheckoutSession, createCustomer } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  tier: z.enum(['base', 'professional', 'enterprise']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  try {
    // Validate the request body
    const { tier, successUrl, cancelUrl } = checkoutSchema.parse(req.body);

    // Get the provider from the database
    const { data: provider, error } = await supabase
      .from('healthcare_providers')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !provider) {
      return res.status(404).json({ error: { message: 'Provider not found' } });
    }

    // Check if the provider already has a Stripe customer ID
    let customerId = provider.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await createCustomer(provider.email, provider.name);
      customerId = customer.id;

      // Update the provider with the Stripe customer ID
      await supabase
        .from('healthcare_providers')
        .update({ stripe_customer_id: customerId })
        .eq('id', provider.id);
    }

    // Create a checkout session
    const checkoutSession = await createCheckoutSession(
      customerId,
      tier,
      successUrl,
      cancelUrl
    );

    return res.status(200).json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to create checkout session' } });
  }
}
