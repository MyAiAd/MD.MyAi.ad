// src/admin/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { ApiClient, useCurrentAdmin } from 'adminjs';
import { Box, H2, H4, Text, Illustration, Loader } from '@adminjs/design-system';

// Use the AdminJS design-system components directly without Card
// We'll create a custom card component inline
const CustomCard = ({ 
  title,
  children,
  width,
  marginBottom
}: { 
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  marginBottom?: number;
}) => {
  return (
    <Box 
      bg="white" 
      padding={20} 
      borderRadius="lg" 
      boxShadow="sm"
      width={width}
      marginBottom={marginBottom || 0}
      marginRight={10}
    >
      {title && <H4 mb="lg">{title}</H4>}
      {children}
    </Box>
  );
};

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
          <CustomCard title="Total Patients" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.totalPatients || 0}</Text>
          </CustomCard>
          
          <CustomCard title="Active Newsletters" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.activeTemplates || 0}</Text>
          </CustomCard>
          
          <CustomCard title="Campaigns Sent" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.campaignsSent || 0}</Text>
          </CustomCard>
          
          <CustomCard title="Avg. Open Rate" width={1/4} marginBottom={20}>
            <Text textAlign="center" fontSize={30}>{data?.stats?.avgOpenRate || '0%'}</Text>
          </CustomCard>
        </Box>

        {/* Recent Activity */}
        <CustomCard title="Recent Activity" marginBottom={20}>
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
        </CustomCard>

        {/* Engagement Chart */}
        <CustomCard title="Newsletter Engagement" marginBottom={20}>
          {data?.engagementData ? (
            <Box padding={10} height={300}>
              {/* Since BarChart from AdminJS might also be an issue, consider commenting it out for now */}
              {/* Render a placeholder message instead */}
              <Text>Engagement chart will be displayed here</Text>
              {/* 
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
              */}
            </Box>
          ) : (
            <Box padding={20} display="flex" justifyContent="center">
              <Text>No engagement data available</Text>
            </Box>
          )}
        </CustomCard>

        {/* Quick Actions */}
        <Box flex flexDirection="row" flexWrap="wrap">
          <CustomCard title="Quick Actions" width={1/2} marginBottom={20}>
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
          </CustomCard>

          <CustomCard title="Need Help?" width={1/2} marginBottom={20}>
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
          </CustomCard>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
