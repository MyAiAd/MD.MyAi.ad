// src/pages/api/patients/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { patientUpdateSchema } from '@/lib/validations/patient';
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
  const patientId = req.query.id as string;

  switch (req.method) {
    case 'GET':
      return handleGetPatient(req, res, supabase, providerId, patientId);
    case 'PUT':
      return handleUpdatePatient(req, res, supabase, providerId, patientId);
    case 'DELETE':
      return handleDeletePatient(req, res, supabase, providerId, patientId);
    default:
      return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
}

async function handleGetPatient(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string,
  patientId: string
) {
  try {
    // Retrieve the patient
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('provider_id', providerId)
      .single();

    if (error) {
      throw error;
    }

    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    return res.status(200).json({ data: { patient } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to retrieve patient' } });
  }
}

async function handleUpdatePatient(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string,
  patientId: string
) {
  try {
    // Validate request body
    const validatedData = patientUpdateSchema.parse({
      ...req.body,
      id: patientId,
    });

    // Remove id from the data to be updated
    const { id, ...updateData } = validatedData;

    // Update the patient
    const { data: patient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', patientId)
      .eq('provider_id', providerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    return res.status(200).json({ data: { patient } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to update patient' } });
  }
}

async function handleDeletePatient(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string,
  patientId: string
) {
  try {
    // Check if the patient exists and belongs to the provider
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('provider_id', providerId)
      .single();

    if (fetchError || !patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    // Delete the patient
    const { error: deleteError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)
      .eq('provider_id', providerId);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({ data: { message: 'Patient deleted successfully' } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to delete patient' } });
  }
}
