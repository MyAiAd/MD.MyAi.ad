// src/emails/layouts/BaseLayout.tsx
import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Row,
  Column,
  Img,
  Link,
  Font,
} from '@react-email/components';

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
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <Font
          Stay healthy,
        </Text>
        
        <Text
          style={{
            fontSize: '16px',
            color: '#4a5568',
          }}
        >
          The {provider.name} Team
        </Text>
      </Section>
    </BaseLayout>
  );
};

export default DiabetesNewsletter;

