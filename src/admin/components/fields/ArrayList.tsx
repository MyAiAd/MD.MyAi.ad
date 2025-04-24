// src/admin/components/fields/ArrayList.tsx
import React from 'react'; 
import { BasePropertyProps, PropertyJSON, RecordJSON } from 'adminjs';
import { Box, Text } from '@adminjs/design-system';

// Define interface for array items
interface ArrayItem {
  [key: string]: any;
}

// Define the props interface for the ArrayList component
interface ArrayListProps extends BasePropertyProps {
  property: PropertyJSON & {
    custom?: {
      fields?: Array<{
        name: string;
        label?: string;
      }>;
    };
  }; 
  record: RecordJSON;
}

const ArrayList: React.FC<ArrayListProps> = (props) => {
  const { property, record } = props;
  const { custom } = property;
  
  // Get the array value from the record
  const value = record.params[property.path] || [];
  
  // If there are no items, show a placeholder message
  if (!value.length) {
    return <Text>No items</Text>;
  }
  
  return (
    <Box>
      {value.map((item: ArrayItem, index: number) => (
        <Box 
          key={index} 
          mb="sm" 
          p="sm" 
          border="1px solid #e0e0e0" 
          borderRadius="4px"
        >
          {custom?.fields ? (
            // If we have defined fields, display them in a structured format
            custom.fields.map((field) => (
              <Box key={field.name} mb="xs">
                <Text fontWeight="bold">{field.label || field.name}:</Text>
                <Text>{item[field.name] || '-'}</Text>
              </Box>
            ))
          ) : (
            // If no fields defined, just show a simple representation
            <pre>{JSON.stringify(item, null, 2)}</pre>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ArrayList;
