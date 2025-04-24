// src/admin/components/patients/BulkImportPatients.tsx
import React, { useState } from 'react';
import { Box, H3, Text, Button, DropZone, Loader, MessageBox } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

// Define response data type
interface ResponseData {
  importedCount?: number;
  [key: string]: any;
}

const BulkImportPatients = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = new ApiClient();
  
  const handleDropZoneChange = (files: File[]) => {
    if (files && files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.resourceAction({
        resourceId: 'Patient',
        actionName: 'bulkImport',
        data: formData,
      });
      
      setResult(response.data);
      setFile(null);
    } catch (e) {
      setError((e as Error).message || 'An error occurred during the import.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Box as="header" marginBottom="xl">
        <H3>Bulk Import Patients</H3>
        <Text>Upload a CSV file to import multiple patients at once.</Text>
      </Box>
      
      {error && (
        <Box marginBottom="xl">
          <MessageBox message={error} variant="danger" />
        </Box>
      )}
      
      {result && (
        <Box marginBottom="xl">
          <MessageBox
            message={`Successfully imported ${result.importedCount || 0} patients.`}
            variant="success"
          />
        </Box>
      )}
      
      <Box marginBottom="xl">
        <DropZone onChange={handleDropZoneChange} />
        {file && (
          <Box marginTop="default">
            <Text>Selected file: {file.name}</Text>
          </Box>
        )}
      </Box>
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            variant="primary"
          >
            {loading ? <Loader /> : 'Upload and Import'}
          </Button>
        </Box>
        
        <Box>
          <a href="/templates/patient-import-template.csv" download>
            <Button variant="text">Download Template</Button>
          </a>
        </Box>
      </Box>
      
      <Box marginTop="xl">
        <H3>Import Guidelines</H3>
        <Text as="ul">
          <li>Use the template provided for correct column structure.</li>
          <li>Required fields: first_name, last_name, email</li>
          <li>For health conditions, medications, and dietary restrictions, separate multiple values with a semicolon (;)</li>
          <li>Dates should be in YYYY-MM-DD format.</li>
          <li>Maximum file size: 5MB</li>
        </Text>
      </Box>
    </Box>
  );
};

export default BulkImportPatients;
