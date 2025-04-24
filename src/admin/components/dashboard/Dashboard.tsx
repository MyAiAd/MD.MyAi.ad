// src/admin/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Box, Loader, Text, Button, H2, H4 } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

// Define the dashboard data type
interface DashboardData {
  providers?: number;
  patients?: number;
  newsletters?: number;
  campaigns?: number;
  recentCampaigns?: Array<{
    id: string;
    name: string;
    sent_at: string;
    opened: number;
    clicked: number;
  }>;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  // Use proper typing for data state
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const api = new ApiClient();
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getDashboard();
      // Cast response.data to DashboardData to satisfy TypeScript
      setData(response.data as DashboardData);
      setLoading(false);
    } catch (e) {
      setError('Could not fetch dashboard data');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Box  
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
      >
        <Loader />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Text color="error">{error}</Text>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <H2>Healthcare Newsletter Dashboard</H2>
      
      <Box 
        mt="lg" 
        display="flex" 
        justifyContent="space-between" 
        flexWrap="wrap"
      >
        <Box 
          width={['100%', '100%', '23%']} 
          backgroundColor="white" 
          p="lg" 
          boxShadow="card" 
          mb="lg"
        >
          <H4>Providers</H4>
          <Text fontSize="xl" fontWeight="bold">{data?.providers || 0}</Text>
        </Box>
        
        <Box 
          width={['100%', '100%', '23%']} 
          backgroundColor="white" 
          p="lg" 
          boxShadow="card" 
          mb="lg"
        >
          <H4>Patients</H4>
          <Text fontSize="xl" fontWeight="bold">{data?.patients || 0}</Text>
        </Box>
        
        <Box 
          width={['100%', '100%', '23%']} 
          backgroundColor="white" 
          p="lg" 
          boxShadow="card" 
          mb="lg"
        >
          <H4>Newsletters</H4>
          <Text fontSize="xl" fontWeight="bold">{data?.newsletters || 0}</Text>
        </Box>
        
        <Box 
          width={['100%', '100%', '23%']} 
          backgroundColor="white" 
          p="lg" 
          boxShadow="card" 
          mb="lg"
        >
          <H4>Campaigns</H4>
          <Text fontSize="xl" fontWeight="bold">{data?.campaigns || 0}</Text>
        </Box>
      </Box>
      
      <Box mt="xl">
        <H4>Recent Campaigns</H4>
        {data?.recentCampaigns && data.recentCampaigns.length > 0 ? (
          <Box 
            overflow="auto" 
            backgroundColor="white" 
            p="lg" 
            boxShadow="card"
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Campaign</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Sent Date</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #eee' }}>Opens</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #eee' }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCampaigns.map(campaign => (
                  <tr key={campaign.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{campaign.name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Date(campaign.sent_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #eee' }}>{campaign.opened}</td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #eee' }}>{campaign.clicked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Box backgroundColor="white" p="lg" boxShadow="card">
            <Text>No campaigns sent yet.</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
