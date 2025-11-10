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
  services: Service[];
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

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  ndisEnabled: boolean;
  ndisSupportItems?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  paymentStatus?: string;
  ndisClain?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  ndisNumber?: string;
  ndisPlanManaged?: boolean;
}
