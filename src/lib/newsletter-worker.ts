// src/lib/newsletter-worker.ts
/**
 * Newsletter Worker
 * 
 * This module processes the newsletter delivery queue, personalizes content
 * for each patient, and sends emails using Amazon SES. It runs as a background process to
 * ensure reliable delivery and prevent API timeout issues when sending
 * to large patient groups.
 */

import { supabase } from '@/lib/supabase';
import { getRedisClient, redisKeys, completeNewsletterJob, failNewsletterJob } from './redis';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize the SES client
const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function startNewsletterWorker(intervalMs: number = 5000) {
  // Process jobs at the specified interval
  setInterval(processNewsletterQueue, intervalMs);
  console.log('Newsletter worker started with Amazon SES integration');
}

async function processNewsletterQueue() {
  const redis = await getRedisClient();
  
  // Check if there are jobs to process
  const queueLength = await redis.lLen(redisKeys.newsletterQueue);
  if (queueLength === 0) return;
  
  // Move a job from the queue to processing
  const jobData = await redis.brPopLPush(
    redisKeys.newsletterQueue,
    redisKeys.newsletterProcessing,
    5 // Timeout in seconds
  );
  if (!jobData) return;
  
  try {
    const job = JSON.parse(jobData);
    
    // Process the newsletter job with detailed steps
    await processNewsletterJob(job);
    
    // Mark job as completed in Redis
    await completeNewsletterJob(job.id);
  } catch (error) {
    console.error('Error processing newsletter job:', error);
    try {
      const job = JSON.parse(jobData);
      await failNewsletterJob(job.id, error instanceof Error ? error.message : 'Unknown error');
    } catch (parseError) {
      console.error('Failed to parse job data:', parseError);
    }
  }
}

