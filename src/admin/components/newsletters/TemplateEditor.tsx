// src/admin/components/newsletters/TemplateEditor.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Box, Button, Text, TextArea, Input, FormGroup, Label, Tabs } from '@adminjs/design-system';
import { flat } from 'adminjs';

const { flatten } = flat;

// Helper function to get nested property values
const getPropertyValue = (obj: any, path: string) => {
  if (!obj) return undefined;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) return undefined;
    result = result[key];
  }
  
  return result;
};

// Define interfaces for the content blocks
interface BaseBlock {
  id: string;
  type: string;
  conditions: string[];
  medications: string[];
  dietary: string[];
}

interface TextBlock extends BaseBlock {
  type: 'text';
  content: {
    text: string;
  };
}

interface ImageBlock extends BaseBlock {
  type: 'image';
  content: {
    src: string;
    alt: string;
    width: number;
  };
}

interface ButtonBlock extends BaseBlock {
  type: 'button';
  content: {
    text: string;
    url: string;
    align: 'left' | 'center' | 'right';
  };
}

interface DividerBlock extends BaseBlock {
  type: 'divider';
  content: {
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
  };
}

interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  content: {
    height: number;
  };
}

interface HealthInfoBlock extends BaseBlock {
  type: 'health-info';
  content: {
    title: string;
    text: string;
    condition: string;
  };
}

type ContentBlock = TextBlock | ImageBlock | ButtonBlock | DividerBlock | SpacerBlock | HealthInfoBlock;

// Define props interfaces for all components
interface TemplateEditorProps {
  property: {
    path: string;
    label: string;
  };
  onChange: (propertyPath: string, value: any) => void;
  record: {
    params: {
      [key: string]: any;
    };
  };
}

interface BlockEditorProps {
  block: ContentBlock;
  onChange: (updatedBlock: ContentBlock) => void;
}

interface TextEditorProps {
  block: TextBlock;
  onChange: (updatedBlock: TextBlock) => void;
}

interface ImageEditorProps {
  block: ImageBlock;
  onChange: (updatedBlock: ImageBlock) => void;
}

interface ButtonEditorProps {
  block: ButtonBlock;
  onChange: (updatedBlock: ButtonBlock) => void;
}

interface DividerEditorProps {
  block: DividerBlock;
  onChange: (updatedBlock: DividerBlock) => void;
}

interface SpacerEditorProps {
  block: SpacerBlock;
  onChange: (updatedBlock: SpacerBlock) => void;
}

interface HealthInfoEditorProps {
  block: HealthInfoBlock;
  onChange: (updatedBlock: HealthInfoBlock) => void;
}

