import type { TenantContent } from '../../core/types/tenant.types';

/**
 * Content Configuration for [TENANT_NAME]
 *
 * All text content, services, pricing, and contact information.
 */
export const content: TenantContent = {
  // Basic Information
  name: '[Companion Name]',
  tagline: '[Your Tagline - e.g., "Premium Companion in Melbourne"]',
  bio: `
    [Full bio - 2-3 paragraphs about yourself, your personality, interests, and what makes you unique]
    
    [Include details about your background, hobbies, favorite activities, etc.]
  `,
  shortBio: '[One sentence summary for quick intros]',

  // Services Offered
  services: [
    {
      id: 'dinner-date',
      name: 'Dinner Date',
      description: 'Elegant companionship for social events and fine dining',
      duration: '3-4 hours',
      priceDisplay: 'See Pricing',
      featured: true,
    },
    {
      id: 'overnight',
      name: 'Overnight Experience',
      description: 'Extended companionship with no rush',
      duration: '12 hours',
      priceDisplay: 'See Pricing',
      featured: true,
    },
    // Add more services as needed
  ],

  // Pricing
  pricing: {
    hourly: 600, // Optional: hourly rate
    overnight: 3000, // Optional: overnight rate
    weekend: 7000, // Optional: weekend rate
    displayHourly: false, // Show hourly rate on site?
    currency: 'AUD',
  },

  // Contact Information
  contact: {
    email: '[your-email@example.com]',
    phone: '[0XXX XXX XXX]', // Optional
    phoneDisplay: '[Display format]', // How to show phone
    whatsapp: '[+61 XXX XXX XXX]', // Optional
    availableHours: '10:00 - 22:00 AEST',
    responseTime: '2-4 hours',
    preferredContact: 'email',
  },

  // Social Media (all optional)
  socialMedia: {
    instagram: '@username',
    twitter: '@username',
    onlyfans: 'username',
    bluesky: '@username',
  },

  // Availability
  availability: {
    location: '[City, State]',
    willingToTravel: true,
    travelCities: ['Sydney', 'Melbourne', 'Brisbane'],
    timezone: 'Australia/Sydney',
  },

  // Booking Preferences
  preferences: {
    minAge: 25,
    minNotice: '24 hours',
    depositRequired: true,
    depositAmount: 200,
    screeningRequired: true,
  },

  // SEO Configuration
  seo: {
    title: '[Name] - [City] Companion',
    description: '[Brief description for search engines - 150-160 characters]',
    keywords: ['[city] companion', 'luxury escort', 'high-end'],
  },
};
