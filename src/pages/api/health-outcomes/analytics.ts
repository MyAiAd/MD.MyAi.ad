// src/pages/api/health-outcomes/analytics.ts
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
  const { patientId, condition, timeframe = '6m' } = req.query;

  try {
    // Calculate the start date based on the timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(now.getMonth() - 6); // Default to 6 months
    }

    // Build query based on filters
    let query = supabase
      .from('health_outcomes')
      .select('*')
      .eq('provider_id', providerId)
      .gte('measurement_date', startDate.toISOString())
      .order('measurement_date', { ascending: true });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (condition) {
      query = query.eq('condition', condition);
    }

    // Execute the query
    const { data: outcomes, error } = await query;

    if (error) {
      throw error;
    }

    // Process the outcomes data for visualization
    // Group by condition and measurement type
    const groupedData = {};
    
    outcomes.forEach(outcome => {
      const key = `${outcome.condition}-${outcome.measurement_type}`;
      
      if (!groupedData[key]) {
        groupedData[key] = {
          condition: outcome.condition,
          measurementType: outcome.measurement_type,
          data: [],
        };
      }
      
      groupedData[key].data.push({
        date: outcome.measurement_date,
        value: outcome.measurement_value,
      });
    });

    // Convert to array
    const trendsData = Object.values(groupedData);

    // Get overall statistics
    const statistics = {};
    
    trendsData.forEach(trend => {
      const key = `${trend.condition}-${trend.measurementType}`;
      const values = trend.data.map(d => d.value);
      
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const latest = trend.data[trend.data.length - 1].value;
        const first = trend.data[0].value;
        const change = latest - first;
        const percentChange = first !== 0 ? (change / first) * 100 : 0;
        
        statistics[key] = {
          condition: trend.condition,
          measurementType: trend.measurementType,
          average: avg,
          minimum: min,
          maximum: max,
          latest,
          change,
          percentChange,
        };
      }
    });

    // Get newsletter engagement correlation
    // This would typically involve more complex analysis with campaign data
    // For demonstration, we'll just create mock correlation data
    const correlations = [];
    
    if (trendsData.length > 0 && patientId) {
      // Fetch patient's newsletter engagement
      const { data: analytics, error: analyticsError } = await supabase
        .from('newsletter_analytics')
        .select(`
          email_opened,
          campaign:campaign_id(
            id,
            name,
            sent_date
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });
        
      if (analyticsError) {
        throw analyticsError;
      }
      
      // Calculate engagement rate over time
      const engagementByMonth = {};
      
      analytics.forEach(record => {
        if (record.campaign && record.campaign.sent_date) {
          const date = new Date(record.campaign.sent_date);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          
          if (!engagementByMonth[monthKey]) {
            engagementByMonth[monthKey] = {
              total: 0,
              opened: 0,
              date,
            };
          }
          
          engagementByMonth[monthKey].total++;
          if (record.email_opened) {
            engagementByMonth[monthKey].opened++;
          }
        }
      });
      
      // Calculate engagement rates and match with health outcomes
      const engagementRates = Object.values(engagementByMonth).map(month => ({
        date: month.date,
        rate: month.total > 0 ? (month.opened / month.total) * 100 : 0,
      }));
      
      // For each trend, try to find correlation with engagement
      trendsData.forEach(trend => {
        // This is a simplified mock correlation analysis
        // In a real application, this would use more sophisticated statistical methods
        const mockCorrelation = Math.random() * 0.8 - 0.4; // Random value between -0.4 and 0.4
        
        correlations.push({
          condition: trend.condition,
          measurementType: trend.measurementType,
          correlation: mockCorrelation,
          interpretation: interpretCorrelation(mockCorrelation),
        });
      });
    }

    return res.status(200).json({
      trendsData,
      statistics,
      correlations,
      timeframe,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to retrieve health outcome analytics' } });
  }
}

// Helper function to interpret correlation values
function interpretCorrelation(correlation: number): string {
  const absCorrelation = Math.abs(correlation);
  
  if (absCorrelation < 0.1) {
    return 'No meaningful correlation';
  } else if (absCorrelation < 0.3) {
    return correlation > 0 
      ? 'Weak positive correlation: slight improvement with engagement' 
      : 'Weak negative correlation: slight decline with engagement';
  } else if (absCorrelation < 0.5) {
    return correlation > 0 
      ? 'Moderate positive correlation: noticeable improvement with engagement' 
      : 'Moderate negative correlation: noticeable decline with engagement';
  } else if (absCorrelation < 0.7) {
    return correlation > 0 
      ? 'Strong positive correlation: significant improvement with engagement' 
      : 'Strong negative correlation: significant decline with engagement';
  } else {
    return correlation > 0 
      ? 'Very strong positive correlation: substantial improvement with engagement' 
      : 'Very strong negative correlation: substantial decline with engagement';
  }
}

