/**
 * Wallsend Occupational Therapy - Tenant Configuration Export
 *
 * This tenant represents a professional occupational therapy practice
 * serving the Newcastle and Lake Macquarie regions.
 *
 * Key Features:
 * - NDIS registered provider
 * - Comprehensive assessment services
 * - Home modification specialists
 * - Assistive technology experts
 * - Paediatric to aged care services
 *
 * Theme: Professional healthcare with calming teal and blue palette
 * Target Audience: NDIS participants, aged care clients, workplace injury recovery
 */

import { theme } from './theme.config';
import { content } from './content.config';
import { photos } from './photos.config';
import type { TenantConfig } from '../../core/types/tenant.types';

export const wallsendConfig: TenantConfig = {
  id: 'wallsend',
  subdomain: 'wallsend',
  name: 'Wallsend Occupational Therapy',
  theme,
  content,
  photos,
  status: 'active',
  customDomain: 'wallsendot.com.au',
  features: {
    bookingEnabled: true,
    galleryEnabled: true,
    blogEnabled: false,
    reviewsEnabled: true,
    chatEnabled: false,
  },
};

export default wallsendConfig;
