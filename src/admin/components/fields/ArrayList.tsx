// src/admin/components/fields/ArrayList.tsx
import React from 'react';
import { Box, Label, Badge } from '@adminjs/design-system';
import { flat } from 'adminjs';

const { flatten } = flat;

const ArrayList = (props) => {
  const { property, record } = props;
  
  // Get array from record
  const values = flatten.get(record?.params, property.path) || [];
  
  return (
    <Box>
      <Label>{property.label}</Label>
      
      <Box>
        {values.length > 0 ? (
          <Box>
            {values.map((value, index) => (
              <Badge key={index} m="2px" variant="info">{value}</Badge>
            ))}
          </Box>
        ) : (
          <Box>
            <small>None</small>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ArrayList;
