// src/pages/api/patients/bulk-import.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { bulkPatientImportSchema } from '@/lib/validations/patient';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
    // Get the provider's subscription details
    const { data: provider, error: providerError } = await supabase
      .from('healthcare_providers')
      .select('subscription_tier, max_patients')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return res.status(400).json({ error: { message: 'Provider information not found' } });
    }

    // Get current patient count
    const { count: currentPatientCount, error: countError } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId);

    if (countError) {
      throw countError;
    }

    // Validate and prepare patient data
    const patients = req.body.map((patient: any) => ({
      ...patient,
      provider_id: providerId,
    }));

    // Check if import would exceed the patient limit
    const totalAfterImport = currentPatientCount + patients.length;
    if (totalAfterImport > provider.max_patients) {
      return res.status(400).json({
        error: {
          message: `Patient limit exceeded. Your plan allows ${provider.max_patients} patients. You currently have ${currentPatientCount} patients and are trying to import ${patients.length} more.`,
        },
      });
    }

    // Validate all patients
    const validatedPatients = bulkPatientImportSchema.parse(patients);

    // Insert patients in batches to avoid hitting database limits
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < validatedPatients.length; i += batchSize) {
      const batch = validatedPatients.slice(i, i + batchSize);
      batches.push(batch);
    }

    // Process each batch
    const results = [];
    for (const batch of batches) {
      const { data, error } = await supabase.from('patients').insert(batch).select();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        results.push(...data);
      }
    }

    return res.status(201).json({
      data: {
        message: `${results.length} patients imported successfully`,
        imported: results.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to import patients' } });
  }
}
