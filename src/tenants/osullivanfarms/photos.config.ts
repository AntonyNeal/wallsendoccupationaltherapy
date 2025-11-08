import type { TenantPhotos } from '../../core/types/tenant.types';

/**
 * O'Sullivan Farms Photo Configuration
 * Neo-Australian farming aesthetic - golden hour farmlands, sheep, hay bales
 * NOTE: Replace placeholder URLs with actual farm photography
 */
export const photos: TenantPhotos = {
  // Hero Photo Configuration with A/B Testing
  hero: {
    control: {
      id: 'hero-main',
      url: '/assets/hero-golden-paddock.jpg', // Golden hour over hay paddocks
      alt: "O'Sullivan Farms hay paddocks at sunset - Echuca, Victoria",
      caption: 'Premium hay production in the Murray River region',
    },
    variants: [
      {
        id: 'hero-sheep',
        url: '/assets/hero-merino-flock.jpg', // Mob of sheep in green paddock
        alt: 'Merino sheep flock on O\'Sullivan Farms',
        weight: 0.4,
      },
      {
        id: 'hero-transport',
        url: '/assets/hero-transport.jpg', // B-double loaded with hay
        alt: 'O\'Sullivan Farms transport fleet',
        weight: 0.3,
      },
    ],
  },

  // Gallery Photos - Farm operations, products, equipment
  gallery: [
    {
      id: 'gallery-1',
      url: '/assets/gallery-hay-baling.jpg',
      alt: 'Hay baling operations',
      caption: 'Quality hay baling with modern equipment',
      category: 'hay',
    },
    {
      id: 'gallery-2',
      url: '/assets/gallery-lucerne-field.jpg',
      alt: 'Lucerne hay field ready for cutting',
      caption: 'Premium lucerne fields',
      category: 'hay',
    },
    {
      id: 'gallery-3',
      url: '/assets/gallery-hay-storage.jpg',
      alt: 'Weather-protected hay storage facility',
      caption: 'Protected storage maintains quality',
      category: 'hay',
    },
    {
      id: 'gallery-4',
      url: '/assets/gallery-sheep-mob.jpg',
      alt: 'Healthy sheep mob in rotational grazing system',
      caption: 'Sustainable paddock management',
      category: 'sheep',
    },
    {
      id: 'gallery-5',
      url: '/assets/gallery-lambing.jpg',
      alt: 'Ewes with lambs in spring paddock',
      caption: 'Spring lambing season',
      category: 'sheep',
    },
    {
      id: 'gallery-6',
      url: '/assets/gallery-transport-loading.jpg',
      alt: 'Hay loading onto B-double transport',
      caption: 'Professional transport services',
      category: 'transport',
    },
    {
      id: 'gallery-7',
      url: '/assets/gallery-farm-sunrise.jpg',
      alt: 'Dawn over O\'Sullivan Farms',
      caption: 'Echuca farmlands at first light',
      category: 'farm',
    },
    {
      id: 'gallery-8',
      url: '/assets/gallery-digital-tracking.jpg',
      alt: 'Worker using mobile flock management app',
      caption: 'Digital farm management',
      category: 'technology',
    },
  ],

  // About/Team photos
  about: {
    id: 'about-main',
    url: '/assets/profile-farm-landscape.jpg',
    alt: "O'Sullivan Farms panoramic view",
    caption: 'Family-operated farm in Echuca, Victoria',
  },
};

export default photos;
