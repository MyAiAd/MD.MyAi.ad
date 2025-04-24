// src/types/mjml-react.d.ts
import React from 'react';

declare module 'mjml-react' {
  // Generic prop interfaces
  export interface BorderProps {
    border?: string;
    borderBottom?: string;
    borderLeft?: string;
    borderRight?: string;
    borderTop?: string;
  }

  export interface PaddingProps {
    padding?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    paddingTop?: string;
  }

  export interface ClassNameProps {
    cssClass?: string;
  }

  export interface MjmlBaseProps {
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: {
      __html: string;
    };
    [key: string]: any;
  }

  // Component-specific props
  export interface MjmlProps extends MjmlBaseProps {}
  export interface MjmlHeadProps extends MjmlBaseProps {}
  export interface MjmlTitleProps extends MjmlBaseProps {}
  export interface MjmlPreviewProps extends MjmlBaseProps {}
  export interface MjmlBodyProps extends MjmlBaseProps {}
  
  export interface MjmlSectionProps extends MjmlBaseProps, BorderProps, PaddingProps, ClassNameProps {
    backgroundColor?: string;
    backgroundUrl?: string;
    backgroundRepeat?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    borderRadius?: string;
    fullWidth?: boolean;
    direction?: 'ltr' | 'rtl';
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    verticalAlign?: 'top' | 'bottom' | 'middle';
  }
  
  export interface MjmlColumnProps extends MjmlBaseProps {
    backgroundColor?: string;
    borderRadius?: string;
    width?: string | number;
    verticalAlign?: 'top' | 'bottom' | 'middle';
  }
  
  export interface MjmlButtonProps extends MjmlBaseProps {
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    borderRadius?: string;
    color?: string;
    fontSize?: string | number;
    fontStyle?: string;
    fontWeight?: string | number;
    height?: string | number;
    href?: string;
    innerPadding?: string;
    lineHeight?: string | number;
    padding?: string;
    rel?: string;
    target?: string;
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    textDecoration?: string;
    textTransform?: string;
    verticalAlign?: 'top' | 'bottom' | 'middle';
    width?: string | number;
  }
  
  export interface MjmlImageProps extends MjmlBaseProps {
    alt?: string;
    align?: 'left' | 'center' | 'right';
    border?: string;
    borderRadius?: string;
    containerBackground?: string;
    fluid?: boolean;
    height?: string | number;
    href?: string;
    padding?: string;
    rel?: string;
    src: string;
    srcset?: string;
    target?: string;
    title?: string;
    width?: string | number;
  }
  
  export interface MjmlTextProps extends MjmlBaseProps {
    align?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    fontFamily?: string;
    fontSize?: string | number;
    fontStyle?: string;
    fontWeight?: string | number;
    letterSpacing?: string | number;
    lineHeight?: string | number;
    padding?: string;
    textDecoration?: string;
    textTransform?: string;
  }
  
  export interface MjmlDividerProps extends MjmlBaseProps {
    borderColor?: string;
    borderStyle?: string;
    borderWidth?: string | number;
    containerBackground?: string;
    padding?: string;
    width?: string | number;
  }
  
  export interface MjmlSpacerProps extends MjmlBaseProps {
    containerBackground?: string;
    height?: string | number;
    padding?: string;
    width?: string | number;
  }

  // Component declarations as functions
  export const Mjml: React.ComponentType<MjmlProps>;
  export const MjmlHead: React.ComponentType<MjmlHeadProps>;
  export const MjmlTitle: React.ComponentType<MjmlTitleProps>;
  export const MjmlPreview: React.ComponentType<MjmlPreviewProps>;
  export const MjmlBody: React.ComponentType<MjmlBodyProps>;
  export const MjmlSection: React.ComponentType<MjmlSectionProps>;
  export const MjmlColumn: React.ComponentType<MjmlColumnProps>;
  export const MjmlButton: React.ComponentType<MjmlButtonProps>;
  export const MjmlImage: React.ComponentType<MjmlImageProps>;
  export const MjmlText: React.ComponentType<MjmlTextProps>;
  export const MjmlDivider: React.ComponentType<MjmlDividerProps>;
  export const MjmlSpacer: React.ComponentType<MjmlSpacerProps>;
  export const MjmlWrapper: React.ComponentType<MjmlBaseProps>;
  export const MjmlAttributes: React.ComponentType<MjmlBaseProps>;
  export const MjmlAll: React.ComponentType<MjmlBaseProps>;
  export const MjmlClass: React.ComponentType<MjmlBaseProps>;
  export const MjmlHero: React.ComponentType<MjmlBaseProps>;
  export const MjmlNavbar: React.ComponentType<MjmlBaseProps>;
  export const MjmlNavbarLink: React.ComponentType<MjmlBaseProps>;
  export const MjmlGroup: React.ComponentType<MjmlBaseProps>;
  export const MjmlRaw: React.ComponentType<MjmlBaseProps>;
  export const MjmlTable: React.ComponentType<MjmlBaseProps>;
  export const MjmlStyle: React.ComponentType<MjmlBaseProps>;
  export const MjmlFont: React.ComponentType<MjmlBaseProps>;
  
  export function render(email: React.ReactElement, options?: any): { html: string, errors: any[] };
}
