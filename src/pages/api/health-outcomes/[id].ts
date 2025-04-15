// src/pages/api/health-outcomes/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

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
  const outcomeId = req.query.id as string;

  switch (req.method) {
    case 'GET':
      return handleGetOutcome(req, res, supabase, providerId, outcomeId);
    case 'PUT':
      return handleUpdateOutcome(req, res, supabase, providerId, outcomeId);
    case 'DELETE':
      return handleDeleteOutcome(req, res, supabase, providerId, outcomeId);
    default:
      return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
}

async function handleGetOutcome(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string,
  outcomeId: string
) {
  try {
    // Retrieve the health outcome
    const { data: outcome, error } = await supabase
      .from('health_outcomes')
      .select('*, patient:patient_id(first_name, last_name, email)')
      .eq('id', outcomeId)
      .eq('provider_id', providerId)
      .single();

    if (error) {
      throw error;
    }

    if (!outcome) {
      return res.status(404).json({ error: { message: 'Health outcome not found' } });
    }

    return res.status(200).json({ data: { outcome } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to retrieve health outcome' } });
  }
}

async function handleUpdateOutcome(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string,
  outcomeId: string
) {
  try {
    // Validate request body
    const validatedData = healthOutcomeSchema.partial().parse({
      ...req.body,
      provider_id: providerId,
    });

    // Remove id and provider_id from the update data
    const { id, provider_id, ...updateData } = validatedData;

    // Update the health outcome
    const { data: outcome, error } = await supabase
      .from('health_outcomes')
      .update(updateData)
      .eq('id', outcomeId)
      .eq('provider_id', providerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!outcome) {
      return res.status(404).json({ error: { message: 'Health outcome not found' } });
    }

    return res.status(200).json({ data: { outcome } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to update health outcome' } });
  }
}

async function handleDeleteOutcome(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string,
  outcomeId: string
) {
  try {
    // Check if the health outcome exists and belongs to the provider
    const { data: outcome, error: fetchError } = await supabase
      .from('health_outcomes')
      .select('id')
      .eq('id', outcomeId)
      .eq('provider_id', providerId)
      .single();

    if (fetchError || !outcome) {
      return res.status(404).json({ error: { message: 'Health outcome not found' } });
    }

    // Delete the health outcome
    const { error: deleteError } = await supabase
      .from('health_outcomes')
      .delete()
      .eq('id', outcomeId)
      .eq('provider_id', providerId);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({ data: { message: 'Health outcome deleted successfully' } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to delete health outcome' } });
  }
}

