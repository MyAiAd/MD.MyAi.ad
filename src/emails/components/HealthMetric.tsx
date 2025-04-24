// src/emails/components/HealthMetric.tsx
// test comment
import React from 'react';
import { Section } from '@react-email/section'; 
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';

type HealthMetricProps = {
  title: string;
  value: string | number;
  unit?: string;
  interpretation?: string;
  isGood?: boolean;
};

export const HealthMetric: React.FC<HealthMetricProps> = ({
  title,
  value,
  unit = '',
  interpretation = '',
  isGood = true,
}) => {
  // Determine color based on whether the metric is good or not
  const statusColor = isGood ? '#48bb78' : '#f56565';

  return (
    <Section style={{ marginBottom: '15px' }}>
      <Container
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          padding: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <Text
          style={{
            fontSize: '14px',
            color: '#4a5568',
            margin: '0 0 5px 0',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1a202c',
            margin: '0 0 5px 0',
          }}
        >
          {value}
          {unit && <span style={{ fontSize: '14px' }}> {unit}</span>}
          {' '}
          <span
            style={{
              fontSize: '14px',
              color: statusColor,
              fontWeight: 'normal',
            }}
          >
            {isGood ? '✓' : '⚠️'}
          </span>
        </Text>
        {interpretation && (
          <Text
            style={{
              fontSize: '12px',
              color: '#718096',
              margin: '0',
              fontStyle: 'italic',
            }}
          >
            {interpretation}
          </Text>
        )}
      </Container>
    </Section>
  );
};

export default HealthMetric;
