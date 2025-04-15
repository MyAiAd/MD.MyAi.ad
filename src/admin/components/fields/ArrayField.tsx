// src/admin/components/fields/ArrayField.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Icon, Input, Label } from '@adminjs/design-system';
import { flat } from 'adminjs';

const { flatten } = flat;

const ArrayField = (props) => {
  const { property, onChange, record } = props;
  const { custom } = property;
  
  // Get array from record or initialize empty
  const propertyPath = `params.${property.path}`;
  const values = flatten.get(record?.params, property.path) || [];
  
  const [items, setItems] = useState(values);
  const [newItem, setNewItem] = useState('');
  
  useEffect(() => {
    onChange(propertyPath, items);
  }, [items]);
  
  const handleAdd = () => {
    if (newItem.trim() !== '') {
      const updatedItems = [...items, newItem.trim()];
      setItems(updatedItems);
      setNewItem('');
    }
  };
  
  const handleRemove = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  
  return (
    <Box>
      <Label>{property.label}</Label>
      
      {/* List of current items */}
      <Box mb="lg">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Box key={index} flex flexDirection="row" alignItems="center" mb="sm">
              <Box flex="1">
                <Input type="text" value={item} disabled />
              </Box>
              <Box ml="sm">
                <Button size="icon" rounded variant="danger" onClick={() => handleRemove(index)}>
                  <Icon icon="Trash" />
                </Button>
              </Box>
            </Box>
          ))
        ) : (
          <Box mb="lg">
            <small>No items added yet.</small>
          </Box>
        )}
      </Box>
      
      {/* Add new item */}
      <Box flex flexDirection="row" alignItems="center">
        <Box flex="1">
          <Input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Add new ${property.label.toLowerCase()}`}
          />
        </Box>
        <Box ml="sm">
          <Button size="sm" onClick={handleAdd}>Add</Button>
        </Box>
      </Box>
      
      {property.description && (
        <Box mt="sm">
          <small>{property.description}</small>
        </Box>
      )}
    </Box>
  );
};

export default ArrayField;

