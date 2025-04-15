// src/admin/components/newsletters/MJMLTemplateEditor.tsx
import React, { useState, useEffect } from 'react';
import { renderMJMLMarkup } from '../../../lib/mjml-renderer';

interface MJMLTemplateEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  onPreview: () => void;
  height?: string;
}

const MJMLTemplateEditor: React.FC<MJMLTemplateEditorProps> = ({
  initialContent,
  onChange,
  onPreview,
  height = '500px',
}) => {
  const [content, setContent] = useState(initialContent);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Initialize with initial content
    setContent(initialContent);
  }, [initialContent]);

  // Generate preview when content changes or preview is toggled
  useEffect(() => {
    if (showPreview) {
      try {
        const result = renderMJMLMarkup(content);
        setPreviewHtml(result);
        setError(null);
      } catch (err) {
        setError(`MJML rendering error: ${(err as Error).message}`);
        setPreviewHtml('');
      }
    }
  }, [content, showPreview]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      onPreview();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-medium">MJML Template Editor</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={togglePreview}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showPreview ? 'Edit Template' : 'Preview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex-1" style={{ height }}>
        {showPreview ? (
          <div
            className="h-full w-full border rounded overflow-auto bg-white p-4"
            style={{ height }}
          >
            <iframe
              title="Email Preview"
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full h-full p-3 font-mono text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ height, resize: 'none' }}
            placeholder="Enter your MJML template code here..."
          />
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <p>
          Use MJML tags to create responsive email templates. Learn more at{' '}
          <a
            href="https://mjml.io/documentation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            MJML Documentation
          </a>
        </p>
      </div>
    </div>
  );
};

export default MJMLTemplateEditor;
