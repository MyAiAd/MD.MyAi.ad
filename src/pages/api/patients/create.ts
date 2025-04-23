// Example API route using validation middleware
// src/pages/api/patients/create.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest } from '@/lib/middleware/validate';
import { patientSchema } from '@/lib/validations/patient';
import { supabase } from '@/lib/supabase';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({ data: patient });
  } catch (error: any) {
    return res.status(400).json({
      error: {
        message: error.message || 'Failed to create patient',
      },
    });
  }
}

export default validateRequest(patientSchema)(handler);



