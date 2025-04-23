// src/admin/components/index.ts
import { ComponentLoader } from 'adminjs';

// Create component loader
export const componentLoader = new ComponentLoader();

// Register custom components
export const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard/Dashboard'),
  ArrayField: componentLoader.add('ArrayField', './fields/ArrayField'),
  ArrayList: componentLoader.add('ArrayList', './fields/ArrayList'),
  BulkImportPatients: componentLoader.add('BulkImportPatients', './patients/BulkImportPatients'),
  NewsletterTemplateEditor: componentLoader.add('NewsletterTemplateEditor', './newsletters/TemplateEditor'),
  NewsletterTemplatePreview: componentLoader.add('NewsletterTemplatePreview', './newsletters/TemplatePreview'),
  PreviewTemplate: componentLoader.add('PreviewTemplate', './newsletters/PreviewTemplate'),
  SendCampaign: componentLoader.add('SendCampaign', './campaigns/SendCampaign'),
  CampaignAnalytics: componentLoader.add('CampaignAnalytics', './campaigns/CampaignAnalytics'),
};
