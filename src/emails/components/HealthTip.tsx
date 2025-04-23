// src/emails/components/HealthTip.tsx
import React from 'react';
import { Section, Text, Box } from '@react-email/components';

type HealthTipProps = {
  title: string;
  content: string;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
};

export const HealthTip: React.FC<HealthTipProps> = ({
  title,
  content,
  backgroundColor = '#e6f7ff',
  titleColor = '#0067b8',
  textColor = '#2d3748',
}) => {
  return (
    <Section style={{ marginBottom: '20px' }}>
      <Box
        style={{
          backgroundColor,
          borderRadius: '4px',
          padding: '15px',
          borderLeft: `4px solid ${titleColor}`,
        }}
      >
        <Text
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: titleColor,
            margin: '0 0 10px 0',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: textColor,
            margin: 0,
          }}
        >
          {content}
        </Text>
      </Box>
    </Section>
  );
};

export default HealthTip;

