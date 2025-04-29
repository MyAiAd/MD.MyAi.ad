// src/pages/api/health-outcomes/bulk-import.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { parse } from 'papaparse';
import { z } from 'zod';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { promisify } from 'util';

// Outcome import schema
const bulkOutcomeImportSchema = z.array(
  z.object({
    patient_id: z.string().uuid('Invalid patient ID'),
    condition: z.string().min(1, 'Condition is required'),
    measurement_type: z.string().min(1, 'Measurement type is required'),
    measurement_value: z.number(),
    measurement_date: z.string(),
    notes: z.string().optional().nullable(),
  })
);

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
    const outcomes = data.map((row: any) => ({
      patient_id: row.patient_id,
      condition: row.condition,
      measurement_type: row.measurement_type,
      measurement_value: parseFloat(row.measurement_value),
      measurement_date: row.measurement_date,
      notes: row.notes || null,
    }));

    // Verify all patients belong to the provider
    // Create a unique array of patient IDs without using Set spread (to support older JS targets)
    const patientIdMap: { [key: string]: boolean } = {};
    outcomes.forEach(outcome => {
      patientIdMap[outcome.patient_id] = true;
    });
    const patientIds = Object.keys(patientIdMap);
    
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .in('id', patientIds)
      .eq('provider_id', providerId);
    
    if (patientError) {
      throw patientError;
    }
    
    const validPatientIds = patients.map(p => p.id);
    
    // Filter out outcomes for patients that don't belong to the provider
    const validOutcomes = outcomes.filter(outcome => 
      validPatientIds.includes(outcome.patient_id)
    );
    
    if (validOutcomes.length < outcomes.length) {
      console.warn(`Filtered out ${outcomes.length - validOutcomes.length} outcomes for patients that don't belong to this provider`);
    }
    
    if (validOutcomes.length === 0) {
      return res.status(400).json({ 
        error: { 
          message: 'No valid outcomes to import. Ensure all patients belong to you.' 
        } 
      });
    }

    // Validate all outcomes
    try {
      const validatedOutcomes = bulkOutcomeImportSchema.parse(validOutcomes);
      
      // Add provider_id to each outcome
      const outcomesWithProviderId = validatedOutcomes.map(outcome => ({
        ...outcome,
        provider_id: providerId,
      }));
      
      // Insert outcomes in batches to avoid hitting database limits
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < outcomesWithProviderId.length; i += batchSize) {
        const batch = outcomesWithProviderId.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      // Process each batch
      const results = [];
      for (const batch of batches) {
        const { data, error } = await supabase.from('health_outcomes').insert(batch).select();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          results.push(...data);
        }
      }
      
      return res.status(201).json({
        importedCount: results.length,
        message: `${results.length} health outcomes imported successfully`,
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
    return res.status(500).json({ error: { message: 'Failed to import health outcomes' } });
  }
}
