// src/lib/mjml-renderer.ts
import mjml2html from 'mjml';
import { render } from 'mjml-react';
import React from 'react'; // Add this import
import type { ComponentType } from 'react';
import type { MJMLParsingOptions } from 'mjml-core';

/**
 * Options for MJML rendering
 */
export interface MJMLRenderOptions {
  /** MJML parsing options */
  mjmlOptions?: MJMLParsingOptions;
  /** Values to interpolate in the rendered template */
  templateData?: Record<string, any>;
}

/**
 * Renders a React MJML component to HTML
 * 
 * @param Component The React MJML component to render
 * @param props Props to pass to the component
 * @param options Additional rendering options
 * @returns The rendered HTML
 */
export function renderMJMLComponent(
  Component: ComponentType<any>,
  props: Record<string, any> = {},
  options: MJMLRenderOptions = {}
): string {
  // Render the React component to MJML
  const { html, errors } = render(React.createElement(Component, props), options.mjmlOptions || {
    validationLevel: 'soft',
    minify: true,
  });

  // Log any rendering errors for debugging
  if (errors.length > 0) {
    console.error('MJML rendering errors:', errors);
  }

  return html;
}

/**
 * Renders raw MJML markup to HTML
 * 
 * @param mjmlContent Raw MJML markup
 * @param options MJML parsing options
 * @returns The rendered HTML
 */
export function renderMJMLMarkup(
  mjmlContent: string,
  options: MJMLParsingOptions = {}
): string {
  const result = mjml2html(mjmlContent, {
    validationLevel: 'soft',
    minify: true,
    ...options,
  });

  // Log any rendering errors for debugging
  if (result.errors.length > 0) {
    console.error('MJML rendering errors:', result.errors);
  }

  return result.html;
}

/**
 * Processes a template string by interpolating values
 * 
 * @param template The template string with placeholders like {{variable}}
 * @param data The data object with values to interpolate
 * @returns The processed string
 */
export function processTemplate(
  template: string,
  data: Record<string, any> = {}
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = key.split('.').reduce((obj, prop) => obj?.[prop], data);
    return value !== undefined ? String(value) : '';
  });
}
