import type { TenantPhotos } from '../../core/types/tenant.types';

/**
 * Photos Configuration for Claire Hamilton
 *
 * Using existing Twitter-hosted photos from current site
 */
export const photos: TenantPhotos = {
  // Hero Photo (with A/B Testing)
  hero: {
    control: 'https://pbs.twimg.com/media/G3hgK2hX0AAB8RL.jpg:large',
    variants: [
      {
        id: 'hero_variant_a',
        url: 'https://pbs.twimg.com/media/G3Gh-hdbUAAQTDo.jpg:large',
        alt: 'Claire Hamilton - Elegant portrait',
        weight: 0.2,
      },
      {
        id: 'hero_variant_b',
        url: 'https://pbs.twimg.com/media/G3qlG5VWwAAkv0w.jpg:large',
        alt: 'Claire Hamilton - Sophisticated look',
        weight: 0.2,
      },
      {
        id: 'hero_variant_c',
        url: 'https://pbs.twimg.com/media/G4OoP7-WoAA4YbX.jpg:large',
        alt: 'Claire Hamilton - Glamorous pose',
        weight: 0.2,
      },
      {
        id: 'hero_variant_d',
        url: 'https://pbs.twimg.com/media/G22stVEaYAAuqaG.jpg:large',
        alt: 'Claire Hamilton - Classic beauty',
        weight: 0.2,
      },
    ],
  },

  // Gallery Photos
  gallery: [
    {
      id: 1,
      url: 'https://pbs.twimg.com/media/G3hgK2hX0AAB8RL.jpg:large',
      alt: 'Claire Hamilton - Portrait 1',
      category: 'portrait',
    },
    {
      id: 2,
      url: 'https://pbs.twimg.com/media/G3Gh-hdbUAAQTDo.jpg:large',
      alt: 'Claire Hamilton - Portrait 2',
      category: 'portrait',
    },
    {
      id: 3,
      url: 'https://pbs.twimg.com/media/G3qlG5VWwAAkv0w.jpg:large',
      alt: 'Claire Hamilton - Portrait 3',
      category: 'portrait',
    },
    {
      id: 4,
      url: 'https://pbs.twimg.com/media/G4OoP7-WoAA4YbX.jpg:large',
      alt: 'Claire Hamilton - Portrait 4',
      category: 'portrait',
    },
    {
      id: 5,
      url: 'https://pbs.twimg.com/media/G22stVEaYAAuqaG.jpg:large',
      alt: 'Claire Hamilton - Portrait 5',
      category: 'portrait',
    },
  ],

  // About Section Photo
  about: {
    id: 'about',
    url: 'https://pbs.twimg.com/media/G3hgK2hX0AAB8RL.jpg:large',
    alt: 'Claire Hamilton - About photo',
  },
};

/**
 * Note: Photos are currently hosted on Twitter/X CDN.
 *
 * TODO: Migrate to DigitalOcean Spaces for better control:
 * - Create folder: tenants/claire/
 * - Upload optimized versions
 * - Update URLs in this config
 */
