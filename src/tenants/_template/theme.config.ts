import type { TenantTheme } from '../../core/types/tenant.types';

/**
 * Theme Configuration for [TENANT_NAME]
 *
 * Customize colors, fonts, and layout preferences here.
 */
export const theme: TenantTheme = {
  colors: {
    primary: '#000000', // Main brand color
    secondary: '#666666', // Secondary/accent color
    accent: '#CCCCCC', // Highlight color
    background: '#FFFFFF', // Page background
    text: '#1F2937', // Main text color
    textLight: '#6B7280', // Light text color
  },

  fonts: {
    heading: 'Georgia, serif', // Heading font
    body: 'system-ui, sans-serif', // Body text font
  },

  layout: 'modern', // 'elegant' | 'modern' | 'minimal'
  spacing: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  borderRadius: '8px', // Button/card border radius
  shadowIntensity: 'medium', // 'light' | 'medium' | 'strong'
};
