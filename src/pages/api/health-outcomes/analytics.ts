// src/pages/api/health-outcomes/analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Define interfaces for better type safety
interface HealthOutcome {
  condition: string;
  measurement_type: string;
  measurement_value: number;
  measurement_date: string;
  notes?: string | null;
  [key: string]: any;
}

interface GroupData {
  condition: string;
  measurementType: string;
  measurements: Array<{
    value: number;
    date: string;
    notes?: string | null;
  }>;
  [key: string]: any;
}

// Interface for grouped data with string index signature
interface GroupedDataMap {
  [key: string]: GroupData;
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
  
  // For patient-specific analytics
  const patientId = req.query.patientId as string;
  
  try {
    // Depending on if patientId is provided, get health outcomes for a specific patient or all for the provider
    const query = supabase
      .from('health_outcomes')
      .select('*');
      
    if (patientId) {
      query.eq('patient_id', patientId);
    }
    
    query.eq('provider_id', providerId);
    
    const { data: outcomes, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Group outcomes by condition and measurement type
    const groupedData: GroupedDataMap = {};
    
    if (outcomes && outcomes.length > 0) {
      outcomes.forEach((outcome: HealthOutcome) => {
        const key = `${outcome.condition}-${outcome.measurement_type}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            condition: outcome.condition,
            measurementType: outcome.measurement_type,
            measurements: []
          };
        }
        
        groupedData[key].measurements.push({
          value: outcome.measurement_value,
          date: outcome.measurement_date,
          notes: outcome.notes
        });
      });
    }
    
    // Convert to array for frontend consumption
    const analyticsData = Object.values(groupedData).map(group => ({
      ...group,
      // Sort measurements by date
      measurements: group.measurements.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }));
    
    return res.status(200).json({ data: { analytics: analyticsData } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to fetch health analytics' } });
  }
}
