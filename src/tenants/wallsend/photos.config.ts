import type { TenantPhotos } from '../../core/types/tenant.types';

/**
 * Wallsend Occupational Therapy - Photos Configuration
 *
 * Professional healthcare imagery focused on client independence,
 * therapeutic interventions, and accessible environments.
 *
 * NOTE: These are placeholder URLs. Replace with actual photos:
 * - Hero: Welcoming OT clinic interior or therapist with client
 * - Gallery: Service delivery, equipment, accessible environments
 * - About: Team photos, clinic environment
 */
export const photos: TenantPhotos = {
  // Hero Image - Main landing page
  hero: {
    control: {
      id: 'hero-main',
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
      alt: 'Wallsend Occupational Therapy - Empowering independence through expert care',
      caption: 'Professional occupational therapy services in Newcastle',
    },
    // A/B test variants (optional - add when you have multiple hero images)
    variants: [
      {
        id: 'hero-clinic',
        url: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1920&q=80',
        alt: 'Modern occupational therapy clinic interior',
        weight: 0.5,
      },
    ],
  },

  // Service Gallery - Show your services in action
  gallery: [
    {
      id: 'gallery-1',
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      alt: 'Occupational therapist conducting home modification assessment',
      caption: 'Home Modification Assessments',
      category: 'services',
    },
    {
      id: 'gallery-2',
      url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
      alt: 'Paediatric occupational therapy session with child',
      caption: 'Paediatric Therapy',
      category: 'services',
    },
    {
      id: 'gallery-3',
      url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
      alt: 'Assistive technology and mobility equipment assessment',
      caption: 'Assistive Technology Prescription',
      category: 'equipment',
    },
    {
      id: 'gallery-4',
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      alt: 'Workplace ergonomics assessment in office environment',
      caption: 'Workplace Ergonomics',
      category: 'workplace',
    },
    {
      id: 'gallery-5',
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      alt: 'Rehabilitation therapy session with elderly client',
      caption: 'Rehabilitation Therapy',
      category: 'services',
    },
    {
      id: 'gallery-6',
      url: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&q=80',
      alt: 'NDIS functional capacity assessment documentation',
      caption: 'NDIS Assessments',
      category: 'assessments',
    },
  ],

  // About Page Image - Team or clinic photo
  about: {
    id: 'about-team',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80',
    alt: 'Wallsend Occupational Therapy team of experienced therapists',
    caption: 'Our dedicated team of occupational therapists',
  },

  // Testimonials Images (optional - add client photos with permission)
  testimonials: [
    {
      id: 'testimonial-1',
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      alt: 'Jennifer M. - NDIS Participant',
      category: 'client',
    },
    {
      id: 'testimonial-2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      alt: 'David R. - Parent',
      category: 'client',
    },
    {
      id: 'testimonial-3',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      alt: 'Robert T. - WorkCover Client',
      category: 'client',
    },
  ],
};

/**
 * Asset Creation Checklist
 *
 * Priority 1 - Essential:
 * [ ] Hero image: 1920x1080px, professional OT environment
 * [ ] Logo: SVG + PNG (512x512), on transparent background
 * [ ] Favicon: 32x32, 64x64, 180x180 (PNG)
 * [ ] Open Graph image: 1200x630px with branding
 *
 * Priority 2 - Recommended:
 * [ ] Service photos (6-8 images): Show different services in action
 * [ ] Team photo: Professional headshots or group photo
 * [ ] Clinic environment: Reception, therapy rooms, accessible features
 *
 * Priority 3 - Optional:
 * [ ] Client testimonial photos (with signed releases)
 * [ ] Before/after photos of home modifications
 * [ ] Video content: Service explanations, client stories
 *
 * Photo Specifications:
 * - Format: JPG for photos, PNG for logos/graphics
 * - Quality: 80-90% compression
 * - Dimensions: Minimum 1920px wide for hero/banners
 * - Color: sRGB color space
 * - Accessibility: All images must have descriptive alt text
 *
 * Brand Guidelines:
 * - Primary color: Teal (#0d9488)
 * - Secondary color: Ocean blue (#0369a1)
 * - Accent: Warm coral (#fb7185)
 * - Style: Professional, calming, approachable
 * - Mood: Empowering, supportive, expert
 */
