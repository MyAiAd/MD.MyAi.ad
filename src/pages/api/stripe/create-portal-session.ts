// src/pages/api/stripe/create-portal-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createUpgradeSession } from '@/lib/stripe';
import { z } from 'zod';

const portalSchema = z.object({
  returnUrl: z.string().url(),
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
    const { returnUrl } = portalSchema.parse(req.body);

    // Get the provider from the database
    const { data: provider, error } = await supabase
      .from('healthcare_providers')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !provider) {
      return res.status(404).json({ error: { message: 'Provider not found' } });
    }

    // Check if the provider has a Stripe customer ID
    if (!provider.stripe_customer_id) {
      return res.status(400).json({ error: { message: 'No subscription found. Please subscribe first.' } });
    }

    // Get the current subscription ID
    if (!provider.stripe_subscription_id) {
      return res.status(400).json({ error: { message: 'No active subscription found.' } });
    }

    // Create a billing portal session
    const portalSession = await createUpgradeSession(
      provider.stripe_customer_id,
      provider.stripe_subscription_id,
      'professional', // This isn't used directly in createUpgradeSession since Stripe's portal handles the upgrade UI
      returnUrl,
      returnUrl
    );

    return res.status(200).json({
      url: portalSession.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to create portal session' } });
  }
}

