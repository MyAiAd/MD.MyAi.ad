// src/pages/api/campaigns/[id]/target-count.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Define interfaces for better type safety
interface Patient {
  health_conditions?: string[];
  medications?: string[];
  dietary_restrictions?: string[];
  [key: string]: any;
}

interface Template {
  target_conditions?: string[];
  target_medications?: string[];
  target_dietary?: string[];
  [key: string]: any;
}

interface Campaign {
  template: Template;
  [key: string]: any;
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
  const campaignId = req.query.id as string;

  try {
    // Verify the campaign exists and belongs to the provider
    const { data: campaign, error } = await supabase
      .from('newsletter_campaigns')
      .select('*, template:template_id(*)')
      .eq('id', campaignId)
      .eq('provider_id', providerId)
      .single();

    if (error || !campaign) {
      return res.status(404).json({ error: { message: 'Campaign not found' } });
    }

    // Get all patients for this provider with active consent
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .eq('provider_id', providerId)
      .eq('consent_status', 'active');

    if (patientsError) {
      throw patientsError;
    }

    // Filter patients based on template targeting criteria
    let targetPatients = patients || [];
    const template = campaign.template as Template;

    if (template.target_conditions?.length || template.target_medications?.length || template.target_dietary?.length) {
      targetPatients = targetPatients.filter((patient: Patient) => {
        // Check if patient matches any conditions
        if (template.target_conditions?.length && patient.health_conditions) {
          const hasMatchingCondition = template.target_conditions.some((condition: string) =>
            patient.health_conditions?.includes(condition)
          );
          if (hasMatchingCondition) return true;
        }
        
        // Check if patient matches any medications
        if (template.target_medications?.length && patient.medications) {
          const hasMatchingMedication = template.target_medications.some((medication: string) =>
            patient.medications?.includes(medication)
          );
          if (hasMatchingMedication) return true;
        }
        
        // Check if patient matches any dietary restrictions
        if (template.target_dietary?.length && patient.dietary_restrictions) {
          const hasMatchingDietary = template.target_dietary.some((dietary: string) =>
            patient.dietary_restrictions?.includes(dietary)
          );
          if (hasMatchingDietary) return true;
        }
        
        // If no matches found, exclude patient
        return false;
      });
    }

    return res.status(200).json({
      count: targetPatients.length,
      hasTargeting: !!(
        template.target_conditions?.length ||
        template.target_medications?.length ||
        template.target_dietary?.length
      ),
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to fetch target patient count' } });
  }
}
