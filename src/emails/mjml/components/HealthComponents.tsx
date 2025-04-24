// src/emails/mjml/components/HealthComponents.tsx
import React from 'react';
import {
  Mjml,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlImage,
  MjmlText,
  MjmlDivider,
  MjmlButton,
  MjmlSpacer,
} from 'mjml-react';

// Use @ts-ignore to bypass the TypeScript type checking for the MJML components
// @ts-ignore - MJML React components have type compatibility issues with React 18
// Health Tip Component
export interface HealthTipProps {
  title: string;
  content: string;
  iconUrl?: string;
  accentColor?: string;
}

export const HealthTip: React.FC<HealthTipProps> = ({
  title,
  content,
  iconUrl,
  accentColor = '#3b82f6'
}) => {
  return (
    // @ts-ignore - MJML React components have compatibility issues with React 18
    <MjmlSection
      backgroundColor="#f8fafc"
      borderRadius="8px"
      paddingTop="10px"
      paddingBottom="10px"
      marginTop="10px"
      marginBottom="10px"
    >
      {/* @ts-ignore */}
      <MjmlColumn width="20%" verticalAlign="middle">
        {iconUrl ? (
          // @ts-ignore
          <MjmlImage
            width="50px"
            src={iconUrl}
            alt={title}
            align="center"
          />
        ) : (
          // @ts-ignore
          <MjmlText
            fontSize="24px"
            color={accentColor}
            align="center"
          >
            💡
          </MjmlText>
        )}
      </MjmlColumn>
      {/* @ts-ignore */}
      <MjmlColumn width="80%">
        {/* @ts-ignore */}
        <MjmlText
          fontWeight="600"
          fontSize="16px"
          color="#0f172a"
          paddingBottom="5px"
        >
          {title}
        </MjmlText>
        {/* @ts-ignore */}
        <MjmlText
          fontSize="14px"
          color="#334155"
          lineHeight="1.5"
        >
          {content}
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
};

// Medication Reminder Component
export interface MedicationReminderProps {
  medicationName: string;
  dosage: string;
  instructions: string;
  reminderTime?: string;
  accentColor?: string;
}

export const MedicationReminder: React.FC<MedicationReminderProps> = ({
  medicationName,
  dosage,
  instructions,
  reminderTime,
  accentColor = '#3b82f6'
}) => {
  return (
    // @ts-ignore
    <MjmlSection
      borderLeft={`4px solid ${accentColor}`}
      backgroundColor="#ffffff"
      paddingTop="10px"
      paddingBottom="10px"
      paddingLeft="15px"
      marginTop="15px"
      marginBottom="15px"
    >
      {/* @ts-ignore */}
      <MjmlColumn>
        {/* @ts-ignore */}
        <MjmlText
          fontWeight="600"
          fontSize="16px"
          color="#0f172a"
        >
          {medicationName} - {dosage}
        </MjmlText>
        
        {reminderTime && (
          // @ts-ignore
          <MjmlText
            fontSize="14px"
            color="#64748b"
          >
            <span style={{ fontWeight: 600 }}>Reminder:</span> {reminderTime}
          </MjmlText>
        )}
        
        {/* @ts-ignore */}
        <MjmlText
          fontSize="14px"
          color="#334155"
          lineHeight="1.5"
        >
          {instructions}
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
};

// Health Metric Component
export interface HealthMetricProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  targetRange?: string;
  accentColor?: string;
}

export const HealthMetric: React.FC<HealthMetricProps> = ({
  title,
  value,
  unit = '',
  change,
  targetRange,
  accentColor = '#3b82f6'
}) => {
  const changeColor = change ? (
    change.isPositive ? '#10b981' : '#ef4444'
  ) : accentColor;
  
  const changeSymbol = change ? (
    change.isPositive ? '↑' : '↓'
  ) : '';
  
  return (
    // @ts-ignore
    <MjmlSection
      backgroundColor="#ffffff"
      borderRadius="8px"
      border="1px solid #e2e8f0"
      padding="15px"
      marginTop="10px"
      marginBottom="10px"
    >
      {/* @ts-ignore */}
      <MjmlColumn>
        {/* @ts-ignore */}
        <MjmlText
          fontWeight="600"
          fontSize="14px"
          color="#64748b"
        >
          {title}
        </MjmlText>
        
        {/* @ts-ignore */}
        <MjmlText
          fontWeight="700"
          fontSize="24px"
          color="#0f172a"
          paddingTop="0"
        >
          {value}{unit} 
          {change && (
            <span style={{ fontSize: '16px', color: changeColor, marginLeft: '5px' }}>
              {changeSymbol} {Math.abs(change.value)}{unit}
            </span>
          )}
        </MjmlText>
        
        {targetRange && (
          // @ts-ignore
          <MjmlText
            fontSize="12px"
            color="#64748b"
            paddingTop="0"
          >
            Target range: {targetRange}
          </MjmlText>
        )}
      </MjmlColumn>
    </MjmlSection>
  );
};

// Appointment Reminder Component
export interface AppointmentReminderProps {
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  appointmentUrl?: string;
  accentColor?: string;
}

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
  doctorName,
  specialty,
  date,
  time,
  location,
  notes,
  appointmentUrl,
  accentColor = '#3b82f6'
}) => {
  return (
    // @ts-ignore
    <MjmlSection
      backgroundColor="#f8fafc"
      borderRadius="8px"
      padding="15px"
      marginTop="15px"
      marginBottom="15px"
    >
      {/* @ts-ignore */}
      <MjmlColumn>
        {/* @ts-ignore */}
        <MjmlText
          fontWeight="600"
          fontSize="16px"
          color={accentColor}
        >
          Upcoming Appointment
        </MjmlText>
        
        {/* @ts-ignore */}
        <MjmlText
          fontWeight="600"
          fontSize="14px"
          color="#0f172a"
          paddingBottom="0"
        >
          Dr. {doctorName}{specialty ? `, ${specialty}` : ''}
        </MjmlText>
        
        {/* @ts-ignore */}
        <MjmlText
          fontSize="14px"
          color="#334155"
          paddingTop="5px"
          paddingBottom="5px"
        >
          <strong>Date:</strong> {date}<br />
          <strong>Time:</strong> {time}<br />
          {location && <><strong>Location:</strong> {location}<br /></>}
        </MjmlText>
        
        {notes && (
          // @ts-ignore
          <MjmlText
            fontSize="14px"
            color="#64748b"
            paddingTop="0"
          >
            {notes}
          </MjmlText>
        )}
        
        {appointmentUrl && (
          // @ts-ignore
          <MjmlButton
            backgroundColor={accentColor}
            color="white"
            borderRadius="4px"
            href={appointmentUrl}
            paddingTop="10px"
            width="200px"
          >
            Manage Appointment
          </MjmlButton>
        )}
      </MjmlColumn>
    </MjmlSection>
  );
};

