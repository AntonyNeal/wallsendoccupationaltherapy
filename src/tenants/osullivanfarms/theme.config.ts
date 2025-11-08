import type { TenantTheme } from '../../core/types/tenant.types';

/**
 * O'Sullivan Farms Theme Configuration
 * Neo-Australian farming aesthetic - clean, modern, earthy
 * Echuca, Victoria region
 */
export const theme: TenantTheme = {
  // Color Palette - Neo-Australian Farming
  colors: {
    primary: '#3d8b6b', // Deep eucalyptus green
    secondary: '#d66742', // Warm terra cotta (Australian earth)
    accent: '#f59e0b', // Golden wattle (Australia's floral emblem)
    background: '#FAFAF9', // Warm off-white (natural wool)
    text: '#1c3c2f', // Deep forest green
    textLight: '#5ca686', // Lighter eucalyptus
    success: '#3d8b6b', // Match primary
    error: '#c75037', // Terra cotta deep
    warning: '#f59e0b', // Golden wattle
  },

  // Typography - Clean, established, readable
  fonts: {
    heading: 'Playfair Display, Georgia, serif',
    body: 'Inter, system-ui, sans-serif',
  },

  // Layout Style
  layout: 'modern',

  // Spacing
  spacing: 'spacious',

  // Border Radius
  borderRadius: '0.75rem',
};

export default theme;
