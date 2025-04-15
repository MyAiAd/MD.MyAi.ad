// src/pages/api/admin/dashboard.ts
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

  try {
    // Fetch dashboard stats
    const [
      patientsResult,
      templatesResult,
      campaignsResult,
      analyticsResult,
      recentActivityResult,
    ] = await Promise.all([
      // Total patients
      supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId),
      
      // Active templates
      supabase
        .from('newsletter_templates')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('is_active', true),
      
      // Campaigns sent
      supabase
        .from('newsletter_campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .eq('status', 'sent'),
      
      // Campaign analytics for open rate
      supabase
        .from('newsletter_analytics')
        .select(`
          email_sent,
          email_opened,
          campaign:newsletter_campaigns(
            id,
            provider_id
          )
        `)
        .eq('campaign.provider_id', providerId),
      
      // Recent activity
      supabase
        .from('newsletter_campaigns')
        .select('id, name, status, sent_date, created_at')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate analytics
    const totalSent = analyticsResult.data?.filter(a => a.email_sent).length || 0;
    const totalOpened = analyticsResult.data?.filter(a => a.email_opened).length || 0;
    const avgOpenRate = totalSent > 0 ? `${Math.round((totalOpened / totalSent) * 100)}%` : '0%';

    // Format recent activity
    const recentActivity = recentActivityResult.data?.map(campaign => {
      let message = '';
      const date = new Date(campaign.created_at).toLocaleDateString();
      
      switch (campaign.status) {
        case 'draft':
          message = `Campaign "${campaign.name}" created as draft`;
          break;
        case 'scheduled':
          message = `Campaign "${campaign.name}" scheduled for sending`;
          break;
        case 'sending':
          message = `Campaign "${campaign.name}" is currently being sent`;
          break;
        case 'sent':
          message = `Campaign "${campaign.name}" was successfully sent`;
          break;
        default:
          message = `Campaign "${campaign.name}" status updated to ${campaign.status}`;
      }
      
      return { date, message };
    }) || [];

    // Get engagement data for chart
    const engagementData = await getEngagementData(supabase, providerId);

    return res.status(200).json({
      stats: {
        totalPatients: patientsResult.count || 0,
        activeTemplates: templatesResult.count || 0,
        campaignsSent: campaignsResult.count || 0,
        avgOpenRate,
      },
      recentActivity,
      engagementData,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch dashboard data' } });
  }
}

async function getEngagementData(supabase, providerId) {
  // Fetch the last 5 campaigns
  const { data: campaigns } = await supabase
    .from('newsletter_campaigns')
    .select('id, name')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (!campaigns || campaigns.length === 0) {
    return null;
  }
  
  // Fetch analytics for these campaigns
  const engagementData = [];
  
  for (const campaign of campaigns) {
    const { data: analytics } = await supabase
      .from('newsletter_analytics')
      .select('email_opened, links_clicked')
      .eq('campaign_id', campaign.id);
    
    const opens = analytics?.filter(a => a.email_opened).length || 0;
    const clicks = analytics?.filter(a => a.links_clicked && a.links_clicked.length > 0).length || 0;
    
    engagementData.push({
      campaign: campaign.name,
      opens,
      clicks,
    });
  }
  
  return engagementData.reverse(); // Reverse to show oldest to newest
}
