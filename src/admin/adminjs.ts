// src/admin/adminjs.ts
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';
import { componentLoader, Components } from './components';

// Register the PrismaJS adapter
AdminJS.registerAdapter({ Database, Resource });

// Create Prisma client
const prisma = new PrismaClient();

// Export AdminJS configuration function
export const getAdminJSConfig = async () => {
  // Get Prisma model metadata
  const dmmf = ((prisma as any)._baseDmmf as DMMFClass);
  
  return {
    databases: [
      {
        database: prisma,
        models: [
          'Patient',
          'NewsletterTemplate',
          'NewsletterCampaign',
          'NewsletterAnalytics',
          'HealthOutcome',
        ],
      },
    ],
    resources: [
      {
        resource: { model: 'Patient', client: prisma },
        options: {
          navigation: {
            name: 'Patient Management',
            icon: 'User',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            created_at: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            provider_id: {
              isVisible: { list: false, filter: false, show: false, edit: false },
            },
            health_conditions: {
              type: 'string',
              isArray: true,
              components: {
                edit: Components.ArrayField,
                show: Components.ArrayList,
              },
            },
            medications: {
              type: 'string',
              isArray: true,
              components: {
                edit: Components.ArrayField,
                show: Components.ArrayList,
              },
            },
            dietary_restrictions: {
              type: 'string',
              isArray: true,
              components: {
                edit: Components.ArrayField,
                show: Components.ArrayList,
              },
            },
          },
          actions: {
            new: {
              before: async (request) => {
                // Set provider_id based on current user
                request.payload = {
                  ...request.payload,
                  provider_id: request.session.adminUser.id,
                };
                return request;
              },
            },
            list: {
              before: async (request) => {
                // Filter patients by provider_id
                request.query = {
                  ...request.query,
                  'filters.provider_id': request.session.adminUser.id,
                };
                return request;
              },
            },
            bulkImport: {
              actionType: 'resource',
              component: Components.BulkImportPatients,
              icon: 'Upload',
            },
          },
        },
      },
      {
        resource: { model: 'NewsletterTemplate', client: prisma },
        options: {
          navigation: {
            name: 'Newsletter Management',
            icon: 'FileText',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            created_at: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            provider_id: {
              isVisible: { list: false, filter: false, show: false, edit: false },
            },
            content: {
              type: 'mixed',
              components: {
                edit: Components.NewsletterTemplateEditor,
                show: Components.NewsletterTemplatePreview,
              },
            },
            target_conditions: {
              type: 'string',
              isArray: true,
              components: {
                edit: Components.ArrayField,
                show: Components.ArrayList,
              },
            },
            target_medications: {
              type: 'string',
              isArray: true,
              components: {
                edit: Components.ArrayField,
                show: Components.ArrayList,
              },
            },
            target_dietary: {
              type: 'string',
              isArray: true,
              components: {
                edit: Components.ArrayField,
                show: Components.ArrayList,
              },
            },
          },
          actions: {
            new: {
              before: async (request) => {
                // Set provider_id based on current user
                request.payload = {
                  ...request.payload,
                  provider_id: request.session.adminUser.id,
                };
                return request;
              },
            },
            list: {
              before: async (request) => {
                // Filter templates by provider_id
                request.query = {
                  ...request.query,
                  'filters.provider_id': request.session.adminUser.id,
                };
                return request;
              },
            },
            preview: {
              actionType: 'record',
              component: Components.PreviewTemplate,
              icon: 'Eye',
            },
          },
        },
      },
      {
        resource: { model: 'NewsletterCampaign', client: prisma },
        options: {
          navigation: {
            name: 'Newsletter Management',
            icon: 'Send',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            created_at: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            provider_id: {
              isVisible: { list: false, filter: false, show: false, edit: false },
            },
            status: {
              availableValues: [
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'sending', label: 'Sending' },
                { value: 'sent', label: 'Sent' },
                { value: 'paused', label: 'Paused' },
              ],
            },
          },
          actions: {
            new: {
              before: async (request) => {
                // Set provider_id based on current user
                request.payload = {
                  ...request.payload,
                  provider_id: request.session.adminUser.id,
                };
                return request;
              },
            },
            list: {
              before: async (request) => {
                // Filter campaigns by provider_id
                request.query = {
                  ...request.query,
                  'filters.provider_id': request.session.adminUser.id,
                };
                return request;
              },
            },
            sendCampaign: {
              actionType: 'record',
              component: Components.SendCampaign,
              icon: 'Send',
            },
            viewAnalytics: {
              actionType: 'record',
              component: Components.CampaignAnalytics,
              icon: 'BarChart',
            },
          },
        },
      },
      {
        resource: { model: 'NewsletterAnalytics', client: prisma },
        options: {
          navigation: {
            name: 'Analytics',
            icon: 'BarChart',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            created_at: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
          actions: {
            list: {
              before: async (request) => {
                // Filter analytics by provider_id via campaign
                // This requires a more complex query
                return request;
              },
            },
            edit: { isAccessible: false },
            delete: { isAccessible: false },
            new: { isAccessible: false },
          },
        },
      },
      {
        resource: { model: 'HealthOutcome', client: prisma },
        options: {
          navigation: {
            name: 'Analytics',
            icon: 'Activity',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            created_at: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            provider_id: {
              isVisible: { list: false, filter: false, show: false, edit: false },
            },
          },
          actions: {
            new: {
              before: async (request) => {
                // Set provider_id based on current user
                request.payload = {
                  ...request.payload,
                  provider_id: request.session.adminUser.id,
                };
                return request;
              },
            },
            list: {
              before: async (request) => {
                // Filter outcomes by provider_id
                request.query = {
                  ...request.query,
                  'filters.provider_id': request.session.adminUser.id,
                };
                return request;
              },
            },
          },
        },
      },
    ],
    rootPath: '/admin',
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
    },
    branding: {
      companyName: 'Healthcare Newsletter Platform',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      withMadeWithLove: false,
    },
  };
};
