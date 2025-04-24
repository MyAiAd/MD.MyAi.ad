// src/types/mjml-react.d.ts
import React from 'react';

declare module 'mjml-react' {
  // Redeclare all the MJML components as functional components
  // This approach bypasses the class component type issues
  
  export interface MjmlProps {
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export const Mjml: React.FC<MjmlProps>;
  export const MjmlHead: React.FC<MjmlProps>;
  export const MjmlTitle: React.FC<MjmlProps>;
  export const MjmlPreview: React.FC<MjmlProps>;
  export const MjmlBody: React.FC<MjmlProps>;
  export const MjmlSection: React.FC<MjmlProps>;
  export const MjmlColumn: React.FC<MjmlProps>;
  export const MjmlButton: React.FC<MjmlProps>;
  export const MjmlImage: React.FC<MjmlProps>;
  export const MjmlText: React.FC<MjmlProps>;
  export const MjmlDivider: React.FC<MjmlProps>;
  export const MjmlSpacer: React.FC<MjmlProps>;
  export const MjmlWrapper: React.FC<MjmlProps>;
  export const MjmlAttributes: React.FC<MjmlProps>;
  export const MjmlAll: React.FC<MjmlProps>;
  export const MjmlClass: React.FC<MjmlProps>;
  export const MjmlHero: React.FC<MjmlProps>;
  export const MjmlNavbar: React.FC<MjmlProps>;
  export const MjmlNavbarLink: React.FC<MjmlProps>;
  export const MjmlGroup: React.FC<MjmlProps>;
  export const MjmlRaw: React.FC<MjmlProps>;
  export const MjmlTable: React.FC<MjmlProps>;
  export const MjmlStyle: React.FC<MjmlProps>;
  export const MjmlFont: React.FC<MjmlProps>;
  
  export function render(email: React.ReactElement, options?: any): { html: string, errors: any[] };
}
