// src/emails/templates/GeneralHealthNewsletter.tsx
import React from 'react';
import {
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Img,
  Button,
} from '@react-email/components';
import BaseLayout from '../layouts/BaseLayout';
import HealthTip from '../components/HealthTip';

type GeneralHealthNewsletterProps = {
  patientName: string;
  provider: {
    name: string;
    logo?: string;
    primaryColor?: string;
  };
  healthTips: Array<{
    title: string;
    content: string;
  }>;
  featuredArticles?: Array<{
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
  }>;
  seasonalContent?: {
    title: string;
    content: string;
  };
  unsubscribeUrl: string;
};

export const GeneralHealthNewsletter: React.FC<GeneralHealthNewsletterProps> = ({
  patientName,
  provider,
  healthTips,
  featuredArticles = [],
  seasonalContent,
  unsubscribeUrl,
}) => {
  // Determine the current season for customization
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const currentSeason = getCurrentSeason();

  return (
    <BaseLayout
      title="Your Health Update"
      preview="Your personalized health newsletter"
      providerName={provider.name}
      providerLogo={provider.logo}
      primaryColor={provider.primaryColor || '#0067b8'}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={{ padding: '20px' }}>
        <Heading
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '15px',
          }}
        >
          Hello, {patientName}!
        </Heading>
        
        <Text
          style={{
            fontSize: '16px',
            color: '#4a5568',
            lineHeight: '1.5',
            marginBottom: '20px',
          }}
        >
          We hope this newsletter finds you well. Here's your personalized health update 
          from {provider.name} to help you stay informed and maintain your wellbeing.
        </Text>
        
        {/* Seasonal Content Section */}
        {seasonalContent && (
          <>
            <Heading
              as="h2"
              style={{
                fontSize: '20px',
                color: '#2d3748',
                marginBottom: '15px',
                marginTop: '30px',
              }}
            >
              {seasonalContent.title || `${currentSeason} Health Tips`}
            </Heading>
            
            <Section
              style={{
                backgroundColor: '#f7fafc',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Text
                style={{
                  fontSize: '16px',
                  color: '#4a5568',
                  lineHeight: '1.5',
                  margin: '0',
                }}
              >
                {seasonalContent.content}
              </Text>
            </Section>
          </>
        )}
        
        {/* Health Tips Section */}
        <Heading
          as="h2"
          style={{
            fontSize: '20px',
            color: '#2d3748',
            marginBottom: '15px',
            marginTop: '30px',
          }}
        >
          Health & Wellness Tips
        </Heading>
        
        {healthTips.map((tip, index) => (
          <HealthTip
            key={index}
            title={tip.title}
            content={tip.content}
            backgroundColor={
              index % 3 === 0
                ? '#e6f7ff'
                : index % 3 === 1
                ? '#f0fff4'
                : '#fff5f5'
            }
            titleColor={
              index % 3 === 0
                ? '#0067b8'
                : index % 3 === 1
                ? '#38a169'
                : '#e53e3e'
            }
          />
        ))}
        
        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <>
            <Heading
              as="h2"
              style={{
                fontSize: '20px',
                color: '#2d3748',
                marginBottom: '15px',
                marginTop: '30px',
              }}
            >
              Featured Health Articles
            </Heading>
            
            {featuredArticles.map((article, index) => (
              <Section
                key={index}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                }}
              >
                {article.imageUrl && (
                  <Img
                    src={article.imageUrl}
                    alt={article.title}
                    width="100%"
                    height="auto"
                    style={{ display: 'block', maxHeight: '200px', objectFit: 'cover' }}
                  />
                )}
                
                <Section style={{ padding: '15px' }}>
                  <Heading
                    as="h3"
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1a202c',
                      margin: '0 0 10px 0',
                    }}
                  >
                    {article.title}
                  </Heading>
                  
                  <Text
                    style={{
                      fontSize: '14px',
                      color: '#4a5568',
                      lineHeight: '1.5',
                      margin: '0 0 15px 0',
                    }}
                  >
                    {article.description}
                  </Text>
                  
                  <Link
                    href={article.url}
                    style={{
                      display: 'inline-block',
                      backgroundColor: provider.primaryColor || '#0067b8',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '14px',
                    }}
                  >
                    Read More
                  </Link>
                </Section>
              </Section>
            ))}
          </>
        )}
        
        <Hr style={{ margin: '30px 0', borderColor: '#e2e8f0' }} />
        
        <Text
          style={{
            fontSize: '16px',
            color: '#4a5568',
            lineHeight: '1.5',
            marginBottom: '20px',
          }}
        >
          Remember that your health is a priority. If you have any questions or concerns,
          our healthcare team is always here to help.
        </Text>
        
        <Text
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '10px',
          }}
        >
          Stay well,
        </Text>
        
        <Text
          style={{
            fontSize: '16px',
            color: '#4a5568',
          }}
        >
          The {provider.name} Team
        </Text>
      </Section>
    </BaseLayout>
  );
};

export default GeneralHealthNewsletter;
