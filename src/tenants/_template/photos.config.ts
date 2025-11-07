import type { TenantPhotos } from '../../core/types/tenant.types';

/**
 * Photos Configuration for [TENANT_NAME]
 *
 * Photo URLs for hero, gallery, and other sections.
 * Supports A/B testing for hero images.
 */
export const photos: TenantPhotos = {
  // Hero Photo (with A/B Testing)
  hero: {
    control: 'https://your-storage.com/tenant-name/hero-1.jpg',
    variants: [
      {
        id: 'hero_variant_a',
        url: 'https://your-storage.com/tenant-name/hero-2.jpg',
        alt: 'Hero photo variant A',
        weight: 0.5, // 50% of traffic
      },
      // Add more variants for testing
    ],
  },

  // Gallery Photos
  gallery: [
    {
      id: 1,
      url: 'https://your-storage.com/tenant-name/gallery-1.jpg',
      alt: 'Gallery photo 1',
      caption: 'Optional caption',
      category: 'formal',
    },
    {
      id: 2,
      url: 'https://your-storage.com/tenant-name/gallery-2.jpg',
      alt: 'Gallery photo 2',
      category: 'casual',
    },
    {
      id: 3,
      url: 'https://your-storage.com/tenant-name/gallery-3.jpg',
      alt: 'Gallery photo 3',
      category: 'portrait',
    },
    // Recommended: 8-12 high-quality photos
  ],

  // About Section Photo (optional)
  about: {
    id: 'about',
    url: 'https://your-storage.com/tenant-name/about.jpg',
    alt: 'About photo',
  },
};

/**
 * Photo Guidelines:
 *
 * - Format: JPG or WebP
 * - Hero: 1920x1080px (16:9 ratio)
 * - Gallery: 1200x800px (3:2 ratio)
 * - File size: < 500KB (optimized for web)
 * - Quality: High-quality, professional photos
 * - Naming: Descriptive (e.g., 'hero-evening-dress.jpg')
 *
 * Upload photos to DigitalOcean Spaces:
 * doctl spaces upload ./photos/ tenant-name/ --recursive
 */
