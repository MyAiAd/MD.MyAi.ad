// src/pages/api/patients/import.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { parse } from 'papaparse';
import { bulkPatientImportSchema } from '@/lib/validations/patient';
import { z } from 'zod';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { promisify } from 'util';

// Disable bodyParser to handle the form data
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse the incoming form data
    const form = new IncomingForm();
    const readFile = promisify(fs.readFile);
    
    // Parse the form
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });
    
    if (!files.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }
    
    // Read the file
    const fileContent = await readFile(files.file.path, { encoding: 'utf8' });
    
    // Parse CSV
    const { data, errors } = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: { 
          message: 'CSV parsing error', 
          details: errors 
        } 
      });
    }
    
    // Process the data
    const patients = data.map((row: any) => {
      // Transform array fields (split by semicolon)
      const healthConditions = row.health_conditions ? 
        row.health_conditions.split(';').map((s: string) => s.trim()) : [];
      
      const medications = row.medications ? 
        row.medications.split(';').map((s: string) => s.trim()) : [];
      
      const dietaryRestrictions = row.dietary_restrictions ? 
        row.dietary_restrictions.split(';').map((s: string) => s.trim()) : [];
      
      return {
        provider_id: providerId,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        date_of_birth: row.date_of_birth || null,
        health_conditions: healthConditions,
        medications: medications,
        dietary_restrictions: dietaryRestrictions,
        consent_status: row.consent_status || 'pending',
        consent_date: row.consent_date || null,
        preferred_frequency: row.preferred_frequency || null,
      };
    });

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
    try {
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
        importedCount: results.length,
        message: `${results.length} patients imported successfully`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: { 
            message: 'Validation failed', 
            details: error.errors 
          } 
        });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to import patients' } });
  }
} {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to queue campaign' } });
  }
}

