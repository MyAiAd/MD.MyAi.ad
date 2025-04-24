// src/types/mjml-react.d.ts
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mj-section': any;
      'mj-column': any;
      'mj-text': any;
      'mj-button': any;
      'mj-divider': any;
      'mj-spacer': any;
      'mj-image': any;
      'mj-wrapper': any;
      'mj-attributes': any;
      'mj-all': any;
      'mj-class': any;
      'mj-hero': any;
      'mj-navbar': any;
      'mj-navbar-link': any;
      'mj-group': any;
      'mj-raw': any;
      'mj-table': any;
      'mj-style': any;
      'mj-font': any;
      'mjml': any;
      'mj-head': any;
      'mj-title': any;
      'mj-preview': any;
      'mj-body': any;
    }
  }
}

declare module 'mjml-react' {
  export const render: (email: React.ReactElement, options?: any) => { html: string, errors: any[] };

  // Use any for the MJML components to bypass TypeScript's strict JSX checking
  export const Mjml: any;
  export const MjmlHead: any;
  export const MjmlTitle: any;
  export const MjmlPreview: any;
  export const MjmlBody: any;
  export const MjmlSection: any;
  export const MjmlColumn: any;
  export const MjmlButton: any;
  export const MjmlImage: any;
  export const MjmlText: any;
  export const MjmlDivider: any;
  export const MjmlSpacer: any;
  export const MjmlWrapper: any;
  export const MjmlAttributes: any;
  export const MjmlAll: any;
  export const MjmlClass: any;
  export const MjmlHero: any;
  export const MjmlNavbar: any;
  export const MjmlNavbarLink: any;
  export const MjmlGroup: any;
  export const MjmlRaw: any;
  export const MjmlTable: any;
  export const MjmlStyle: any;
  export const MjmlFont: any;
}
