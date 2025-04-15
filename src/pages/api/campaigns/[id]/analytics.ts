// src/pages/api/campaigns/[id]/analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('newsletter_analytics')
      .select('*')
      .eq('campaign_id', campaignId);

    if (analyticsError) {
      throw analyticsError;
    }

    // Process analytics data
    const sent = campaign.actual_send_count;
    const delivered = analytics?.filter(a => a.email_delivered).length || 0;
    const opened = analytics?.filter(a => a.email_opened).length || 0;
    const clicked = analytics?.filter(a => a.links_clicked && a.links_clicked.length > 0).length || 0;

    // Calculate rates
    const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
    const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
    const clickRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0;

    // Prepare engagement data for chart
    const engagementData = [
      { category: 'Sent', count: sent },
      { category: 'Delivered', count: delivered },
      { category: 'Opened', count: opened },
      { category: 'Clicked', count: clicked },
    ];

    // Get link click distribution
    const linkClickData = [];
    if (analytics && analytics.length > 0) {
      const linkCounts = {};
      
      analytics.forEach(record => {
        if (record.links_clicked && record.links_clicked.length > 0) {
          record.links_clicked.forEach(link => {
            linkCounts[link] = (linkCounts[link] || 0) + 1;
          });
        }
      });
      
      Object.entries(linkCounts).forEach(([link, count]) => {
        linkClickData.push({
          id: link.substring(0, 30) + (link.length > 30 ? '...' : ''),
          label: link.substring(0, 30) + (link.length > 30 ? '...' : ''),
          value: count,
        });
      });
    }

    // Get device distribution
    const deviceData = [
      { id: 'Desktop', label: 'Desktop', value: Math.round(opened * 0.45) }, // Mock data
      { id: 'Mobile', label: 'Mobile', value: Math.round(opened * 0.40) },   // Mock data
      { id: 'Tablet', label: 'Tablet', value: Math.round(opened * 0.15) },   // Mock data
    ];

    return res.status(200).json({
      sent,
      delivered,
      opened,
      clicked,
      deliveryRate,
      openRate,
      clickRate,
      engagementData,
      linkClickData,
      deviceData,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to fetch campaign analytics' } });
  }
}

