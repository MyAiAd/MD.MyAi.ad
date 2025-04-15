// src/lib/email-renderer.ts
// This file handles rendering React Email templates to HTML for sending

import React from 'react';
import { renderAsync } from '@react-email/render';
import { render } from '@react-email/render';
import { ComponentType } from 'react';
import { renderMJMLComponent, renderMJMLMarkup, processTemplate } from './mjml-renderer';

import DiabetesNewsletter from '@/emails/templates/DiabetesNewsletter';
import GeneralHealthNewsletter from '@/emails/templates/GeneralHealthNewsletter';

// Template types supported by the platform
export type NewsletterTemplateType =
  | 'diabetes'
  | 'general-health'
  | 'custom';

// Format options for email rendering
export type EmailFormat = 'react-email' | 'mjml-react' | 'mjml-markup';

export interface RenderEmailOptions {
  /**
   * Format of the email template
   */
  format?: EmailFormat;
  /**
   * Whether to minify the HTML output
   */
  minify?: boolean;
  /**
   * Values to interpolate in the template
   */
  templateData?: Record<string, any>;
}

/**
 * Renders an email template to HTML
 * 
 * @param template React component or MJML markup
 * @param props Props to pass to the component (for React/MJML-React templates)
 * @param options Rendering options
 * @returns The rendered HTML
 */
export function renderEmail(
  template: ComponentType<any> | string,
  props: Record<string, any> = {},
  options: RenderEmailOptions = {}
): string {
  const { format = 'react-email', minify = true, templateData } = options;

  if (format === 'mjml-react' && typeof template !== 'string') {
    return renderMJMLComponent(template, props, {
      mjmlOptions: { minify },
      templateData,
    });
  } else if (format === 'mjml-markup' && typeof template === 'string') {
    let processedMjml = template;
    if (templateData) {
      processedMjml = processTemplate(processedMjml, templateData);
    }
    return renderMJMLMarkup(processedMjml, { minify });
  } else if (typeof template !== 'string') {
    const html = render(template(props), { pretty: !minify });
    return templateData ? processTemplate(html, templateData) : html;
  }

  throw new Error(`Unsupported template format: ${format}`);
}

// Render the appropriate newsletter template based on type and data
export async function renderNewsletterTemplate(
  templateType: NewsletterTemplateType,
  templateData: any
): Promise<string> {
  let templateComponent;

  switch (templateType) {
    case 'diabetes':
      templateComponent = React.createElement(DiabetesNewsletter, templateData);
      break;
    case 'general-health':
      templateComponent = React.createElement(GeneralHealthNewsletter, templateData);
      break;
    case 'custom':
      throw new Error('Custom templates are not yet implemented');
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }

  return await renderAsync(templateComponent);
}

// Function to personalize newsletter content for a specific patient
export async function personalizeNewsletterForPatient(
  templateId: string,
  patientData: any,
  providerData: any
): Promise<string> {
  const templateData = {
    templateType: 'diabetes' as NewsletterTemplateType,
    subject: 'Your Health Update',
    content: {},
  };

  const personalizedData = {
    patientName: `${patientData.first_name} ${patientData.last_name}`,
    provider: {
      name: providerData.name,
      logo: providerData.branding_settings?.logo,
      primaryColor: providerData.branding_settings?.primaryColor || '#0067b8',
    },
    unsubscribeUrl: `https://example.com/unsubscribe?token=${patientData.id}`,
  };

  if (templateData.templateType === 'diabetes') {
    Object.assign(personalizedData, {
      lastA1c: patientData.health_metrics?.a1c || 6.5,
      latestBloodGlucose: patientData.health_metrics?.blood_glucose || 120,
      medications: patientData.medications?.map((med: any) => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instructions,
      })) || [],
      nextAppointment: patientData.next_appointment,
    });
  }

  if (templateData.templateType === 'general-health') {
    Object.assign(personalizedData, {
      healthTips: [
        {
          title: 'Stay Hydrated',
          content: 'Remember to drink at least 8 glasses of water daily to maintain proper hydration.',
        },
        {
          title: 'Regular Exercise',
          content: 'Aim for at least 150 minutes of moderate exercise per week for optimal health benefits.',
        },
        {
          title: 'Balanced Nutrition',
          content: 'Focus on a diet rich in fruits, vegetables, lean proteins, and whole grains.',
        },
      ],
      featuredArticles: [
        {
          title: 'Understanding Preventive Care',
          description: 'Learn how regular check-ups and screenings can help maintain your health.',
          url: '#article1',
        },
      ],
    });
  }

  return await renderNewsletterTemplate(templateData.templateType, personalizedData);
}

