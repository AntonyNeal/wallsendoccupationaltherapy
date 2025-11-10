export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  businessInfo: {
    legalName: string;
    abn: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      country: string;
    };
    phone: string;
    email: string;
    website: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo: string;
    favicon: string;
    tagline: string;
  };
  services: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    ndisEnabled: boolean;
    ndisSupportItems?: string[];
  }[];
  features: {
    bookingCalendar: boolean;
    payments: boolean;
    ndisIntegration: boolean;
    analytics: boolean;
    homeModifications: boolean;
  };
  settings: {
    timezone: string;
    currency: string;
    bookingAdvanceLimit: number;
    cancellationPolicy: string;
    confirmationEmailEnabled: boolean;
    reminderEmailEnabled: boolean;
  };
}

export const wallsendOTConfig: TenantConfig = {
  id: 'wallsend-ot',
  name: 'Wallsend Occupational Therapy',
  subdomain: 'wallsendot',
  businessInfo: {
    legalName: 'Wallsend Occupational Therapy Pty Ltd',
    abn: '00000000000', // To be updated with actual ABN
    address: {
      street: 'Wallsend',
      suburb: 'Wallsend',
      state: 'NSW',
      postcode: '2287',
      country: 'Australia'
    },
    phone: '+61 2 4000 0000',
    email: 'info@wallsendoccupationaltherapy.com',
    website: 'https://wallsendoccupationaltherapy.com'
  },
  branding: {
    primaryColor: '#0077B6', // Professional blue for healthcare
    secondaryColor: '#00B4D8', // Lighter blue
    accentColor: '#90E0EF', // Soft accent
    logo: '/assets/logo.png',
    favicon: '/assets/favicon.ico',
    tagline: 'Empowering independence through expert occupational therapy'
  },
  services: [
    {
      id: 'ndis-functional-assessment',
      name: 'NDIS Functional Assessment',
      description: 'Comprehensive assessment for NDIS participants to identify support needs and goals',
      duration: 90,
      price: 19500, // $195.00 in cents
      ndisEnabled: true,
      ndisSupportItems: ['15_037_0128_8_1', '15_038_0128_8_1']
    },
    {
      id: 'home-modification-assessment',
      name: 'Home Modification Assessment',
      description: 'Professional assessment for home modifications to improve accessibility and safety',
      duration: 120,
      price: 25000,
      ndisEnabled: true,
      ndisSupportItems: ['15_039_0128_8_1']
    },
    {
      id: 'therapy-session',
      name: 'Occupational Therapy Session',
      description: 'One-on-one therapy session focusing on improving daily living skills',
      duration: 60,
      price: 19386, // NDIS hourly rate
      ndisEnabled: true,
      ndisSupportItems: ['15_037_0128_8_1']
    },
    {
      id: 'assistive-technology-assessment',
      name: 'Assistive Technology Assessment',
      description: 'Assessment and recommendations for assistive technology and equipment',
      duration: 90,
      price: 19500,
      ndisEnabled: true,
      ndisSupportItems: ['15_055_0128_8_1']
    },
    {
      id: 'group-therapy',
      name: 'Group Therapy Session',
      description: 'Group-based occupational therapy focusing on social skills and community participation',
      duration: 90,
      price: 14500,
      ndisEnabled: true,
      ndisSupportItems: ['15_037_0128_8_1']
    }
  ],
  features: {
    bookingCalendar: true,
    payments: true,
    ndisIntegration: true,
    analytics: true,
    homeModifications: true
  },
  settings: {
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    bookingAdvanceLimit: 90, // days in advance
    cancellationPolicy: '48 hours notice required for cancellations. Late cancellations may incur fees.',
    confirmationEmailEnabled: true,
    reminderEmailEnabled: true
  }
};

export default wallsendOTConfig;
