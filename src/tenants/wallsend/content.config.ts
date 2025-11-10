import type { TenantContent } from '../../core/types/tenant.types';

/**
 * Wallsend Occupational Therapy - Content Configuration
 *
 * Providing expert occupational therapy services in Newcastle and Lake Macquarie.
 * Specializing in NDIS support, functional assessments, and home modifications.
 */
export const content: TenantContent = {
  // Business Identity
  name: 'Wallsend Occupational Therapy',
  tagline: 'Empowering Independence Through Expert Care',

  // Professional Bio
  bio: `Wallsend Occupational Therapy is your trusted partner in achieving independence and improving quality of life.

Based in Newcastle's vibrant Wallsend community, we provide comprehensive occupational therapy services across Newcastle, Lake Macquarie, and the broader Hunter Region.

Our experienced therapists specialise in NDIS assessments, functional capacity evaluations, home modifications, assistive technology prescription, and workplace ergonomics. We work with people of all ages and abilities—from children with developmental challenges to older adults maintaining independence.

As registered NDIS providers, we pride ourselves on our client-centered approach, evidence-based practice, and commitment to empowering every individual to live their best life. We collaborate closely with families, carers, support workers, and other health professionals to deliver holistic, goal-focused interventions.

Whether you're recovering from injury, managing a disability, or seeking to optimise your daily function, we're here to support your journey toward independence.`,

  shortBio:
    'Expert occupational therapy services in Newcastle & Lake Macquarie. NDIS registered. Specializing in assessments, home modifications, and assistive technology for all ages.',

  // Services Portfolio
  services: [
    {
      id: 'ndis-assessment',
      name: 'NDIS Functional Assessment',
      description:
        'Comprehensive functional capacity assessment for NDIS participants to identify support needs, recommend equipment, and inform plan development with detailed, evidence-based reports.',
      duration: '2-3 hours',
      price: 450,
      priceDisplay: '$450',
      featured: true,
      icon: 'clipboard',
    },
    {
      id: 'home-modifications',
      name: 'Home Modification Assessment',
      description:
        'Expert assessment and design recommendations for home modifications to enhance safety, accessibility, and independence. Includes technical drawings and builder liaison.',
      duration: '1.5-2 hours',
      price: 350,
      priceDisplay: '$350',
      featured: true,
      icon: 'home',
    },
    {
      id: 'functional-capacity',
      name: 'Functional Capacity Evaluation',
      description:
        'Objective standardized assessment of physical and cognitive work capacity for WorkCover, insurers, and return-to-work planning. Comprehensive medical-legal reports provided.',
      duration: '4-6 hours',
      price: 850,
      priceDisplay: '$850',
      featured: true,
      icon: 'briefcase',
    },
    {
      id: 'assistive-technology',
      name: 'Assistive Technology Prescription',
      description:
        'Expert prescription and training for assistive technology, mobility aids, and adaptive equipment. Includes equipment trials, supplier liaison, and comprehensive training.',
      duration: '1-2 hours',
      price: 280,
      priceDisplay: '$280',
      featured: false,
      icon: 'cog',
    },
    {
      id: 'workplace-ergonomics',
      name: 'Workplace Ergonomics Assessment',
      description:
        'Comprehensive workstation and manual handling assessment to prevent injuries, enhance comfort, and improve productivity. Individual or group training available.',
      duration: '1 hour',
      price: 220,
      priceDisplay: '$220',
      featured: false,
      icon: 'desktop',
    },
    {
      id: 'paediatric-ot',
      name: 'Paediatric Occupational Therapy',
      description:
        'Specialized play-based therapy for children with developmental delays, autism, sensory processing difficulties, and coordination challenges. Includes parent education.',
      duration: '45-60 minutes',
      price: 190,
      priceDisplay: '$190/session',
      featured: false,
      icon: 'users',
    },
    {
      id: 'rehabilitation',
      name: 'Rehabilitation Therapy',
      description:
        'Goal-focused rehabilitation following injury, surgery, or illness. Personalized programs to restore function, build strength, and return to meaningful activities.',
      duration: '1 hour',
      price: 190,
      priceDisplay: '$190/session',
      featured: false,
      icon: 'activity',
    },
    {
      id: 'aged-care',
      name: 'Aged Care Assessment',
      description:
        'Comprehensive assessment for older adults supporting aging in place, residential care planning, or home care packages. Includes fall risk and cognitive assessment.',
      duration: '1.5 hours',
      price: 280,
      priceDisplay: '$280',
      featured: false,
      icon: 'heart',
    },
  ],

  // Pricing Structure
  pricing: {
    hourly: 190,
    currency: 'AUD',
    displayHourly: true,
    customRates: [
      {
        duration: 'Initial Assessment (90 minutes)',
        price: 380,
        description: 'Comprehensive first appointment with detailed report',
      },
      {
        duration: 'NDIS Assessment (2-3 hours)',
        price: 450,
        description: 'Full functional capacity evaluation for NDIS',
      },
      {
        duration: 'Home Modification Report',
        price: 350,
        description: 'On-site assessment with technical specifications',
      },
      {
        duration: 'FCE (4-6 hours)',
        price: 850,
        description: 'Functional capacity evaluation for WorkCover/insurance',
      },
    ],
  },

  // Contact Information
  contact: {
    email: 'hello@wallsendot.com.au',
    phone: '+61249615555',
    phoneDisplay: '(02) 4961 5555',
    availableHours: 'Mon-Fri: 8am-6pm, Sat: 9am-1pm',
    responseTime: 'We typically respond within 4 business hours',
    preferredContact: 'phone',
  },

  // Social Media
  socialMedia: {
    facebook: 'https://facebook.com/wallsendot',
    instagram: 'https://instagram.com/wallsendot',
    linkedin: 'https://linkedin.com/company/wallsend-occupational-therapy',
  },

  // Availability
  availability: {
    location: 'Wallsend, Newcastle, NSW 2287',
    willingToTravel: true,
    travelCities: [
      'Newcastle',
      'Lake Macquarie',
      'Maitland',
      'Port Stephens',
      'Cessnock',
      'Singleton',
    ],
    timezone: 'Australia/Sydney',
  },

  // Booking Preferences
  preferences: {
    minNotice: '24 hours for standard appointments, 48 hours for assessments',
    depositRequired: false,
    screeningRequired: false,
  },

  // SEO Configuration
  seo: {
    title: 'Wallsend Occupational Therapy | NDIS OT Services Newcastle & Lake Macquarie',
    description:
      'Expert occupational therapy services in Newcastle & Lake Macquarie. NDIS registered provider. Specializing in home modifications, functional assessments, assistive technology & rehabilitation. Book your assessment today.',
    keywords: [
      'occupational therapy Newcastle',
      'OT Wallsend',
      'NDIS occupational therapist',
      'home modifications Newcastle',
      'functional capacity evaluation',
      'assistive technology prescription',
      'paediatric OT Newcastle',
      'aged care assessment',
      'WorkCover occupational therapy',
      'Lake Macquarie OT',
      'Hunter Region occupational therapy',
      'NDIS provider Newcastle',
      'rehabilitation therapy',
      'workplace ergonomics',
      'sensory integration therapy',
    ],
    ogImage: 'hero-main',
    twitterCard: 'summary_large_image',
  },

  // Custom Pages (Optional - for future expansion)
  customPages: [
    {
      slug: 'ndis-services',
      title: 'NDIS Services',
      content: `We are registered NDIS providers offering comprehensive occupational therapy services under your NDIS plan. Our services are available for plan-managed and self-managed participants across all support categories.`,
    },
    {
      slug: 'areas-we-service',
      title: 'Areas We Service',
      content: `We provide home visits and clinic appointments throughout Newcastle, Lake Macquarie, Maitland, Port Stephens, and the broader Hunter Region. Travel fees may apply for locations outside our primary service area.`,
    },
  ],
};
