// src/admin/components/newsletters/TemplatePreview.tsx
import React, { useEffect, useState } from 'react';
import { Box, Text, Loader } from '@adminjs/design-system';

interface TemplatePreviewProps {
  record: {
    params: {
      content: any;
      subject?: string;
      [key: string]: any;
    };
  };
}

const TemplatePreview = (props: TemplatePreviewProps) => {
  const { record } = props;
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (record && record.params) {
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
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Loader />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" padding="xl">
        <Text color="red">{error}</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box
        border="1px solid #E2E8F0"
        borderRadius="md"
        overflow="hidden"
        maxHeight="600px"
      >
        <iframe
          srcDoc={previewHtml}
          style={{ width: '100%', height: '600px', border: 'none' }}
          title="Newsletter Preview"
        />
      </Box>
    </Box>
  );
};

export default TemplatePreview;