// Health Article Component
export interface HealthArticleProps {
  title: string;
  summary: string;
  imageUrl?: string;
  articleUrl: string;
  accentColor?: string;
}

export const HealthArticle: React.FC<HealthArticleProps> = ({
  title,
  summary,
  imageUrl,
  articleUrl,
  accentColor = '#3b82f6'
}) => {
  return (
    <>
      {/* @ts-ignore */}
      <MjmlDivider borderWidth="1px" borderColor="#e2e8f0" padding="10px 0" />
      {/* @ts-ignore */}
      <MjmlSection padding="0">
        {imageUrl && (
          // @ts-ignore
          <MjmlColumn width="30%" verticalAlign="top">
            {/* @ts-ignore */}
            <MjmlImage
              src={imageUrl}
              alt={title}
              width="100%"
              borderRadius="8px"
            />
          </MjmlColumn>
        )}
        {/* @ts-ignore */}
        <MjmlColumn width={imageUrl ? "70%" : "100%"}>
          {/* @ts-ignore */}
          <MjmlText
            fontWeight="600"
            fontSize="16px"
            color="#0f172a"
            paddingBottom="5px"
          >
            {title}
          </MjmlText>
          {/* @ts-ignore */}
          <MjmlText
            fontSize="14px"
            color="#334155"
            lineHeight="1.5"
            paddingBottom="10px"
          >
            {summary}
          </MjmlText>
          {/* @ts-ignore */}
          <MjmlButton
            backgroundColor="transparent"
            color={accentColor}
            border={`1px solid ${accentColor}`}
            borderRadius="4px"
            href={articleUrl}
            width="120px"
            paddingTop="0"
          >
            Read More
          </MjmlButton>
        </MjmlColumn>
      </MjmlSection>
    </>
  );
};
