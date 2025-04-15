// src/admin/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { ApiClient, useCurrentAdmin } from 'adminjs';
import { Box, H2, H4, Text, Illustration, Card, BarChart, Loader } from '@adminjs/design-system';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAdmin] = useCurrentAdmin();
  const api = new ApiClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.getDashboard();
        setData(response.data);
        setLoading(false);
      } catch (e) {
        setError('Could not fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box position="relative">
        <Box bg="white" padding={20} borderRadius="lg" marginBottom={20}>
          <H2>Welcome, {currentAdmin?.firstName || 'Provider'}</H2>
          <Text>Here's an overview of your newsletter platform</Text>
        </Box>
      </Box>

      <Box mt="xl">
        <Box flex flexDirection="row" flexWrap="wrap">
          {/* Summary Cards */}
          <Card title="Total Patients" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.totalPatients || 0}</Text>
          </Card>
          
          <Card title="Active Newsletters" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.activeTemplates || 0}</Text>
          </Card>
          
          <Card title="Campaigns Sent" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.campaignsSent || 0}</Text>
          </Card>
          
          <Card title="Avg. Open Rate" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.avgOpenRate || '0%'}</Text>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Card title="Recent Activity" marginBottom={20}>
          {data?.recentActivity?.length ? (
            <Box>
              {data.recentActivity.map((activity, index) => (
                <Box key={index} paddingY={10} flex flexDirection="row" alignItems="center">
                  <Box width={100}>
                    <Text fontSize="sm" color="grey">{activity.date}</Text>
                  </Box>
                  <Box flex>
                    <Text>{activity.message}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box padding={20} display="flex" justifyContent="center">
              <Text>No recent activity found</Text>
            </Box>
          )}
        </Card>

        {/* Engagement Chart */}
        <Card title="Newsletter Engagement" marginBottom={20}>
          {data?.engagementData ? (
            <Box padding={10} height={300}>
              <BarChart 
                data={data.engagementData} 
                keys={['opens', 'clicks']}
                indexBy="campaign"
                colorBy="index"
                colors={['#0088FE', '#00C49F']}
                padding={0.3}
                layout="vertical"
                enableLabel={false}
                axisLeft={{
                  legend: 'Count',
                  legendPosition: 'middle',
                  legendOffset: -40
                }}
              />
            </Box>
          ) : (
            <Box padding={20} display="flex" justifyContent="center">
              <Text>No engagement data available</Text>
            </Box>
          )}
        </Card>

        {/* Quick Actions */}
        <Box flex flexDirection="row" flexWrap="wrap">
          <Card title="Quick Actions" width={1/2} marginBottom={20}>
            <Box flex flexDirection="column" alignItems="flex-start" padding={10}>
              <Box as="a" href="/admin/resources/Patient/actions/new" mb="lg">
                <button style={{ padding: '8px 16px', backgroundColor: '#0067b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Add New Patient
                </button>
              </Box>
              
              <Box as="a" href="/admin/resources/NewsletterTemplate/actions/new" mb="lg">
                <button style={{ padding: '8px 16px', backgroundColor: '#0067b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Create Newsletter Template
                </button>
              </Box>
              
              <Box as="a" href="/admin/resources/NewsletterCampaign/actions/new">
                <button style={{ padding: '8px 16px', backgroundColor: '#0067b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Start New Campaign
                </button>
              </Box>
            </Box>
          </Card>

          <Card title="Need Help?" width={1/2} marginBottom={20}>
            <Box padding={10}>
              <Text marginBottom={10}>
                Need assistance with your healthcare newsletter platform? Check out our resources:
              </Text>
              
              <Box marginBottom={10}>
                <a href="#documentation" style={{ color: '#0067b8', textDecoration: 'none' }}>
                  📚 Documentation
                </a>
              </Box>
              
              <Box marginBottom={10}>
                <a href="#tutorial" style={{ color: '#0067b8', textDecoration: 'none' }}>
                  🎓 Video Tutorials
                </a>
              </Box>
              
              <Box>
                <a href="#support" style={{ color: '#0067b8', textDecoration: 'none' }}>
                  🛠️ Contact Support
                </a>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

