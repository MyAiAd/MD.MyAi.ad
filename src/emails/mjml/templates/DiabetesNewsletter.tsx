// src/emails/mjml/templates/DiabetesNewsletter.tsx
import React from 'react';
import {
  MjmlText,
  MjmlSpacer,
  MjmlDivider
} from 'mjml-react';

import { BaseLayout } from '../layouts/BaseLayout';
import { 
  HealthTip, 
  MedicationReminder, 
  HealthMetric,
  AppointmentReminder,
  HealthArticle
} from '../components/HealthComponents';

export interface DiabetesNewsletterProps {
  patientName: string;
  patientFirstName: string;
  providerName?: string;
  providerLogo?: string;
  bloodGlucose?: {
    value: number;
    change?: {
      value: number;
      isPositive: boolean;
    };
  };
  a1c?: {
    value: number;
    change?: {
      value: number;
      isPositive: boolean;
    };
  };
  upcomingAppointment?: {
    doctorName: string;
    specialty?: string;
    date: string;
    time: string;
    location?: string;
    appointmentUrl?: string;
  };
  medications?: Array<{
    name: string;
    dosage: string;
    instructions: string;
    reminderTime?: string;
  }>;
  unsubscribeUrl?: string;
  accentColor?: string;
}

export const DiabetesNewsletter: React.FC<DiabetesNewsletterProps> = ({
  patientName,
  patientFirstName,
  providerName,
  providerLogo,
  bloodGlucose,
  a1c,
  upcomingAppointment,
  medications = [],
  unsubscribeUrl,
  accentColor = '#3b82f6'
}) => {
  return (
    <BaseLayout
      title={`Your Diabetes Health Update for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
      previewText={`${patientFirstName}, check your latest diabetes health metrics and personalized health tips`}
      providerName={providerName}
      providerLogo={providerLogo}
      accentColor={accentColor}
      unsubscribeUrl={unsubscribeUrl}
    >
      {/* Personalized Greeting */}
      {/* @ts-ignore */}
      <MjmlText
        fontSize="16px"
        color="#334155"
        lineHeight="1.5"
      >
        Hello {patientName},
      </MjmlText>
      
      {/* @ts-ignore */}
      <MjmlText
        fontSize="16px"
        color="#334155"
        lineHeight="1.5"
      >
        Here's your personalized diabetes health update for this month. We've included your latest metrics, medication reminders, and helpful tips to support your diabetes management.
      </MjmlText>
      
      {/* @ts-ignore */}
      <MjmlSpacer height="20px" />
      
      {/* Health Metrics Section */}
      {(bloodGlucose || a1c) && (
        <>
          {/* @ts-ignore */}
          <MjmlText
            fontWeight="600"
            fontSize="18px"
            color="#0f172a"
          >
            Your Health Metrics
          </MjmlText>
          
          {bloodGlucose && (
            <HealthMetric
              title="Average Blood Glucose"
              value={bloodGlucose.value}
              unit="mg/dL"
              change={bloodGlucose.change}
              targetRange="70-130 mg/dL before meals"
              accentColor={accentColor}
            />
          )}
          
          {a1c && (
            <HealthMetric
              title="A1C Level"
              value={a1c.value}
              unit="%"
              change={a1c.change}
              targetRange="Less than 7%"
              accentColor={accentColor}
            />
          )}
          
          {/* @ts-ignore */}
          <MjmlSpacer height="20px" />
        </>
      )}
      
      {/* Medication Reminders */}
      {medications.length > 0 && (
        <>
          {/* @ts-ignore */}
          <MjmlText
            fontWeight="600"
            fontSize="18px"
            color="#0f172a"
          >
            Your Medication Reminders
          </MjmlText>
          
          {medications.map((med, index) => (
            <MedicationReminder
              key={index}
              medicationName={med.name}
              dosage={med.dosage}
              instructions={med.instructions}
              reminderTime={med.reminderTime}
              accentColor={accentColor}
            />
          ))}
          
          {/* @ts-ignore */}
          <MjmlSpacer height="20px" />
        </>
      )}
      
      {/* Upcoming Appointment */}
      {upcomingAppointment && (
        <>
          <AppointmentReminder
            doctorName={upcomingAppointment.doctorName}
            specialty={upcomingAppointment.specialty}
            date={upcomingAppointment.date}
            time={upcomingAppointment.time}
            location={upcomingAppointment.location}
            appointmentUrl={upcomingAppointment.appointmentUrl}
            accentColor={accentColor}
          />
          
          {/* @ts-ignore */}
          <MjmlSpacer height="20px" />
        </>
      )}
      
      {/* Health Tips */}
      {/* @ts-ignore */}
      <MjmlText
        fontWeight="600"
        fontSize="18px"
        color="#0f172a"
      >
        Diabetes Management Tips
      </MjmlText>
      
      <HealthTip
        title="Consistent Carb Counting"
        content="Consistent carbohydrate counting at each meal helps maintain steady blood glucose levels throughout the day. Aim for consistent carb intake at each meal based on your individual needs."
        accentColor={accentColor}
      />
      
      <HealthTip
        title="Regular Physical Activity"
        content="Try to get at least 150 minutes of moderate-intensity exercise per week. Even short walks after meals can help manage blood glucose levels."
        accentColor={accentColor}
      />
      
      {/* @ts-ignore */}
      <MjmlSpacer height="20px" />
      
      {/* Recommended Articles */}
      {/* @ts-ignore */}
      <MjmlText
        fontWeight="600"
        fontSize="18px"
        color="#0f172a"
      >
        Recommended Reading
      </MjmlText>
      
      <HealthArticle
        title="Understanding Continuous Glucose Monitoring"
        summary="Learn how continuous glucose monitoring can provide insights into your glucose patterns and help you make informed decisions about your diabetes management."
        articleUrl="https://yourprovider.com/articles/cgm-benefits"
        accentColor={accentColor}
      />
      
      <HealthArticle
        title="Diabetes-Friendly Meal Planning"
        summary="Discover practical tips for creating balanced meals that help manage blood glucose while still enjoying a variety of foods."
        articleUrl="https://yourprovider.com/articles/diabetes-meal-planning"
        accentColor={accentColor}
      />
      
      {/* @ts-ignore */}
      <MjmlSpacer height="20px" />
      
      {/* Closing */}
      {/* @ts-ignore */}
      <MjmlText
        fontSize="16px"
        color="#334155"
        lineHeight="1.5"
      >
        We're here to support your health journey. If you have any questions about this information, please contact our office.
      </MjmlText>
      
      {/* @ts-ignore */}
      <MjmlText
        fontSize="16px"
        color="#334155"
        lineHeight="1.5"
      >
        Best regards,<br />
        Your Healthcare Team
      </MjmlText>
    </BaseLayout>
  );
};
