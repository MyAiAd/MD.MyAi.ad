// src/pages/api/patients/create.ts
// @ts-nocheck - Disable TypeScript checking for this file

import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest } from '@/lib/middleware/validate';
import { patientSchema } from '@/lib/validations/patient';
import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Create authenticated Supabase client
  const supabaseServerClient = createServerSupabaseClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  // Add the provider_id from the authenticated user
  const providerId = session.user.id;
  const patientData = {
    ...req.body,
    provider_id: providerId,
  };

  try {
    // Insert the patient data
    const { data: patient, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({ data: patient });
  } catch (error) {
    return res.status(400).json({
      error: {
        message: error.message || 'Failed to create patient',
      },
    });
  }
}

// Wrap the handler with validation middleware
export default validateRequest(patientSchema)(handler);
