// src/lib/email-renderer.ts
import { render } from 'mjml-react'; 
import { PrismaClient } from '@prisma/client';
import { compile } from 'handlebars';
import { ComponentType } from 'react';
import path from 'path';
import fs from 'fs';

import { renderMJMLComponent, renderMJMLMarkup, processTemplate } from './mjml-renderer';

// Import MJML templates instead of React Email templates
import { DiabetesNewsletter } from '@/emails/mjml/templates/DiabetesNewsletter';

// Template types supported by the platform
export type NewsletterTemplate = 
  | 'diabetes'  
  | 'general-health';

// Email format types
export type EmailFormat = 'mjml-react' | 'mjml' | 'html';

// Rendering options
export interface RenderEmailOptions {
  format?: EmailFormat;
  minify?: boolean;
  templateData?: Record<string, any>;
}

/**
 * Renders an email template component or string to HTML
 */
export function renderEmail(
  template: ComponentType<any> | string,
  props: Record<string, any> = {},
  options: RenderEmailOptions = {}
): string {
  const { format = 'mjml-react', minify = true, templateData = {} } = options;

  // Handle string templates (already rendered or MJML markup)
  if (typeof template === 'string') {
    if (format === 'html') {
      // If it's already HTML, just process template variables
      return processTemplate(template, templateData);
    } else if (format === 'mjml') {
      // If it's MJML markup, render it to HTML
      return renderMJMLMarkup(template, { minify });
    }
    // Default: assume it's already HTML
    return template;
  }

  // Handle React/MJML component templates
  if (format === 'mjml-react') {
    // For MJML-React templates, use renderMJMLComponent
    return renderMJMLComponent(template, { ...props, ...templateData }, {
      mjmlOptions: { minify }
    });
  }

  // Default: throw error for unsupported formats
  throw new Error(`Unsupported email format: ${format}`);
}

// Email renderer service
export class EmailRenderer {
  private prisma: PrismaClient; 
  
  constructor(prisma: PrismaClient, redisUrl?: string) {
    this.prisma = prisma;
  }
  
  // Render template with data
  async renderTemplate(templateType: NewsletterTemplate, data: any): Promise<string> {
    // For MJML templates, use the renderMJMLComponent function
    if (templateType === 'diabetes') {
      return renderMJMLComponent(DiabetesNewsletter, data);
    }
    
    // For other template types, handle accordingly
    // For now, we'll throw an error for unsupported templates
    throw new Error(`Template type "${templateType}" not implemented yet.`);
  } 
  
  // Process template with data
  async processTemplate(templateMarkup: string, data: any): Promise<string> {
    return processTemplate(templateMarkup, data);
  }
  
  // Close connections
  async close() {
    // No connections to close
  }
}

export default EmailRenderer;
