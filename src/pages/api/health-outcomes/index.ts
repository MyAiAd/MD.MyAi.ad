// src/pages/api/health-outcomes/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { healthOutcomeSchema } from '@/lib/validations/analytics';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  switch (req.method) {
    case 'GET':
      return handleGetOutcomes(req, res, supabase, providerId);
    case 'POST':
      return handleCreateOutcome(req, res, supabase, providerId);
    default:
      return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
}

async function handleGetOutcomes(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string
) {
  try {
    // Get query parameters for filtering
    const { patientId, condition, startDate, endDate, page = '1', limit = '20' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Start building the query
    let query = supabase
      .from('health_outcomes')
      .select('*, patient:patient_id(first_name, last_name, email)', { count: 'exact' })
      .eq('provider_id', providerId)
      .order('measurement_date', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    // Apply filters if provided
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (condition) {
      query = query.eq('condition', condition);
    }

    if (startDate) {
      query = query.gte('measurement_date', startDate);
    }

    if (endDate) {
      query = query.lte('measurement_date', endDate);
    }

    // Execute the query
    const { data: outcomes, error, count } = await query;

    if (error) {
      throw error;
    }

    // Calculate total pages
    const totalPages = Math.ceil((count || 0) / limitNumber);

    return res.status(200).json({
      data: {
        outcomes,
        pagination: {
          total: count,
          page: pageNumber,
          limit: limitNumber,
          totalPages,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to retrieve health outcomes' } });
  }
}

async function handleCreateOutcome(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string
) {
  try {
    // Validate request body
    const validatedData = healthOutcomeSchema.parse({
      ...req.body,
      provider_id: providerId,
    });

    // Verify that the patient exists and belongs to the provider
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', validatedData.patient_id)
      .eq('provider_id', providerId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ error: { message: 'Patient not found or does not belong to this provider' } });
    }

    // Create health outcome in the database
    const { data: outcome, error } = await supabase
      .from('health_outcomes')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({ data: { outcome } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to create health outcome' } });
  }
}

