/**
 * O'Sullivan Farms Tenant Configuration
 * Exports all tenant-specific configurations
 */
import { theme } from './theme.config';
import { content } from './content.config';
import { photos } from './photos.config';
import type { TenantConfig } from '../../core/types/tenant.types';

export const osullivanfarmsConfig: TenantConfig = {
  id: 'osullivanfarms',
  name: "O'Sullivan Farms",
  subdomain: 'osullivanfarms',
  content,
  theme,
  photos,
  status: 'active',
  customDomain: 'osullivanfarms.com',
  features: {
    bookingEnabled: true,
    galleryEnabled: true,
    blogEnabled: false,
    reviewsEnabled: true,
    chatEnabled: false,
  },
  analytics: {
    googleAnalyticsId: '', // Add when available
    trackingEnabled: true,
  },
};

export default osullivanfarmsConfig;
