// src/pages/dashboard/newsletters/templates/[id].ts
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Button from '../../../../components/ui/Button';
import TemplateEditor from '../../../../admin/components/newsletters/TemplateEditor';
import MJMLTemplateEditor from '../../../../admin/components/newsletters/MJMLTemplateEditor';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

enum TemplateType {
  REACT_EMAIL = 'react-email',
  MJML_MARKUP = 'mjml-markup',
  MJML_REACT = 'mjml-react',
}

interface Template {
  id: string;
  name: string;
  description?: string;
  subject: string;
  content: any;
  mjml_content: string | null;
  template_type: TemplateType;
  target_conditions?: string[];
  target_medications?: string[];
  target_dietary?: string[];
  is_active: boolean;
  created_at: string;
}

export default function TemplateEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabaseClient();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reactContent, setReactContent] = useState<any>(null);
  const [mjmlContent, setMjmlContent] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.REACT_EMAIL);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch template data
  useEffect(() => {
    if (id) {
      fetchTemplate(id as string);
    }
  }, [id]);

  const fetchTemplate = async (templateId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('newsletter_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) throw error;
      
      setTemplate(data);
      setTemplateType(data.template_type || TemplateType.REACT_EMAIL);
      
      // Set content based on template type
      if (data.template_type === TemplateType.REACT_EMAIL) {
        setReactContent(data.content || null);
        setActiveTab(0);
      } else {
        setMjmlContent(data.mjml_content || '');
        setActiveTab(1);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      setErrorMessage('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!template) return;
    
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Prepare the update data based on active tab/template type
      const isReactEmail = activeTab === 0;
      const updateData: Partial<Template> = {
        template_type: isReactEmail ? TemplateType.REACT_EMAIL : TemplateType.MJML_MARKUP,
      };

      if (isReactEmail) {
        updateData.content = reactContent;
        // Don't update mjml_content
      } else {
        updateData.mjml_content = mjmlContent;
        // Don't update content
      }
      
      const { error } = await supabase
        .from('newsletter_templates')
        .update(updateData)
        .eq('id', template.id);
      
      if (error) throw error;
      
      setSuccessMessage('Template saved successfully');
      
      // Update the template type in state
      setTemplateType(updateData.template_type);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrorMessage('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!template || !testEmail) return;
    
    setSendingTest(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Determine which content to send based on template type
      const isReactEmail = activeTab === 0;
      const templateContent = isReactEmail ? reactContent : mjmlContent;
      const templateContentType = isReactEmail ? TemplateType.REACT_EMAIL : TemplateType.MJML_MARKUP;
      
      // Call API to send test email
      const response = await fetch('/api/newsletters/templates/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          recipientEmail: testEmail,
          templateContent,
          templateType: templateContentType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }
      
      setSuccessMessage(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      setErrorMessage((error as Error).message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleReactContentChange = (content: any) => {
    setReactContent(content);
  };

  const handleMjmlContentChange = (content: string) => {
    setMjmlContent(content);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    
    // Update template type based on tab
    if (index === 0) {
      setTemplateType(TemplateType.REACT_EMAIL);
    } else {
      setTemplateType(TemplateType.MJML_MARKUP);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Card>
            <div className="flex justify-center items-center h-64">
              <p>Loading template...</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Card>
            <div className="flex justify-center items-center h-64">
              <p>Template not found</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-gray-600">{template.subject}</p>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="border rounded px-3 py-2 mr-2"
              />
              <Button
                onClick={handleSendTestEmail}
                disabled={sendingTest || !testEmail}
                loading={sendingTest}
                variant="secondary"
              >
                Send Test
              </Button>
            </div>
            <Button
              onClick={handleSaveTemplate}
              disabled={saving}
              loading={saving}
            >
              Save Template
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <Card>
          <TabGroup index={activeTab} onIndexChange={handleTabChange}>
            <TabList>
              <Tab>React Email</Tab>
              <Tab>MJML</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="h-[600px]">
                  <TemplateEditor
                    initialContent={reactContent}
                    onChange={handleReactContentChange}
                    onPreview={() => {}}
                  />
                </div>
              </TabPanel>
              <TabPanel>
                <div className="h-[600px]">
                  <MJMLTemplateEditor
                    initialContent={mjmlContent}
                    onChange={handleMjmlContentChange}
                    onPreview={() => {}}
                  />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>
      </div>
    </DashboardLayout>
  );
}
