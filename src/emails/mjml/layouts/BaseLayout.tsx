// src/emails/mjml/layouts/BaseLayout.tsx
import React, { ReactNode } from 'react';
import {
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlFont,
  MjmlAttributes,
  MjmlAll,
  MjmlBody,
  MjmlWrapper,
  MjmlSection,
  MjmlColumn,
  MjmlImage,
  MjmlText,
  MjmlSpacer
} from 'mjml-react';

export interface BaseLayoutProps {
  title: string;
  previewText: string;
  providerName?: string;
  providerLogo?: string;
  providerAddress?: string;
  children: ReactNode;
  accentColor?: string;
  unsubscribeUrl?: string;
}

/**
 * Base layout for all healthcare newsletters
 */
export const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  previewText,
  providerName = 'Your Healthcare Provider',
  providerLogo,
  providerAddress = '123 Medical Center Dr, Healthville, CA 90000',
  children,
  accentColor = '#3b82f6', // Default blue accent
  unsubscribeUrl = '{{unsubscribeUrl}}'
}) => {
  return (
    <Mjml>
      <MjmlHead>
        <MjmlTitle>{title}</MjmlTitle>
        <MjmlPreview>{previewText}</MjmlPreview>
        <MjmlFont name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <MjmlAttributes>
          <MjmlAll fontFamily="Inter, Arial, sans-serif" />
        </MjmlAttributes>
      </MjmlHead>

      <MjmlBody backgroundColor="#f8fafc">
        {/* Header */}
        <MjmlWrapper padding="20px">
          <MjmlSection backgroundColor="#ffffff" borderRadius="8px" paddingTop="20px">
            <MjmlColumn>
              {providerLogo && (
                <MjmlImage
                  width="180px"
                  src={providerLogo}
                  alt={providerName}
                  align="center"
                  padding="10px 0"
                />
              )}
              {!providerLogo && (
                <MjmlText
                  fontWeight="700"
                  fontSize="24px"
                  color={accentColor}
                  align="center"
                  padding="10px 0"
                >
                  {providerName}
                </MjmlText>
              )}
              <MjmlText
                fontWeight="600"
                fontSize="18px"
                color="#0f172a"
                align="center"
              >
                {title}
              </MjmlText>
              <MjmlSpacer height="10px" />
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>

        {/* Main Content */}
        <MjmlWrapper padding="0 20px">
          <MjmlSection backgroundColor="#ffffff" borderRadius="8px" padding="20px">
            <MjmlColumn>
              {children}
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>

        {/* Footer */}
        <MjmlWrapper padding="20px">
          <MjmlSection backgroundColor="#f1f5f9" borderRadius="8px" padding="20px">
            <MjmlColumn>
              <MjmlText
                fontSize="12px"
                color="#64748b"
                align="center"
              >
                {providerName}
                <br />
                {providerAddress}
              </MjmlText>
              <MjmlText
                fontSize="12px"
                color="#64748b"
                align="center"
              >
                This email contains important health information specifically for you.
                <br />
                <a href={unsubscribeUrl} style={{ color: '#64748b', textDecoration: 'underline' }}>
                  Update your preferences or unsubscribe
                </a>
              </MjmlText>
              <MjmlText
                fontSize="12px"
                color="#64748b"
                align="center"
              >
                © {new Date().getFullYear()} {providerName}. All rights reserved.
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>
      </MjmlBody>
    </Mjml>
  );
};
