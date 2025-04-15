// src/admin/components/newsletters/PreviewTemplate.tsx
import React, { useState, useEffect } from 'react';
import { Box, H3, Text, Button, Tab, Tabs, TabsContent, TabsHeader, Loader, MessageBox } from '@adminjs/design-system';
import { useRecord, ApiClient } from 'adminjs';

const PreviewTemplate = (props) => {
  const { record: initialRecord } = props;
  const { record, handleChange, submit } = useRecord(
    initialRecord.resource.id,
    initialRecord.id
  );
  
  const [previewHtml, setPreviewHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const api = new ApiClient();
  
  useEffect(() => {
    if (record) {
      generatePreview();
    }
  }, [record]);
  
  const generatePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to render template preview
      const response = await fetch('/api/admin/preview-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: record.params.content,
          subject: record.params.subject || 'Newsletter Preview',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewHtml(data.html);
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      setError('Error generating preview. Please check template content.');
    } finally {
      setLoading(false);
    }
  };
  
  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      setSuccess(null);
      
      // Call API to send test email
      const response = await api.resourceAction({
        resourceId: initialRecord.resource.id,
        recordId: initialRecord.id,
        actionName: 'sendTest',
        data: {
          email: testEmail,
        },
      });
      
      if (response.data.success) {
        setSuccess(`Test email sent to ${testEmail}`);
      } else {
        throw new Error(response.data.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Send test email error:', error);
      setError(error.message || 'Error sending test email');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Box padding="lg">
      <Box as="header" marginBottom="xl">
        <H3>{record.params.name} - Preview</H3>
        <Text>Preview how your newsletter template will look when sent to patients.</Text>
      </Box>
      
      <Tabs>
        <TabsHeader>
          <Tab id="preview">Preview</Tab>
          <Tab id="send-test">Send Test Email</Tab>
        </TabsHeader>
        
        <TabsContent id="preview">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <Loader />
            </Box>
          ) : error ? (
            <Box padding="xl">
              <MessageBox message={error} variant="danger" />
            </Box>
          ) : (
            <Box
              border="1px solid #E2E8F0"
              borderRadius="md"
              overflow="hidden"
              height="600px"
            >
              <iframe
                srcDoc={previewHtml}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Newsletter Preview"
              />
            </Box>
          )}
          
          <Box marginTop="lg">
            <Button onClick={generatePreview} disabled={loading}>Refresh Preview</Button>
          </Box>
        </TabsContent>
        
        <TabsContent id="send-test">
          <Box marginBottom="xl">
            <Text>Send a test email to verify how your newsletter will appear in email clients.</Text>
          </Box>
          
          {error && (
            <Box marginBottom="lg">
              <MessageBox message={error} variant="danger" />
            </Box>
          )}
          
          {success && (
            <Box marginBottom="lg">
              <MessageBox message={success} variant="success" />
            </Box>
          )}
          
          <Box flex flexDirection="row" alignItems="flex-end">
            <Box flex="1" marginRight="lg">
              <label>Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="example@example.com"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E0' }}
              />
            </Box>
            
            <Box>
              <Button
                onClick={sendTestEmail}
                disabled={sending || !testEmail}
              >
                {sending ? <Loader /> : 'Send Test Email'}
              </Button>
            </Box>
          </Box>
          
          <Box marginTop="xl">
            <Text as="small">
              The test email will include placeholder patient data. Some personalization features
              may not appear in the test email.
            </Text>
          </Box>
        </Tab// src/admin/adminjs.ts
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { DMMFClass } from '@prisma/client/runtime';
import { componentLoader, Components } from './components';
import { PrismaClient } from '@prisma/client';

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
