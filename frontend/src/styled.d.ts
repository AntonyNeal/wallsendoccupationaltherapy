import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
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
  }
}
