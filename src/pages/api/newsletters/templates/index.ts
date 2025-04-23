// src/pages/api/newsletters/templates/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { newsletterTemplateSchema } from '@/lib/validations/newsletter';
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
      return handleGetTemplates(req, res, supabase, providerId);
    case 'POST':
      return handleCreateTemplate(req, res, supabase, providerId);
    default:
      return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
}

async function handleGetTemplates(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string
) {
  try {
    // Get query parameters for pagination
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Retrieve templates with pagination
    const { data: templates, error, count } = await supabase
      .from('newsletter_templates')
      .select('*', { count: 'exact' })
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    if (error) {
      throw error;
    }

    // Calculate total pages
    const totalPages = Math.ceil((count || 0) / limitNumber);

    return res.status(200).json({
      data: {
        templates,
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
    return res.status(500).json({ error: { message: 'Failed to retrieve templates' } });
  }
}

async function handleCreateTemplate(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  providerId: string
) {
  try {
    // Validate request body
    const validatedData = newsletterTemplateSchema.parse({
      ...req.body,
      provider_id: providerId,
    });

    // Create template in the database
    const { data: template, error } = await supabase
      .from('newsletter_templates')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({ data: { template } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Failed to create template' } });
  }
}
