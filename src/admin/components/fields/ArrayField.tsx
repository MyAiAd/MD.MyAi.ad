// src/admin/components/fields/ArrayField.tsx
import React, { useState } from 'react';
import { Box, Button, FormGroup, FormMessage, Icon, Label } from '@adminjs/design-system';
import { BasePropertyProps } from 'adminjs';
import flat from 'flat';

const { flatten } = flat;

// Define props interface for ArrayField
interface ArrayFieldProps extends BasePropertyProps {
  property: {
    custom?: {
      addLabel?: string;
      fields?: Array<{
        name: string;
        label?: string;
        type?: string;
      }>;
    }; 
    [key: string]: any;
  };
  onChange: (value: any) => void;
  record: Record<string, any>;
}

const ArrayField = (props: ArrayFieldProps) => {
  const { property, onChange, record } = props;
  const { custom } = property;
  
  // Get current value or default to empty array
  const currentValue = record.params[property.path] || [];
  
  // Initialize items state with current value
  const [items, setItems] = useState(currentValue);
  
  // Handle adding a new item
  const handleAddItem = () => {
    const newItems = [...items, {}];
    setItems(newItems);
    onChange(newItems);
  };
  
  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    onChange(newItems);
  };
  
  // Handle changing a field in an item
  const handleItemFieldChange = (itemIndex: number, fieldName: string, value: any) => {
    const newItems = [...items];
    if (!newItems[itemIndex]) { 
      newItems[itemIndex] = {};
    }
    newItems[itemIndex][fieldName] = value;
    setItems(newItems);
    onChange(newItems);
  };
  
  return (
    <FormGroup>
      <Label>{property.label}</Label>
      {items.map((item, index) => (
        <Box 
          key={index} 
          mb="lg" 
          p="md" 
          border="1px solid #e0e0e0" 
          borderRadius="4px"
        >
          <Box display="flex" justifyContent="flex-end">
            <Button 
              variant="text" 
              size="icon" 
              onClick={() => handleRemoveItem(index)}
            >
              <Icon icon="Trash" />
            </Button>
          </Box>
          
          {custom?.fields?.map((field) => (
            <FormGroup key={field.name}>
              <Label>{field.label || field.name}</Label>
              <input 
                type={field.type || 'text'} 
                value={item[field.name] || ''} 
                onChange={(e) => handleItemFieldChange(index, field.name, e.target.value)} 
                className="input-style" // Apply your styling here
              />
            </FormGroup>
          ))}
        </Box>
      ))}
      
      <Button 
        onClick={handleAddItem} 
        mt="md"
      >
        <Icon icon="Add" />
        {custom?.addLabel || 'Add Item'}
      </Button>
      
      {property.description && (
        <FormMessage>{property.description}</FormMessage>
      )}
    </FormGroup>
  );
};

export default ArrayField;
