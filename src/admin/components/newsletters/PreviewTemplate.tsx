// src/admin/components/newsletters/PreviewTemplate.tsx
import React, { useState, useEffect } from 'react';
import { Box, H3, Text, Button, Loader, MessageBox } from '@adminjs/design-system';
import { useRecord, ApiClient } from 'adminjs';

interface PreviewTemplateProps {
  record: {
    resource: {
      id: string;
    };
    id: string;
    params: {
      name: string;
      content: string;
      subject?: string;
    };
  };
}

const PreviewTemplate = (props: PreviewTemplateProps) => {
  const { record: initialRecord } = props;
  const { record, handleChange, submit } = useRecord(
    initialRecord.resource.id,
    initialRecord.id
  );
  
  const [previewHtml, setPreviewHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('preview');
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
      
      // Call API to send test email - fixed API call for AdminJS v7
      const response = await api.resourceAction({
        resourceId: initialRecord.resource.id,
        actionName: 'sendTest',
        // Use the record ID as part of the data payload instead
        data: {
          email: testEmail,
          id: initialRecord.id
        },
      });
      
      if (response.data.success) {
        setSuccess(`Test email sent to ${testEmail}`);
      } else {
        throw new Error(response.data.message || 'Failed to send test email');
      }
    } catch (error: any) {
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
      
      <Box mb="lg">
        <Box display="flex" borderBottom="1px solid #E2E8F0" marginBottom="lg">
          <Box 
            padding="sm" 
            onClick={() => setActiveTab('preview')} 
            style={{ 
              cursor: 'pointer',
              fontWeight: activeTab === 'preview' ? 'bold' : 'normal',
              borderBottom: activeTab === 'preview' ? '2px solid #0067b8' : 'none'
            }}
          >
            Preview
          </Box>
          <Box 
            padding="sm" 
            onClick={() => setActiveTab('send-test')} 
            style={{ 
              cursor: 'pointer',
              fontWeight: activeTab === 'send-test' ? 'bold' : 'normal',
              borderBottom: activeTab === 'send-test' ? '2px solid #0067b8' : 'none'
            }}
            marginLeft="lg"
          >
            Send Test Email
          </Box>
        </Box>
        
        {activeTab === 'preview' && (
          <Box>
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
          </Box>
        )}
        
        {activeTab === 'send-test' && (
          <Box>
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
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PreviewTemplate;
