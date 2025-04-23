// src/emails/templates/DiabetesNewsletter.tsx
import React from 'react';
import {
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Img,
} from '@react-email/components';
import BaseLayout from '../layouts/BaseLayout';
import HealthTip from '../components/HealthTip';
import MedicationReminder from '../components/MedicationReminder';
import HealthMetric from '../components/HealthMetric';

type DiabetesNewsletterProps = {
  patientName: string;
  provider: {
    name: string;
    logo?: string;
    primaryColor?: string;
  };
  lastA1c?: number;
  latestBloodGlucose?: number;
  medications?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
  }>;
  nextAppointment?: string;
  unsubscribeUrl: string;
};

export const DiabetesNewsletter: React.FC<DiabetesNewsletterProps> = ({
  patientName,
  provider,
  lastA1c,
  latestBloodGlucose,
  medications = [],
  nextAppointment,
  unsubscribeUrl,
}) => {
  return (
    <BaseLayout
      title="Your Diabetes Health Update"
      preview="Your personalized diabetes health newsletter"
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
          Here's your personalized diabetes health update from {provider.name}. 
          We've compiled important information to help you manage your diabetes effectively.
        </Text>
        
        {/* Health Metrics Section */}
        {(lastA1c || latestBloodGlucose) && (
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
              Your Health Metrics
            </Heading>
            
            {lastA1c && (
              <HealthMetric
                title="Last HbA1c Reading"
                value={lastA1c}
                unit="%"
                interpretation={
                  lastA1c < 7
                    ? 'Excellent control!'
                    : lastA1c < 8
                    ? 'Good control - keep it up!'
                    : 'Let\'s work on improving this number'
                }
                isGood={lastA1c < 8}
              />
            )}
            
            {latestBloodGlucose && (
              <HealthMetric
                title="Recent Blood Glucose"
                value={latestBloodGlucose}
                unit="mg/dL"
                interpretation={
                  latestBloodGlucose < 130
                    ? 'Within target range'
                    : 'Above target range'
                }
                isGood={latestBloodGlucose < 130}
              />
            )}
          </>
        )}
        
        {/* Medication Reminders */}
        {medications.length > 0 && (
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
              Your Medication Reminders
            </Heading>
            
            {medications.map((med, index) => (
              <MedicationReminder
                key={index}
                medicationName={med.name}
                dosage={med.dosage}
                frequency={med.frequency}
                instructions={med.instructions}
              />
            ))}
          </>
        )}
        
        {/* Health Tips */}
        <Heading
          as="h2"
          style={{
            fontSize: '20px',
            color: '#2d3748',
            marginBottom: '15px',
            marginTop: '30px',
          }}
        >
          Diabetes Management Tips
        </Heading>
        
        <HealthTip
          title="Blood Sugar Monitoring"
          content="Remember to check your blood sugar regularly as recommended by your healthcare provider. Keep a log of your readings to share at your next appointment."
        />
        
        <HealthTip
          title="Physical Activity"
          content="Aim for at least 30 minutes of moderate exercise most days of the week. Even short walks after meals can help manage blood sugar levels."
          backgroundColor="#f0fff4"
          titleColor="#38a169"
        />
        
        <HealthTip
          title="Healthy Eating"
          content="Focus on fiber-rich foods, healthy fats, and lean proteins. Limit refined carbohydrates and monitor portion sizes to help maintain stable blood sugar levels."
          backgroundColor="#fff5f5"
          titleColor="#e53e3e"
        />
        
        {/* Next Appointment Reminder */}
        {nextAppointment && (
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
              Your Next Appointment
            </Heading>
            
            <Section
              style={{
                backgroundColor: '#ebf8ff',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '20px',
              }}
            >
              <Text
                style={{
                  fontSize: '16px',
                  color: '#2c5282',
                  margin: '0',
                }}
              >
                Your next appointment is scheduled for:
                <br />
                <strong>{nextAppointment}</strong>
              </Text>
              
              <Link
                href="#schedule"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#3182ce',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  marginTop: '10px',
                  fontSize: '14px',
                }}
              >
                Confirm or Reschedule
              </Link>
            </Section>
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
          We're here to support your health journey. If you have any questions or concerns,
          please don't hesitate to reach out to your healthcare team.
        </Text>
        
        <Text
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '10px',
          }}
        >
          
