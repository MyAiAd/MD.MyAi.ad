// src/pages/api/health-outcomes/patient/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

interface HealthOutcome {
  condition: string;
  patient_id: string;
  provider_id: string;
  measurement_date: string;
  [key: string]: any; // For other properties that might exist in the outcome
}

interface GroupedOutcomes {
  [condition: string]: HealthOutcome[];
}

// Define timeline item types
interface TimelineItemBase {
  type: string;
  date: string;
}

interface HealthOutcomeTimelineItem extends TimelineItemBase {
  type: 'health_outcome';
  data: HealthOutcome;
}

interface NewsletterTimelineItem extends TimelineItemBase {
  type: 'newsletter';
  data: {
    campaignId: string;
    campaignName: string;
    opened: boolean;
    clicked: boolean;
    openTimestamp: string | null;
    targetConditions: string[];
  };
}

type TimelineItem = HealthOutcomeTimelineItem | NewsletterTimelineItem;

// Helper function to safely extract target conditions
function getTargetConditions(template: any): string[] {
  if (!template) {
    return [];
  }
  
  // If template is an array, get the first item
  if (Array.isArray(template)) {
    const firstTemplate = template[0];
    if (!firstTemplate) {
      return [];
    }
    
    // Check for target_conditions on the first template
    if (Array.isArray(firstTemplate.target_conditions)) {
      return firstTemplate.target_conditions;
    } else if (firstTemplate.target_conditions) {
      // If it's not an array but exists, convert to array
      return [firstTemplate.target_conditions.toString()];
    }
    return [];
  }
  
  // If template is an object
  if (Array.isArray(template.target_conditions)) {
    return template.target_conditions;
  } else if (template.target_conditions) {
    // If it's not an array but exists, convert to array
    return [template.target_conditions.toString()];
  }
  
  return [];
}

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
  const patientId = req.query.id as string;

  try {
    // Verify that the patient exists and belongs to the provider
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('provider_id', providerId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    // Get the patient's health outcomes
    const { data: outcomes, error } = await supabase
      .from('health_outcomes')
      .select('*')
      .eq('patient_id', patientId)
      .eq('provider_id', providerId)
      .order('measurement_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Group outcomes by condition
    const groupedOutcomes: GroupedOutcomes = {};
    
    outcomes.forEach((outcome: HealthOutcome) => {
      if (!groupedOutcomes[outcome.condition]) {
        groupedOutcomes[outcome.condition] = [];
      }
      
      groupedOutcomes[outcome.condition].push(outcome);
    });

    // Get newsletter engagement data
    const { data: engagementData, error: engagementError } = await supabase
      .from('newsletter_analytics')
      .select(`
        id,
        email_sent,
        email_delivered,
        email_opened,
        links_clicked,
        open_timestamp,
        campaign:campaign_id(
          id,
          name,
          scheduled_date,
          sent_date,
          template:template_id(
            id,
            name,
            target_conditions
          )
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (engagementError) {
      throw engagementError;
    }

    // Calculate engagement stats
    const totalCampaigns = engagementData?.length || 0;
    const openedCampaigns = engagementData?.filter(d => d.email_opened).length || 0;
    const clickedCampaigns = engagementData?.filter(d => d.links_clicked && d.links_clicked.length > 0).length || 0;
    
    const engagementStats = {
      totalCampaigns,
      openedCampaigns,
      clickedCampaigns,
      openRate: totalCampaigns > 0 ? (openedCampaigns / totalCampaigns) * 100 : 0,
      clickRate: openedCampaigns > 0 ? (clickedCampaigns / openedCampaigns) * 100 : 0,
    };

    // Create a timeline of health outcomes and newsletter engagements
    const timelineItems: TimelineItem[] = [];
    
    // Add health outcomes to timeline
    outcomes.forEach((outcome: HealthOutcome) => {
      timelineItems.push({
        type: 'health_outcome',
        date: outcome.measurement_date,
        data: outcome,
      });
    });
    
    // Add newsletter engagements to timeline
    if (engagementData && engagementData.length > 0) {
      engagementData.forEach((engagement) => {
        // Safely access campaign data with checks
        if (engagement && typeof engagement === 'object' && engagement.campaign) {
          // Check if campaign is an array
          if (Array.isArray(engagement.campaign)) {
            // Handle campaign as array
            const campaign = engagement.campaign[0]; // Get first item if it's an array
            if (campaign) {
              timelineItems.push({
                type: 'newsletter',
                date: campaign.sent_date || new Date().toISOString(),
                data: {
                  campaignId: campaign.id || '',
                  campaignName: campaign.name || '',
                  opened: !!engagement.email_opened,
                  clicked: !!(engagement.links_clicked && engagement.links_clicked.length > 0),
                  openTimestamp: engagement.open_timestamp || null,
                  targetConditions: getTargetConditions(campaign.template),
                },
              });
            }
          } else {
            // Handle campaign as object
            const campaign = engagement.campaign;
            timelineItems.push({
              type: 'newsletter',
              date: campaign.sent_date || new Date().toISOString(),
              data: {
                campaignId: campaign.id || '',
                campaignName: campaign.name || '',
                opened: !!engagement.email_opened,
                clicked: !!(engagement.links_clicked && engagement.links_clicked.length > 0),
                openTimestamp: engagement.open_timestamp || null,
                targetConditions: getTargetConditions(campaign.template),
              },
            });
          }
        }
      });
    }
    
    // Sort timeline by date descending
    timelineItems.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return res.status(200).json({
      patient,
      outcomes: groupedOutcomes,
      engagementStats,
      engagementHistory: engagementData,
      timeline: timelineItems,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to retrieve patient health outcomes' } });
  }
}
