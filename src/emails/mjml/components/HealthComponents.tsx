// src/emails/mjml/components/HealthComponents.tsx 
import React from 'react';
import type { MjmlProps } from 'mjml-react';
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
  // Create props objects explicitly to avoid TypeScript errors
  const sectionProps: MjmlProps = {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    paddingTop: "10px",
    paddingBottom: "10px",
    marginTop: "10px",
    marginBottom: "10px"
  };

  const columnProps1: MjmlProps = {
    width: "20%",
    verticalAlign: "middle"
  };

  const imageProps: MjmlProps = {
    width: "50px",
    src: iconUrl,
    alt: title,
    align: "center"
  };

  const textIconProps: MjmlProps = {
    fontSize: "24px",
    color: accentColor,
    align: "center"
  };

  const columnProps2: MjmlProps = {
    width: "80%"
  };

  const titleTextProps: MjmlProps = {
    fontWeight: "600",
    fontSize: "16px",
    color: "#0f172a",
    paddingBottom: "5px"
  };

  const contentTextProps: MjmlProps = {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.5"
  };

  return (
    <MjmlSection {...sectionProps}>
      <MjmlColumn {...columnProps1}>
        {iconUrl ? (
          <MjmlImage {...imageProps} />
        ) : (
          <MjmlText {...textIconProps}>
            💡
          </MjmlText>
        )}
      </MjmlColumn>
      <MjmlColumn {...columnProps2}>
        <MjmlText {...titleTextProps}>
          {title}
        </MjmlText>
        <MjmlText {...contentTextProps}>
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
  const sectionProps: MjmlProps = {
    borderLeft: `4px solid ${accentColor}`,
    backgroundColor: "#ffffff",
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "15px",
    marginTop: "15px",
    marginBottom: "15px"
  };

  const medicationTextProps: MjmlProps = {
    fontWeight: "600",
    fontSize: "16px",
    color: "#0f172a"
  };

  const reminderTextProps: MjmlProps = {
    fontSize: "14px",
    color: "#64748b"
  };

  const instructionsTextProps: MjmlProps = {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.5"
  };

  return (
    <MjmlSection {...sectionProps}>
      <MjmlColumn>
        <MjmlText {...medicationTextProps}>
          {medicationName} - {dosage}
        </MjmlText>
        
        {reminderTime && (
          <MjmlText {...reminderTextProps}>
            <span style={{ fontWeight: 600 }}>Reminder:</span> {reminderTime}
          </MjmlText>
        )}
        
        <MjmlText {...instructionsTextProps}>
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
  
  const sectionProps: MjmlProps = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    padding: "15px",
    marginTop: "10px",
    marginBottom: "10px"
  };

  const titleTextProps: MjmlProps = {
    fontWeight: "600",
    fontSize: "14px",
    color: "#64748b"
  };

  const valueTextProps: MjmlProps = {
    fontWeight: "700",
    fontSize: "24px",
    color: "#0f172a",
    paddingTop: "0"
  };

  const targetTextProps: MjmlProps = {
    fontSize: "12px",
    color: "#64748b",
    paddingTop: "0"
  };

  return (
    <MjmlSection {...sectionProps}>
      <MjmlColumn>
        <MjmlText {...titleTextProps}>
          {title}
        </MjmlText>
        
        <MjmlText {...valueTextProps}>
          {value}{unit} 
          {change && (
            <span style={{ fontSize: '16px', color: changeColor, marginLeft: '5px' }}>
              {changeSymbol} {Math.abs(change.value)}{unit}
            </span>
          )}
        </MjmlText>
        
        {targetRange && (
          <MjmlText {...targetTextProps}>
            Target range: {targetRange}
          </MjmlText>
        )}
      </MjmlColumn>
    </MjmlSection>
  );
};

// Export other components here as needed
