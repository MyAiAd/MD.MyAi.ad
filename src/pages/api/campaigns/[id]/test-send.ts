// src/pages/api/campaigns/[id]/test-send.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import EmailRenderer from '@/lib/email-renderer';
import { PrismaClient } from '@prisma/client';

interface Provider {
  id: string;
  name: string;
  custom_domain?: string;
  [key: string]: any;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  health_conditions: string[];
  medications: string[];
  dietary_restrictions: string[];
  health_metrics: {
    a1c: number;
    blood_glucose: number;
    blood_pressure: string;
  };
  next_appointment: string;
  provider_id: string;
  [key: string]: any;
}

interface Campaign {
  id: string;
  template_id: string;
  subject?: string;
  provider_id: string;
  template: {
    type: string;
    [key: string]: any;
  };
  [key: string]: any;
}

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
  const campaignId = req.query.id as string;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: { message: 'Email address is required' } });
  }

  try {
    // Verify the campaign exists and belongs to the provider
    const { data: campaign, error } = await supabase
      .from('newsletter_campaigns')
      .select('*, template:template_id(*)')
      .eq('id', campaignId)
      .eq('provider_id', providerId)
      .single();

    if (error || !campaign) {
      return res.status(404).json({ error: { message: 'Campaign not found' } });
    }

    // Get provider data
    const { data: provider, error: providerError } = await supabase
      .from('healthcare_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return res.status(400).json({ error: { message: 'Provider information not found' } });
    }

    // Create mock patient data for the test send
    const mockPatient: Patient = {
      id: 'test-patient',
      first_name: 'Test',
      last_name: 'Patient',
      email: email,
      health_conditions: ['diabetes', 'hypertension'],
      medications: ['metformin', 'lisinopril'],
      dietary_restrictions: ['gluten-free'],
      health_metrics: {
        a1c: 6.5,
        blood_glucose: 120,
        blood_pressure: '120/80',
      },
      next_appointment: 'January 15, 2023 at 2:00 PM',
      provider_id: providerId,
    };

    // Initialize Prisma client
    const prisma = new PrismaClient();
    
    // Create email renderer
    const emailRenderer = new EmailRenderer(prisma);
    
    // Determine template type from the campaign template
    const templateType = campaign.template.type as any; // This may need to be adjusted based on your schema
    
    // Generate personalized newsletter using the EmailRenderer
    const htmlContent = await emailRenderer.renderTemplate(
      templateType,
      {
        patient: mockPatient,
        provider: provider as Provider,
        campaign
      }
    );

    // Send the test email
    // In a real implementation, uncomment this and use your email service
    /*
    await sendEmail({
      to: email,
      from: `${provider.name} <health@${provider.custom_domain || 'example.com'}>`,
      subject: campaign.subject || 'Test Newsletter',
      html: htmlContent,
    });
    */
    
    // For now, just log the send and return success
    console.log(`Test email would be sent to ${email}`);

    // Close Prisma client
    await prisma.$disconnect();

    return res.status(200).json({
      success: true,
      message: `Test email sent to ${email}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(500).json({ error: { message: 'Failed to send test email' } });
  }
}
