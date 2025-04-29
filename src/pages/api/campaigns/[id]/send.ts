// Example of how to use the Redis queue in an API route
// src/pages/api/campaigns/[id]/send.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { queueNewsletter } from '@/lib/redis';

interface Campaign {
  id: string;
  status: string;
  [key: string]: any;
}

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

  const providerId = session.user.id;
  const campaignId = req.query.id as string;

  try {
    // Verify the campaign exists and belongs to the provider
    const { data: campaign, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('provider_id', providerId)
      .single();

    if (error || !campaign) {
      return res.status(404).json({ error: { message: 'Campaign not found' } });
    }

    // Check if campaign is in a valid state to be sent
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({
        error: { message: `Campaign cannot be sent because it is in '${campaign.status}' status` },
      });
    }

    // Queue the campaign for processing
    const jobId = await queueNewsletter({ campaignId: campaign.id });

    // Update campaign status to 'sending'
    await supabase
      .from('newsletter_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    return res.status(200).json({
      data: {
        message: 'Campaign queued for sending',
        jobId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to queue campaign' } });
  }
}
