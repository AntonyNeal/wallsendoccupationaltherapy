import type { TenantTheme } from '../../core/types/tenant.types';

/**
 * Wallsend Occupational Therapy - Professional Healthcare Theme
 *
 * A calming, professional palette combining:
 * - Healing teal (#0d9488) for trust and wellness
 * - Deep ocean blue (#0369a1) for professionalism and stability
 * - Warm coral (#fb7185) for compassion and energy
 * - Soft sage (#84cc16) for growth and renewal
 *
 * Typography: Inter for modern professionalism, optimized for healthcare readability
 */
export const theme: TenantTheme = {
  colors: {
    // Primary: Healing Teal - Trust, wellness, calm
    primary: '#0d9488', // teal-600

    // Secondary: Deep Ocean Blue - Professional, stable, reliable
    secondary: '#0369a1', // sky-700

    // Accent: Warm Coral - Compassion, energy, approachability
    accent: '#fb7185', // rose-400

    // Background: Clean white for healthcare
    background: '#ffffff',

    // Text: High contrast for accessibility
    text: '#0f172a', // slate-900
    textLight: '#64748b', // slate-500

    // Status colors
    success: '#84cc16', // lime-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
  },

  fonts: {
    // Modern, highly legible fonts for healthcare
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  // Modern professional layout
  layout: 'modern',

  // Comfortable spacing for healthcare content
  spacing: 'comfortable',

  // Soft corners for approachability
  borderRadius: '12px',

  // Subtle shadows for professionalism
  shadowIntensity: 'medium',
};
