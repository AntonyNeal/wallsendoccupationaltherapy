import type { TenantContent } from '../../core/types/tenant.types';

/**
 * Content Configuration for Claire Hamilton
 */
export const content: TenantContent = {
  // Basic Information
  name: 'Claire Hamilton',
  tagline: 'Real curves. Real connection. Ultimate GFE.',
  bio: `
    I'm Claire – your authentic companion for genuine connection and unforgettable experiences.
    
    Based in Canberra, I offer a refreshing alternative to the cookie-cutter escort experience. 
    With real curves, natural warmth, and a genuine passion for connection, I specialize in 
    creating the ultimate girlfriend experience that feels less like a booking and more like 
    spending time with someone special.
    
    Whether you're seeking companionship for a social event, intimate dinner, or private time 
    together, I bring authenticity, intelligence, and charm to every encounter. Discretion 
    and professionalism are guaranteed.
  `,
  shortBio: 'Real curves. Real connection. Ultimate GFE. Independent escort based in Canberra.',

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
      id: 'gfe',
      name: 'Girlfriend Experience',
      description: 'Authentic connection with genuine warmth and affection',
      duration: 'Flexible',
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
  ],

  // Pricing
  pricing: {
    hourly: 600,
    overnight: 3000,
    displayHourly: false,
    currency: 'AUD',
  },

  // Contact Information
  contact: {
    email: 'contact.clairehamilton@proton.me',
    phone: '0403977680',
    phoneDisplay: '0403 977 680',
    whatsapp: '+61403977680',
    availableHours: '10:00 - 22:00 AEST',
    responseTime: '2-4 hours',
    preferredContact: 'sms',
  },

  // Social Media
  socialMedia: {
    twitter: '@clairehamiltonx',
    onlyfans: 'clairehamilton',
    bluesky: '@clairehamilton.bsky.social',
  },

  // Availability
  availability: {
    location: 'Canberra, ACT',
    willingToTravel: true,
    travelCities: ['Sydney', 'Melbourne', 'Brisbane', 'Gold Coast'],
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
    title: 'Claire Hamilton - Canberra Companion & GFE Specialist',
    description:
      'Real curves. Real connection. Ultimate GFE. Independent escort based in Canberra, Australia. Authentic companionship with discretion guaranteed.',
    keywords: [
      'canberra companion',
      'gfe escort',
      'girlfriend experience',
      'luxury escort canberra',
      'independent escort',
    ],
  },
};