const TemplateEditor = (props: TemplateEditorProps) => {
  const { property, onChange, record } = props;
  
  // Get template content from record or initialize
  const propertyPath = `params.${property.path}`;
  const initialContent = getPropertyValue(record, property.path) || [];
  
  const [content, setContent] = useState<ContentBlock[]>(initialContent);
  const [activeTab, setActiveTab] = useState('blocks');
  const [previewHtml, setPreviewHtml] = useState('');
  
  useEffect(() => {
    onChange(propertyPath, content);
  }, [content, onChange, propertyPath]);
  
  // Generate preview when tab changes
  useEffect(() => {
    if (activeTab === 'preview') {
      generatePreview();
    }
  }, [activeTab]);
  
  const generatePreview = async () => {
    try {
      // Call API to render template preview
      const response = await fetch('/api/admin/preview-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          subject: getPropertyValue(record, 'subject') || 'Newsletter Preview',
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
      setPreviewHtml('<p>Error generating preview. Please check template content.</p>');
    }
  };
  
  const addContentBlock = (type: ContentBlock['type']) => {
    // Create base block with common properties
    const baseBlock = {
      id: `block-${Date.now()}`,
      type,
      conditions: [],
      medications: [],
      dietary: [],
    };
    
    let newBlock: ContentBlock;
    
    // Add specific content based on type
    switch (type) {
      case 'text':
        newBlock = {
          ...baseBlock,
          type: 'text',
          content: { text: 'Enter your text here' }
        };
        break;
      case 'image':
        newBlock = {
          ...baseBlock,
          type: 'image',
          content: { src: '', alt: '', width: 600 }
        };
        break;
      case 'button':
        newBlock = {
          ...baseBlock,
          type: 'button',
          content: { text: 'Click Me', url: '#', align: 'center' }
        };
        break;
      case 'divider':
        newBlock = {
          ...baseBlock,
          type: 'divider',
          content: { style: 'solid', color: '#E2E8F0' }
        };
        break;
      case 'spacer':
        newBlock = {
          ...baseBlock,
          type: 'spacer',
          content: { height: 20 }
        };
        break;
      case 'health-info':
        newBlock = {
          ...baseBlock,
          type: 'health-info',
          content: { title: 'Health Information', text: 'Add health-specific content here', condition: '' }
        };
        break;
      default:
        // This should never happen due to TypeScript type safety
        throw new Error(`Unsupported block type: ${type}`);
    }
    
    setContent([...content, newBlock]);
  };
  
  const updateBlockContent = (index: number, updatedBlock: ContentBlock) => {
    const newContent = [...content];
    newContent[index] = updatedBlock;
    setContent(newContent);
  };
  
  const removeBlock = (index: number) => {
    const newContent = [...content];
    newContent.splice(index, 1);
    setContent(newContent);
  };
  
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === content.length - 1)
    ) {
      return;
    }
    
    const newContent = [...content];
    const blockToMove = newContent[index];
    
    if (direction === 'up') {
      newContent[index] = newContent[index - 1];
      newContent[index - 1] = blockToMove;
    } else {
      newContent[index] = newContent[index + 1];
      newContent[index + 1] = blockToMove;
    }
    
    setContent(newContent);
  };
  
  // Render the editor for each block type
  const renderBlockEditor = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <TextEditor
            block={block}
            onChange={(updatedBlock) => updateBlockContent(index, updatedBlock)}
          />
        );
      case 'image':
        return (
          <ImageEditor
            block={block}
            onChange={(updatedBlock) => updateBlockContent(index, updatedBlock)}
          />
        );
      case 'button':
        return (
          <ButtonEditor
            block={block}
            onChange={(updatedBlock) => updateBlockContent(index, updatedBlock)}
          />
        );
      case 'divider':
        return (
          <DividerEditor
            block={block}
            onChange={(updatedBlock) => updateBlockContent(index, updatedBlock)}
          />
        );
      case 'spacer':
        return (
          <SpacerEditor
            block={block}
            onChange={(updatedBlock) => updateBlockContent(index, updatedBlock)}
          />
        );
      case 'health-info':
        return (
          <HealthInfoEditor
            block={block}
            onChange={(updatedBlock) => updateBlockContent(index, updatedBlock)}
          />
        );
      default:
        // Use a type assertion to tell TypeScript that we know what we're doing
        return <Text>Unknown block type: {(block as BaseBlock).type}</Text>;
    }
  };
  
  return (
    <Box>
      <Label>{property.label}</Label>
      
      {/* Custom Tabs Implementation */}
      <Box mb="lg">
        <Box display="flex" borderBottom="1px solid #E2E8F0" marginBottom="lg">
          <Box 
            padding="sm" 
            onClick={() => setActiveTab('blocks')} 
            style={{ 
              cursor: 'pointer',
              fontWeight: activeTab === 'blocks' ? 'bold' : 'normal',
              borderBottom: activeTab === 'blocks' ? '2px solid #0067b8' : 'none'
            }}
          >
            Content Blocks
          </Box>
          <Box 
            padding="sm" 
            onClick={() => setActiveTab('preview')} 
            style={{ 
              cursor: 'pointer',
              fontWeight: activeTab === 'preview' ? 'bold' : 'normal',
              borderBottom: activeTab === 'preview' ? '2px solid #0067b8' : 'none'
            }}
            marginLeft="lg"
          >
            Preview
          </Box>
          <Box 
            padding="sm" 
            onClick={() => setActiveTab('json')} 
            style={{ 
              cursor: 'pointer',
              fontWeight: activeTab === 'json' ? 'bold' : 'normal',
              borderBottom: activeTab === 'json' ? '2px solid #0067b8' : 'none'
            }}
            marginLeft="lg"
          >
            JSON
          </Box>
        </Box>
        
        {activeTab === 'blocks' && (
          <Box>
            <Box marginBottom="xl">
              <Text fontWeight="bold">Add Content Block:</Text>
              <Box flex flexDirection="row" flexWrap="wrap" marginTop="sm">
                <Button size="sm" onClick={() => addContentBlock('text')} marginRight="sm" marginBottom="sm">Text</Button>
                <Button size="sm" onClick={() => addContentBlock('image')} marginRight="sm" marginBottom="sm">Image</Button>
                <Button size="sm" onClick={() => addContentBlock('button')} marginRight="sm" marginBottom="sm">Button</Button>
                <Button size="sm" onClick={() => addContentBlock('divider')} marginRight="sm" marginBottom="sm">Divider</Button>
                <Button size="sm" onClick={() => addContentBlock('spacer')} marginRight="sm" marginBottom="sm">Spacer</Button>
                <Button size="sm" onClick={() => addContentBlock('health-info')} marginBottom="sm">Health Info</Button>
              </Box>
            </Box>
            
            {content.length === 0 ? (
              <Box padding="xl" textAlign="center" border="1px solid #E2E8F0" borderRadius="md">
                <Text>No content blocks added yet. Use the buttons above to add content.</Text>
              </Box>
            ) : (
              content.map((block, index) => (
                <Box
                  key={block.id}
                  marginBottom="lg"
                  padding="lg"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                >
                  <Box flex flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="md">
                    <Text fontWeight="bold">{block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block</Text>
                    
                    <Box>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        marginRight="sm"
                      >
                        Move Up
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === content.length - 1}
                        marginRight="sm"
                      >
                        Move Down
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeBlock(index)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                  
                  {renderBlockEditor(block, index)}
                  
                  <Box marginTop="lg">
                    <Text fontWeight="bold">Display Rules (Optional):</Text>
                    <Text fontSize="sm" color="grey">
                      Define conditions when this block should be shown to patients.
                      If left empty, block will be shown to all patients.
                    </Text>
                    
                    <Box marginTop="sm">
                      <FormGroup>
                        <Label>Health Conditions</Label>
                        <Input
                          type="text"
                          value={block.conditions.join(', ')}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updatedBlock = { ...block };
                            updatedBlock.conditions = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                            updateBlockContent(index, updatedBlock);
                          }}
                          placeholder="E.g. diabetes, hypertension (comma separated)"
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label>Medications</Label>
                        <Input
                          type="text"
                          value={block.medications.join(', ')}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updatedBlock = { ...block };
                            updatedBlock.medications = e.target.value.split(',').map(m => m.trim()).filter(Boolean);
                            updateBlockContent(index, updatedBlock);
                          }}
                          placeholder="E.g. metformin, lisinopril (comma separated)"
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label>Dietary Restrictions</Label>
                        <Input
                          type="text"
                          value={block.dietary.join(', ')}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const updatedBlock = { ...block };
                            updatedBlock.dietary = e.target.value.split(',').map(d => d.trim()).filter(Boolean);
                            updateBlockContent(index, updatedBlock);
                          }}
                          placeholder="E.g. gluten-free, dairy-free (comma separated)"
                        />
                      </FormGroup>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
        
        {activeTab === 'preview' && (
          <Box>
            {previewHtml ? (
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
            ) : (
              <Box padding="xl" textAlign="center" border="1px solid #E2E8F0" borderRadius="md">
                <Text>Loading preview...</Text>
              </Box>
            )}
            
            <Box marginTop="lg">
              <Button onClick={generatePreview}>Refresh Preview</Button>
            </Box>
          </Box>
        )}
        
        {activeTab === 'json' && (
          <Box>
            <TextArea
              style={{ height: '400px', fontFamily: 'monospace' }}
              value={JSON.stringify(content, null, 2)}
              readOnly
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Block editor components
const TextEditor = ({ block, onChange }: TextEditorProps) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const updatedBlock = {
      ...block,
      content: {
        ...block.content,
        text: e.target.value,
      },
    };
    onChange(updatedBlock);
  };
  
  return (
    <FormGroup>
      <Label>Text Content</Label>
      <TextArea
        value={block.content.text || ''}
        onChange={handleChange}
        style={{ minHeight: '100px' }}
      />
    </FormGroup>
  );
};

const ImageEditor = ({ block, onChange }: ImageEditorProps) => {
  const handleChange = (field: keyof ImageBlock['content'], value: string | number) => {
    const updatedBlock = {
      ...block,
      content: {
        ...block.content,
        [field]: value,
      },
    };
    onChange(updatedBlock);
  };
  
  return (
    <Box>
      <FormGroup>
        <Label>Image URL</Label>
        <Input
          type="text"
          value={block.content.src || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('src', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Alt Text</Label>
        <Input
          type="text"
          value={block.content.alt || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('alt', e.target.value)}
          placeholder="Description of the image"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Width</Label>
        <Input
          type="number"
          value={block.content.width || 600}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('width', parseInt(e.target.value))}
          max={600}
        />
        <Text fontSize="sm" color="grey">Maximum recommended width: 600px</Text>
      </FormGroup>
    </Box>
  );
};

const ButtonEditor = ({ block, onChange }: ButtonEditorProps) => {
  const handleChange = (field: keyof ButtonBlock['content'], value: string) => {
    const updatedBlock = {
      ...block,
      content: {
        ...block.content,
        [field]: value,
      },
    };
    onChange(updatedBlock);
  };
  
  return (
    <Box>
      <FormGroup>
        <Label>Button Text</Label>
        <Input
          type="text"
          value={block.content.text || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('text', e.target.value)}
        />
      </FormGroup>
      
      <FormGroup>
        <Label>URL</Label>
        <Input
          type="text"
          value={block.content.url || '#'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('url', e.target.value)}
          placeholder="https://example.com"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Alignment</Label>
        <select
          value={block.content.align || 'center'}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('align', e.target.value as ButtonBlock['content']['align'])}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E0' }}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FormGroup>
    </Box>
  );
};

const DividerEditor = ({ block, onChange }: DividerEditorProps) => {
  const handleChange = (field: keyof DividerBlock['content'], value: string) => {
    const updatedBlock = {
      ...block,
      content: {
        ...block.content,
        [field]: value,
      },
    };
    onChange(updatedBlock);
  };
  
  return (
    <Box>
      <FormGroup>
        <Label>Style</Label>
        <select
          value={block.content.style || 'solid'}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('style', e.target.value as DividerBlock['content']['style'])}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E0' }}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </FormGroup>
      
      <FormGroup>
        <Label>Color</Label>
        <Input
          type="color"
          value={block.content.color || '#E2E8F0'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('color', e.target.value)}
        />
      </FormGroup>
    </Box>
  );
};

