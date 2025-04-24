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
    // @ts-ignore
    <Mjml>
      {/* @ts-ignore */}
      <MjmlHead>
        {/* @ts-ignore */}
        <MjmlTitle>{title}</MjmlTitle>
        {/* @ts-ignore */}
        <MjmlPreview>{previewText}</MjmlPreview>
        {/* @ts-ignore */}
        <MjmlFont name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        {/* @ts-ignore */}
        <MjmlAttributes>
          {/* @ts-ignore */}
          <MjmlAll fontFamily="Inter, Arial, sans-serif" />
        </MjmlAttributes>
      </MjmlHead>

      {/* @ts-ignore */}
      <MjmlBody backgroundColor="#f8fafc">
        {/* Header */}
        {/* @ts-ignore */}
        <MjmlWrapper padding="20px">
          {/* @ts-ignore */}
          <MjmlSection backgroundColor="#ffffff" borderRadius="8px" paddingTop="20px">
            {/* @ts-ignore */}
            <MjmlColumn>
              {providerLogo && (
                // @ts-ignore
                <MjmlImage
                  width="180px"
                  src={providerLogo}
                  alt={providerName}
                  align="center"
                  padding="10px 0"
                />
              )}
              {!providerLogo && (
                // @ts-ignore
                <MjmlText
                  fontWeight={700}
                  fontSize="24px"
                  color={accentColor}
                  align="center"
                  padding="10px 0"
                >
                  {providerName}
                </MjmlText>
              )}
              {/* @ts-ignore */}
              <MjmlText
                fontWeight={600}
                fontSize="18px"
                color="#0f172a"
                align="center"
              >
                {title}
              </MjmlText>
              {/* @ts-ignore */}
              <MjmlSpacer height="10px" />
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>

        {/* Main Content */}
        {/* @ts-ignore */}
        <MjmlWrapper padding="0 20px">
          {/* @ts-ignore */}
          <MjmlSection backgroundColor="#ffffff" borderRadius="8px" padding="20px">
            {/* @ts-ignore */}
            <MjmlColumn>
              {children}
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>

        {/* Footer */}
        {/* @ts-ignore */}
        <MjmlWrapper padding="20px">
          {/* @ts-ignore */}
          <MjmlSection backgroundColor="#f1f5f9" borderRadius="8px" padding="20px">
            {/* @ts-ignore */}
            <MjmlColumn>
              {/* @ts-ignore */}
              <MjmlText
                fontSize="12px"
                color="#64748b"
                align="center"
              >
                {providerName}
                <br />
                {providerAddress}
              </MjmlText>
              {/* @ts-ignore */}
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
              {/* @ts-ignore */}
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
