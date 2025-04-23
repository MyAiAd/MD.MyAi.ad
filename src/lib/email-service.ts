// src/lib/email-service.ts
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { ComponentType } from 'react';
import { renderEmail, EmailFormat } from './email-renderer';

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || '',
  },
});

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  /**
   * Email subject
   */
  subject: string;
  
  /**
   * Email sender
   */
  from: EmailRecipient;
  
  /**
   * Email recipients
   */
  to: EmailRecipient[];
  
  /**
   * CC recipients
   */
  cc?: EmailRecipient[];
  
  /**
   * BCC recipients
   */
  bcc?: EmailRecipient[];
  
  /**
   * Reply-to address
   */
  replyTo?: EmailRecipient[];
  
  /**
   * Email template
   */
  template: ComponentType<any> | string;
  
  /**
   * Template format
   */
  templateFormat?: EmailFormat;
  
  /**
   * Template props
   */
  templateProps?: Record<string, any>;
  
  /**
   * Template data for interpolation
   */
  templateData?: Record<string, any>;
  
  /**
   * Custom message headers
   */
  headers?: Record<string, string>;
}

/**
 * Formats an email address with optional name
 */
function formatAddress(recipient: EmailRecipient): string {
  if (recipient.name) {
    return `"${recipient.name.replace(/"/g, '\\"')}" <${recipient.email}>`;
  }
  return recipient.email;
}

/**
 * Formats recipients list
 */
function formatRecipients(recipients?: EmailRecipient[]): string[] | undefined {
  if (!recipients || recipients.length === 0) {
    return undefined;
  }
  return recipients.map(formatAddress);
}

/**
 * Sends an email using AWS SES
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
  const {
    subject,
    from,
    to,
    cc,
    bcc,
    replyTo,
    template,
    templateFormat = 'mjml-react',
    templateProps = {},
    templateData = {},
    headers = {},
  } = options;

  // Render the email template
  const htmlContent = renderEmail(template, templateProps, {
    format: templateFormat,
    minify: true,
    templateData,
  });

  // Extract plain text version (for email clients that don't support HTML)
  // This is a simple version - in production, you might want a better HTML-to-text converter
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();

  // Prepare email headers
  const messageHeaders: Record<string, string> = {
    ...headers,
    'X-Healthcare-Newsletter-Platform': 'v1.0',
  };

  // Create the SES send command
  const command = new SendEmailCommand({
    Source: formatAddress(from),
    Destination: {
      ToAddresses: formatRecipients(to),
      CcAddresses: formatRecipients(cc),
      BccAddresses: formatRecipients(bcc),
    },
    ReplyToAddresses: formatRecipients(replyTo),
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: 'UTF-8',
        },
        Text: {
          Data: textContent,
          Charset: 'UTF-8',
        },
      },
    },
    Headers: Object.entries(messageHeaders).map(([name, value]) => ({
      Name: name,
      Value: value,
    })),
  });

  try {
    // Send the email
    const response = await sesClient.send(command);
    return { messageId: response.MessageId || '' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}

/**
 * Sends a test email for a newsletter template
 */
export async function sendTestEmail(
  template: ComponentType<any> | string,
  templateFormat: EmailFormat,
  recipientEmail: string,
  templateProps: Record<string, any>,
  subjectPrefix = '[TEST] '
): Promise<{ messageId: string }> {
  // Extract subject from template props or use default
  const subject = `${subjectPrefix}${templateProps.title || 'Newsletter Preview'}`;
  
  // Send the test email
  return sendEmail({
    subject,
    from: {
      email: process.env.DEFAULT_SENDER_EMAIL || 'no-reply@yourprovider.com',
      name: process.env.DEFAULT_SENDER_NAME || 'Healthcare Newsletter Platform',
    },
    to: [{ email: recipientEmail }],
    template,
    templateFormat,
    templateProps,
    headers: {
      'X-Healthcare-Newsletter-Test': 'true',
    },
  });
}
