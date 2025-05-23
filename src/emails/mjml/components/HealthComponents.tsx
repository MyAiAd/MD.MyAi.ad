// src/emails/mjml/components/HealthComponents.tsx 
import React from 'react';
import {
  MjmlSection,
  MjmlColumn,
  MjmlImage,
  MjmlText,
  MjmlDivider,
  MjmlButton,
  MjmlSpacer
} from 'mjml-react';

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
    // @ts-ignore
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
          fontWeight={600}
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
          fontWeight={600}
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
          fontWeight={600}
          fontSize="14px"
          color="#64748b"
        >
          {title}
        </MjmlText>
        
        {/* @ts-ignore */}
        <MjmlText
          fontWeight={700}
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
  appointmentUrl?: string;
  accentColor?: string;
}

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
  doctorName,
  specialty,
  date,
  time,
  location,
  appointmentUrl,
  accentColor = '#3b82f6'
}) => {
  return (
    // @ts-ignore
    <MjmlSection
      backgroundColor="#ffffff"
      borderRadius="8px"
      border={`2px solid ${accentColor}`}
      padding="15px"
      marginTop="10px"
      marginBottom="10px"
    >
      {/* @ts-ignore */}
      <MjmlColumn width="20%" verticalAlign="middle">
        {/* @ts-ignore */}
        <MjmlText
          fontSize="28px"
          color={accentColor}
          align="center"
        >
          📅
        </MjmlText>
      </MjmlColumn>
      {/* @ts-ignore */}
      <MjmlColumn width="80%">
        {/* @ts-ignore */}
        <MjmlText
          fontWeight={600}
          fontSize="16px"
          color="#0f172a"
        >
          Upcoming Appointment
        </MjmlText>
        
        {/* @ts-ignore */}
        <MjmlText
          fontSize="14px"
          color="#334155"
          lineHeight="1.5"
          paddingBottom="5px"
        >
          Dr. {doctorName}{specialty ? `, ${specialty}` : ''}
          <br />
          {date} at {time}
          {location && (
            <>
              <br />
              Location: {location}
            </>
          )}
        </MjmlText>
        
        {appointmentUrl && (
          // @ts-ignore
          <MjmlButton
            backgroundColor={accentColor}
            color="white"
            borderRadius="4px"
            href={appointmentUrl}
            fontWeight={600}
            fontSize="14px"
            innerPadding="8px 16px"
            align="left"
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
  articleUrl: string;
  imageUrl?: string;
  accentColor?: string;
}

export const HealthArticle: React.FC<HealthArticleProps> = ({
  title,
  summary,
  articleUrl,
  imageUrl,
  accentColor = '#3b82f6'
}) => {
  return (
    // @ts-ignore
    <MjmlSection
      backgroundColor="#ffffff"
      borderRadius="8px"
      padding="15px"
      marginTop="10px"
      marginBottom="10px"
    >
      {imageUrl && (
        // @ts-ignore
        <MjmlColumn width="30%" paddingRight="15px">
          {/* @ts-ignore */}
          <MjmlImage
            width="100%"
            src={imageUrl}
            alt={title}
            borderRadius="4px"
          />
        </MjmlColumn>
      )}
      {/* @ts-ignore */}
      <MjmlColumn width={imageUrl ? "70%" : "100%"}>
        {/* @ts-ignore */}
        <MjmlText
          fontWeight={600}
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
          borderRadius="4px"
          border={`1px solid ${accentColor}`}
          href={articleUrl}
          fontWeight={600}
          fontSize="14px"
          innerPadding="8px 16px"
          align="left"
        >
          Read Article
        </MjmlButton>
      </MjmlColumn>
    </MjmlSection>
  );
};
