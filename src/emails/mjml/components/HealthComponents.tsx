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
    <MjmlSection
      backgroundColor="#f8fafc"
      borderRadius="8px"
      paddingTop="10px"
      paddingBottom="10px"
      marginTop="10px"
      marginBottom="10px"
    >
      <MjmlColumn width="20%" verticalAlign="middle">
        {iconUrl ? (
          <MjmlImage
            width="50px"
            src={iconUrl}
            alt={title}
            align="center"
          />
        ) : (
          <MjmlText
            fontSize="24px"
            color={accentColor}
            align="center"
          >
            💡
          </MjmlText>
        )}
      </MjmlColumn>
      <MjmlColumn width="80%">
        <MjmlText
          fontWeight="600"
          fontSize="16px"
          color="#0f172a"
          paddingBottom="5px"
        >
          {title}
        </MjmlText>
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
    <MjmlSection
      borderLeft={`4px solid ${accentColor}`}
      backgroundColor="#ffffff"
      paddingTop="10px"
      paddingBottom="10px"
      paddingLeft="15px"
      marginTop="15px"
      marginBottom="15px"
    >
      <MjmlColumn>
        <MjmlText
          fontWeight="600"
          fontSize="16px"
          color="#0f172a"
        >
          {medicationName} - {dosage}
        </MjmlText>
        
        {reminderTime && (
          <MjmlText
            fontSize="14px"
            color="#64748b"
          >
            <span style={{ fontWeight: 600 }}>Reminder:</span> {reminderTime}
          </MjmlText>
        )}
        
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
    <MjmlSection
      backgroundColor="#ffffff"
      borderRadius="8px"
      border="1px solid #e2e8f0"
      padding="15px"
      marginTop="10px"
      marginBottom="10px"
    >
      <MjmlColumn>
        <MjmlText
          fontWeight="600"
          fontSize="14px"
          color="#64748b"
        >
          {title}
        </MjmlText>
        
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