const SpacerEditor = ({ block, onChange }: SpacerEditorProps) => {
  const handleChange = (height: string) => {
    const updatedBlock = {
      ...block,
      content: {
        ...block.content,
        height: parseInt(height),
      },
    };
    onChange(updatedBlock);
  };
  
  return (
    <Box>
      <FormGroup>
        <Label>Height (px)</Label>
        <Input
          type="number"
          value={block.content.height || 20}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
          min={5}
          max={100}
        />
      </FormGroup>
    </Box>
  );
};

const HealthInfoEditor = ({ block, onChange }: HealthInfoEditorProps) => {
  const handleChange = (field: keyof HealthInfoBlock['content'], value: string) => {
    const updatedBlock = {
      ...block,
      content: {
        ...block.content,
        [field]: value,
      },
    };
    onChange(updatedBlock);
  };
  
  return (
    <Box>
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={block.content.title || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
          placeholder="Health Information Title"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Content</Label>
        <TextArea
          value={block.content.text || ''}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange('text', e.target.value)}
          style={{ minHeight: '100px' }}
          placeholder="Health information content..."
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Specific Health Condition</Label>
        <Input
          type="text"
          value={block.content.condition || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('condition', e.target.value)}
          placeholder="E.g. diabetes, hypertension"
        />
        <Text fontSize="sm" color="grey">
          This helps match content to patients with specific conditions
        </Text>
      </FormGroup>
    </Box>
  );
};

export default TemplateEditor;
