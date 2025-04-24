// src/emails/layouts/BaseLayout.tsx
import React from 'react';
import { Html } from '@react-email/html';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Container } from '@react-email/container';

type BaseLayoutProps = {
  children: React.ReactNode;
  title?: string;
  preview?: string;
  providerName?: string;
  providerLogo?: string;
  primaryColor?: string;
  accentColor?: string;
  footerText?: string;
  unsubscribeUrl?: string;
  viewInBrowserUrl?: string;
};

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  title = 'Healthcare Newsletter',
  preview = 'Your personalized health updates',
  providerName = 'Healthcare Provider',
  providerLogo,
  primaryColor = '#0067b8',
  accentColor = '#f3f4f6',
  footerText = 'This newsletter was personalized based on your health information.',
  unsubscribeUrl = '#unsubscribe',
  viewInBrowserUrl = '#view-in-browser',
}) => {
  return (
    <Html>
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body style={{ 
        margin: '0', 
        padding: '0', 
        width: '100%', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
      }}>
        {viewInBrowserUrl && (
          <Container style={{ textAlign: 'center', color: '#718096', fontSize: '12px', padding: '10px 0' }}>
            <a href={viewInBrowserUrl} style={{ color: '#718096', textDecoration: 'underline' }}>
              View in browser
            </a>
          </Container>
        )}
        
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Section style={{ padding: '20px', backgroundColor: '#ffffff' }}>
            {providerLogo && (
              <div style={{ marginBottom: '20px' }}>
                <img src={providerLogo} alt={providerName} style={{ maxHeight: '50px', maxWidth: '200px' }} />
              </div>
            )}
            
            {children}
            
            <Section style={{ borderTop: `1px solid ${accentColor}`, paddingTop: '20px', marginTop: '30px' }}>
              <Text style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                {footerText}
              </Text>
              
              {unsubscribeUrl && (
                <Text style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                  <a href={unsubscribeUrl} style={{ color: '#a0aec0', textDecoration: 'underline' }}>
                    Unsubscribe
                  </a>
                  {' or '}
                  <a href="#update-preferences" style={{ color: '#a0aec0', textDecoration: 'underline' }}>
                    Update preferences
                  </a>
                </Text>
              )}
              
              <Text style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                © {new Date().getFullYear()} {providerName}. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </body>
    </Html>
  );
};

export default BaseLayout;