async function processNewsletterJob(job: any) {
  const redis = await getRedisClient();
  const { campaignData } = job;
  const campaignId = campaignData.campaignId;
  
  // 1. Fetch campaign details (including template and provider IDs)
  const { data: campaign, error: campaignError } = await supabase
    .from('newsletter_campaigns')
    .select('*, template_id, provider_id, subject')
    .eq('id', campaignId)
    .single();
  if (campaignError || !campaign) {
    throw new Error(`Campaign not found: ${campaignError?.message || 'Unknown error'}`);
  }
  
  // 2. Fetch provider details
  const { data: provider, error: providerError } = await supabase
    .from('healthcare_providers')
    .select('*')
    .eq('id', campaign.provider_id)
    .single();
  if (providerError || !provider) {
    throw new Error(`Provider not found: ${providerError?.message || 'Unknown error'}`);
  }
  
  // 3. Fetch newsletter template details
  const { data: template, error: templateError } = await supabase
    .from('newsletter_templates')
    .select('*')
    .eq('id', campaign.template_id)
    .single();
  if (templateError || !template) {
    throw new Error(`Template not found: ${templateError?.message || 'Unknown error'}`);
  }
  
  // 4. Fetch target patients with active consent
  const { data: allPatients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .eq('provider_id', campaign.provider_id)
    .eq('consent_status', 'active');
  if (patientsError) {
    throw new Error(`Failed to retrieve patients: ${patientsError.message}`);
  }
  
  // Filter patients based on targeting criteria
  const patients = filterPatientsByTargetingCriteria(allPatients, template);
  
  // 5. Update campaign with target patient count and status "sending"
  await supabase
    .from('newsletter_campaigns')
    .update({ 
      target_patient_count: patients.length,
      status: 'sending',
    })
    .eq('id', campaign.id);
  
  // 6. Process each patient: personalize and send the newsletter
  let sentCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    try {
      // Update progress in Redis
      const progress = Math.round(((i + 1) / patients.length) * 100);
      await redis.set(`job:${job.id}:progress`, progress);
      
      // Generate personalized content by processing the template's content blocks.
      const personalizedBlocks = await personalizeNewsletterContent(template, patient);
      const htmlContent = personalizedBlocks.join('');
      
      // Send the email using Amazon SES
      await sendEmailWithSES({
        to: patient.email,
        from: `${provider.name} <health@${provider.custom_domain || 'example.com'}>`,
        subject: campaign.subject,
        html: htmlContent,
      });
      
      // Record successful delivery in analytics
      await supabase
        .from('newsletter_analytics')
        .insert({
          campaign_id: campaign.id,
          patient_id: patient.id,
          email_sent: true,
          email_delivered: true,
        });
      
      sentCount++;
    } catch (error) {
      console.error(`Error sending newsletter to ${patient.email}:`, error);
      
      // Record failed delivery in analytics
      await supabase
        .from('newsletter_analytics')
        .insert({
          campaign_id: campaign.id,
          patient_id: patient.id,
          email_sent: false,
          email_delivered: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      
      errorCount++;
    }
  }
  
  // 7. Update campaign status to "sent" and record send count and timestamp
  await supabase
    .from('newsletter_campaigns')
    .update({
      status: 'sent',
      sent_date: new Date().toISOString(),
      actual_send_count: sentCount,
    })
    .eq('id', campaign.id);
  
  // Store completion data in Redis
  await redis.set(`job:${job.id}:completed`, JSON.stringify({
    campaignId: campaign.id,
    sentCount,
    errorCount,
    completedAt: new Date().toISOString(),
  }));
  
  return { sentCount, errorCount };
}

// Helper function to filter patients based on targeting criteria from the template
function filterPatientsByTargetingCriteria(patients: any[], template: any): any[] {
  if (
    !template.target_conditions?.length && 
    !template.target_medications?.length && 
    !template.target_dietary?.length
  ) {
    return patients;
  }
  
  return patients.filter(patient => {
    // Check conditions
    if (template.target_conditions?.length && patient.health_conditions) {
      const hasMatchingCondition = template.target_conditions.some((condition: string) =>
        patient.health_conditions.includes(condition)
      );
      if (hasMatchingCondition) return true;
    }
    // Check medications
    if (template.target_medications?.length && patient.medications) {
      const hasMatchingMedication = template.target_medications.some((medication: string) =>
        patient.medications.includes(medication)
      );
      if (hasMatchingMedication) return true;
    }
    // Check dietary restrictions
    if (template.target_dietary?.length && patient.dietary_restrictions) {
      const hasMatchingDietary = template.target_dietary.some((dietary: string) =>
        patient.dietary_restrictions.includes(dietary)
      );
      if (hasMatchingDietary) return true;
    }
    return false;
  });
}

// Helper function to personalize newsletter content based on patient data.
async function personalizeNewsletterContent(template: any, patient: any): Promise<any[]> {
  let content = JSON.parse(JSON.stringify(template.content)); // Deep clone
  
  content = content.map((block: any) => {
    // Skip blocks with condition requirements the patient doesn't meet
    if (block.conditions && block.conditions.length > 0) {
      const patientHasCondition = block.conditions.some((condition: string) => 
        patient.health_conditions && patient.health_conditions.includes(condition)
      );
      if (!patientHasCondition) {
        return null;
      }
    }
    // Skip blocks with medication requirements the patient doesn't meet
    if (block.medications && block.medications.length > 0) {
      const patientHasMedication = block.medications.some((medication: string) => 
        patient.medications && patient.medications.includes(medication)
      );
      if (!patientHasMedication) {
        return null;
      }
    }
    // Skip blocks with dietary requirements the patient doesn't meet
    if (block.dietary && block.dietary.length > 0) {
      const patientHasDietary = block.dietary.some((dietary: string) => 
        patient.dietary_restrictions && patient.dietary_restrictions.includes(dietary)
      );
      if (!patientHasDietary) {
        return null;
      }
    }
    // Replace placeholders for text blocks
    if (block.type === 'text' && typeof block.content.text === 'string') {
      block.content.text = replacePlaceholders(block.content.text, patient);
    }
    // Process health-info blocks for personalization
    if (block.type === 'health-info') {
      block = personalizeHealthInfoBlock(block, patient);
    }
    return block;
  });
  
  // Remove blocks that didn't pass the criteria
  content = content.filter(Boolean);
  
  return content;
}

// Helper to replace placeholders with patient data
function replacePlaceholders(text: string, patient: any): string {
  text = text.replace(/\{first_name\}/g, patient.first_name || '');
  text = text.replace(/\{last_name\}/g, patient.last_name || '');
  text = text.replace(/\{full_name\}/g, `${patient.first_name || ''} ${patient.last_name || ''}`);
  
  if (text.includes('{health_conditions}') && patient.health_conditions) {
    text = text.replace(/\{health_conditions\}/g, patient.health_conditions.join(', '));
  }
  if (text.includes('{medications}') && patient.medications) {
    text = text.replace(/\{medications\}/g, patient.medications.join(', '));
  }
  
  const now = new Date();
  text = text.replace(/\{current_date\}/g, now.toLocaleDateString());
  text = text.replace(/\{current_month\}/g, now.toLocaleString('default', { month: 'long' }));
  text = text.replace(/\{current_year\}/g, now.getFullYear().toString());
  
  return text;
}

// Helper to personalize health-info blocks based on patient data
function personalizeHealthInfoBlock(block: any, patient: any): any {
  if (block.content.condition && patient.health_conditions) {
    const matchedCondition = patient.health_conditions.find((condition: string) => 
      condition === block.content.condition
    );
    if (matchedCondition) {
      block.content.personalized = true;
      if (patient.age > 65) {
        block.content.ageSpecificInfo = "Senior-specific recommendations for this condition";
      }
    }
  }
  return block;
}

// Function to send an email via Amazon SES
async function sendEmailWithSES({ to, from, subject, html }: { to: string; from: string; subject: string; html: string; }): Promise<void> {
  const input = {
    Source: from,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
    // Optional configuration parameters
    ConfigurationSetName: process.env.SES_CONFIGURATION_SET || undefined,
    Tags: [
      {
        Name: "campaign_type",
        Value: "newsletter"
      },
    ],
  };

  try {
    const command = new SendEmailCommand(input);
    const response = await ses.send(command);
    console.log(`Email sent successfully with message ID: ${response.MessageId}`);
    return Promise.resolve();
  } catch (error) {
    console.error("Error sending email with Amazon SES:", error);
    throw error; // Re-throw to be caught by the calling function
  }
}
