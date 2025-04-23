// src/pages/api/patients/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { patientSchema } from '@/lib/validations/patient';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create authenticated Supabase client for the request
  const supabase = createServerSupabaseClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      return handleGetPatients(req, res, supabase, userId);
    case 'POST':
      return handleCreatePatient(req, res, supabase, userId);
    default:
      return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
}

async function handleGetPatients(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string
) {
  try {
    // Get query parameters for pagination and filtering
    const { page = '1', limit = '10', search, condition } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Start building the query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Add condition filter if provided
    if (condition) {
      query = query.contains('health_conditions', [condition]);
    }

    // Execute the query
    const { data: patients, error, count } = await query;

    if (error) {
      throw error;
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({
      data: {
        patients,
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
    return res.status(500).json({ error: { message: 'Failed to retrieve patients' } });
  }
}

async function handleCreatePatient(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string
) {
  try {
    // Validate request body
    const validatedData = patientSchema.parse({
      ...req.body,
      provider_id: providerId,
    });

    // Create patient in the database
    const { data: patient, error } = await supabase
      .from('patients')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({ data: { patient } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to create patient' } });
  }
}
