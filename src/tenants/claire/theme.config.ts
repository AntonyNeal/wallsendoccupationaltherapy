import type { TenantTheme } from '../../core/types/tenant.types';

/**
 * Theme Configuration for Claire Hamilton
 *
 * Elegant rose/pink palette with sophisticated typography
 */
export const theme: TenantTheme = {
  colors: {
    primary: '#BE185D', // Rose-700 (main brand color)
    secondary: '#9F1239', // Rose-800 (deeper rose)
    accent: '#FDA4AF', // Rose-300 (soft pink accent)
    background: '#FFFFFF', // White background
    text: '#1F2937', // Gray-900 (main text)
    textLight: '#6B7280', // Gray-500 (light text)
  },

  fonts: {
    heading: '"Playfair Display", Georgia, serif',
    body: '"Crimson Text", Georgia, serif',
  },

  layout: 'elegant',
  spacing: 'comfortable',
  borderRadius: '8px',
  shadowIntensity: 'medium',
};
