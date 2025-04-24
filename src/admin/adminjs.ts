// src/admin/adminjs.ts - Alternate version with direct model references
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

// Import components with proper path for bundler moduleResolution
import { componentLoader, Components } from './components';

// Register the PrismaJS adapter
AdminJS.registerAdapter({ Database, Resource });

// Create a new PrismaClient instance
const prisma = new PrismaClient();

// Interface for the request object
interface AdminRequest {
  payload?: Record<string, any>;
  session?: {
    adminUser?: {
      id?: string;
      email?: string;
      role?: string;
    }
  };
  query?: Record<string, any>;
  [key: string]: any;
}

// Define the resources manually
const providerResource = { model: 'provider', client: prisma };
const patientResource = { model: 'patient', client: prisma };
const newsletterResource = { model: 'newsletter', client: prisma };
const campaignResource = { model: 'campaign', client: prisma };

// Define the AdminJS configuration
const options = {
  resources: [
    {
      resource: providerResource,
      options: {
        navigation: {
          name: 'Providers',
          icon: 'User',
        },
        properties: {
          created_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          updated_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        },
      },
    },
    {
      resource: patientResource,
      options: {
        navigation: {
          name: 'Patients',
          icon: 'User',
        },
        properties: {
          created_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          updated_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        },
        actions: {
          new: {
            before: async (request: AdminRequest) => {
              // Set provider_id based on current user
              request.payload = {
                ...request.payload,
                provider_id: request.session?.adminUser?.id,
              };
              return request;
            },
          },
          list: {
            before: async (request: AdminRequest) => {
              // Filter patients based on provider_id
              const currentUserId = request.session?.adminUser?.id;
              const currentUserRole = request.session?.adminUser?.role;
              
              if (currentUserRole !== 'admin') {
                request.query = {
                  ...request.query,
                  'filters.provider_id': currentUserId,
                };
              }
              
              return request;
            },
          },
        },
      },
    },
    {
      resource: newsletterResource,
      options: {
        navigation: {
          name: 'Newsletters',
          icon: 'Newspaper',
        },
        components: {
          edit: Components.newsletters.TemplateEditor,
          show: Components.newsletters.TemplatePreview,
        },
        properties: {
          mjml_template: {
            type: 'textarea',
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
          created_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          updated_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        },
        actions: {
          new: {
            before: async (request: AdminRequest) => {
              request.payload = {
                ...request.payload,
                provider_id: request.session?.adminUser?.id,
              };
              return request;
            },
          },
        },
      },
    },
    {
      resource: campaignResource,
      options: {
        navigation: {
          name: 'Campaigns',
          icon: 'Send',
        },
        components: {
          show: Components.campaigns.CampaignAnalytics,
          new: Components.campaigns.SendCampaign,
        },
        properties: {
          provider_id: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          created_at: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        },
        actions: {
          new: {
            before: async (request: AdminRequest) => {
              request.payload = {
                ...request.payload,
                provider_id: request.session?.adminUser?.id,
              };
              return request;
            },
          },
          list: {
            before: async (request: AdminRequest) => {
              const currentUserId = request.session?.adminUser?.id;
              const currentUserRole = request.session?.adminUser?.role;
              
              if (currentUserRole !== 'admin') {
                request.query = {
                  ...request.query,
                  'filters.provider_id': currentUserId,
                };
              }
              
              return request;
            },
          },
        },
      },
    },
  ],
  dashboard: {
    component: Components.dashboard.Dashboard,
  },
  branding: {
    companyName: 'Healthcare Newsletter Platform',
    logo: '/images/logo.png',
    favicon: '/favicon.ico',
  },
};

export default options;
