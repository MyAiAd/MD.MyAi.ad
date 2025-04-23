// src/pages/api/newsletters/templates/send-test.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { sendEmail } from '../../../../lib/email-service';
import { EmailFormat } from '../../../../lib/email-renderer';

interface SendTestEmailRequest {
  templateId: string;
  recipientEmail: string;
  templateContent: string;
  templateType: EmailFormat;
  testData?: Record<string, any>;
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
    const { 
      templateId, 
      recipientEmail, 
      templateContent, 
      templateType,
      testData = {} 
    } = req.body as SendTestEmailRequest;

    if (!templateId || !recipientEmail || !templateContent || !templateType) {
      return res.status(400).json({ 
        error: 'Missing required fields: templateId, recipientEmail, templateContent, templateType' 
      });
    }

    // Get the template details from the database
    const { data: template, error: templateError } = await supabase
      .from('newsletter_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get the provider details
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('name, email, logo_url')
      .eq('id', session.user.id)
      .single();

    if (providerError) {
      console.error('Error fetching provider:', providerError);
      // Continue anyway with default values
    }

    // Merge in test data with some defaults
    const mergedTestData = {
      patientName: 'John Smith',
      patientFirstName: 'John',
      providerName: provider?.name || 'Your Healthcare Provider',
      providerLogo: provider?.logo_url,
      unsubscribeUrl: 'https://example.com/unsubscribe',
      currentDate: new Date().toLocaleDateString(),
      ...testData,
    };

    // Send the test email
    const result = await sendEmail({
      subject: `[TEST] ${template.name}`,
      from: {
        email: provider?.email || process.env.DEFAULT_SENDER_EMAIL || 'test@healthcarenewsletter.com',
        name: provider?.name || 'Healthcare Newsletter Platform',
      },
      to: [{ email: recipientEmail }],
      template: templateContent,
      templateFormat: templateType,
      templateData: mergedTestData,
      headers: {
        'X-Healthcare-Newsletter-Test': 'true',
        'X-Template-ID': templateId,
      },
    });

    // Return success response
    return res.status(200).json({ 
      success: true, 
      messageId: result.messageId,
      message: `Test email sent to ${recipientEmail}` 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      error: 'Failed to send test email', 
      message: (error as Error).message 
    });
  }
}
