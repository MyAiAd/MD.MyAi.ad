// src/lib/email-renderer.ts
import { render } from 'mjml-react';
import { PrismaClient } from '@prisma/client';
import { compile } from 'handlebars';
import path from 'path';
import fs from 'fs';
import Redis from 'ioredis';

import { renderMJMLComponent, renderMJMLMarkup, processTemplate } from './mjml-renderer';

// Import MJML templates instead of React Email templates
import { DiabetesNewsletter } from '@/emails/mjml/templates/DiabetesNewsletter';
// Remove import for GeneralHealthNewsletter or import the MJML version if it exists

// Template types supported by the platform
export type NewsletterTemplate = 
  | 'diabetes' 
  | 'general-health';

// Email renderer service
export class EmailRenderer {
  private redis: Redis | null = null;
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient, redisUrl?: string) {
    this.prisma = prisma;
    
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
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
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export default EmailRenderer;
