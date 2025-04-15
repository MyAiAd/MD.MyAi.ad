// src/pages/api/newsletters/templates/preview-mjml.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { renderMJMLMarkup } from '../../../../lib/mjml-renderer';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

interface PreviewMJMLRequest {
  mjmlContent: string;
  templateData?: Record<string, any>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Parse request body
    const { mjmlContent, templateData = {} } = req.body as PreviewMJMLRequest;

    if (!mjmlContent) {
      return res.status(400).json({ error: 'MJML content is required' });
    }

    // Render MJML to HTML
    const html = renderMJMLMarkup(mjmlContent);

    // Return rendered HTML
    return res.status(200).json({ html });
  } catch (error) {
    console.error('Error previewing MJML template:', error);
    return res.status(500).json({ 
      error: 'Failed to render MJML', 
      message: (error as Error).message 
    });
  }
}
