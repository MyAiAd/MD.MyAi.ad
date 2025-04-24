// src/emails/components/MedicationReminder.tsx
import React from 'react';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';
import { Html } from '@react-email/html';

type MedicationReminderProps = {
  medicationName: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  imageUrl?: string;
};

export const MedicationReminder: React.FC<MedicationReminderProps> = ({
  medicationName,
  dosage = '',
  frequency = '',
  instructions = '',
  imageUrl,
}) => {
  return (
    <Section style={{ marginBottom: '20px' }}>
      <Container
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '4px',
          padding: '15px',
          border: '1px solid #e2e8f0',
        }}
      >
        <table style={{ width: '100%' }}>
          <tr>
            {imageUrl && (
              <td style={{ width: '80px', verticalAlign: 'top' }}>
                <img
                  src={imageUrl}
                  alt={medicationName}
                  width="60"
                  height="60"
                  style={{ borderRadius: '4px' }}
                />
              </td>
            )}
            <td>
              <Text
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  margin: '0 0 5px 0',
                }}
              >
                {medicationName}
              </Text>
              {dosage && (
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    margin: '0 0 5px 0',
                  }}
                >
                  <strong>Dosage:</strong> {dosage}
                </Text>
              )}
              {frequency && (
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    margin: '0 0 5px 0',
                  }}
                >
                  <strong>Frequency:</strong> {frequency}
                </Text>
              )}
              {instructions && (
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    margin: '0',
                  }}
                >
                  <strong>Instructions:</strong> {instructions}
                </Text>
              )}
            </td>
          </tr>
        </table>
      </Container>
    </Section>
  );
};

export default MedicationReminder;
