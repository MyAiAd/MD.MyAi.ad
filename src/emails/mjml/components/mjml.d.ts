// src/emails/mjml/components/mjml.d.ts
import 'mjml-react';
import React from 'react';

// This declaration file extends the mjml-react types to make them compatible with newer React versions
declare module 'mjml-react' {
  import { Component } from 'react';
  
  // Common props shared across components
  interface CommonProps {
    'mjml-class'?: string;
    cssClass?: string;
    children?: React.ReactNode;
  }

  // MjmlSection props
  export interface MjmlSectionProps extends CommonProps {
    backgroundColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    padding?: string;
    borderRadius?: string;
    border?: string;
    borderLeft?: string;
    borderRight?: string;
    borderTop?: string;
    borderBottom?: string;
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    verticalAlign?: 'top' | 'bottom' | 'middle';
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    margin?: string;
    direction?: 'ltr' | 'rtl';
  }

  export interface MjmlColumnProps extends CommonProps {
    width?: string;
    verticalAlign?: 'top' | 'middle' | 'bottom';
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    padding?: string;
  }

  export interface MjmlTextProps extends CommonProps {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    height?: string;
    textDecoration?: string;
    textTransform?: string;
    align?: 'left' | 'right' | 'center' | 'justify';
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    padding?: string;
  }

  export interface MjmlButtonProps extends CommonProps {
    backgroundColor?: string;
    borderRadius?: string;
    border?: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    height?: string;
    lineHeight?: string;
    innerPadding?: string;
    href?: string;
    rel?: string;
    target?: string;
    textAlign?: 'left' | 'right' | 'center';
    textDecoration?: string;
    textTransform?: string;
    title?: string;
    width?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    padding?: string;
  }

  export interface MjmlImageProps extends CommonProps {
    alt?: string;
    href?: string;
    src?: string;
    srcset?: string;
    border?: string;
    borderRadius?: string;
    containerBackgroundColor?: string;
    width?: string;
    height?: string;
    padding?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    align?: 'left' | 'right' | 'center';
    title?: string;
    target?: string;
    rel?: string;
  }

  export interface MjmlDividerProps extends CommonProps {
    borderColor?: string;
    borderStyle?: string;
    borderWidth?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    padding?: string;
    containerBackgroundColor?: string;
    width?: string;
  }

  export interface MjmlSpacerProps extends CommonProps {
    height?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    padding?: string;
    width?: string;
  }

  // Define component classes with proper React Component inheritance
  export class MjmlSection extends Component<MjmlSectionProps> {
    refs: any;
  }
  
  export class MjmlColumn extends Component<MjmlColumnProps> {
    refs: any;
  }
  
  export class MjmlText extends Component<MjmlTextProps> {
    refs: any;
  }
  
  export class MjmlImage extends Component<MjmlImageProps> {
    refs: any;
  }
  
  export class MjmlDivider extends Component<MjmlDividerProps> {
    refs: any;
  }
  
  export class MjmlButton extends Component<MjmlButtonProps> {
    refs: any;
  }
  
  export class MjmlSpacer extends Component<MjmlSpacerProps> {
    refs: any;
  }
}
