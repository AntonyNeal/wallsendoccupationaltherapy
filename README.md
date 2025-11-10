# Wallsend Occupational Therapy Booking Platform

A comprehensive service booking platform for Wallsend Occupational Therapy, featuring React/TypeScript frontend, Node.js API, and PostgreSQL database. This platform is specifically customized for an occupational therapy practice in Wallsend, NSW, Australia, with full NDIS integration and home modification services.

## Features

- 📅 **Booking Calendar** - Easy online appointment scheduling
- 💳 **Payment Integration** - Stripe payment processing
- 📊 **Analytics Dashboard** - Business insights and reporting
- ♿ **NDIS Integration** - Full NDIS service support with support item codes
- 🏠 **Home Modifications** - Specialized assessment booking
- 🎨 **Custom Branding** - Wallsend OT healthcare branding
- 🌐 **Subdomain Routing** - Multi-tenant architecture support

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Styled Components** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Stripe React** for payments

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **JWT** authentication
- **Stripe** payment processing
- **Helmet** for security
- **CORS** enabled

## Project Structure

```
wallsendoccupationaltherapy/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── tenant.config.ts    # Wallsend OT tenant configuration
│   │   │   ├── app.config.ts       # Application configuration
│   │   │   ├── database.ts         # Database connection
│   │   │   └── schema.sql          # Database schema
│   │   ├── routes/         # API routes
│   │   │   ├── tenant.routes.ts    # Tenant configuration endpoints
│   │   │   ├── booking.routes.ts   # Booking management
│   │   │   └── analytics.routes.ts # Analytics endpoints
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   └── ContactPage.tsx
│   │   ├── services/       # API services
│   │   │   ├── api.ts
│   │   │   ├── tenant.service.ts
│   │   │   └── booking.service.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   ├── styles/         # Global styles
│   │   │   └── GlobalStyle.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Stripe account (for payments)

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb wallsend_ot
```

2. Run the database schema:
```bash
psql wallsend_ot < backend/src/config/schema.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallsend_ot
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Wallsend OT Configuration

The platform is pre-configured for Wallsend Occupational Therapy with:

### Business Information
- **Location**: Wallsend, NSW 2287, Australia
- **Services**: NDIS occupational therapy, home modifications, assessments
- **Timezone**: Australia/Sydney
- **Currency**: AUD

### NDIS Services
All services include NDIS support item codes:
- Functional Assessments (15_037_0128_8_1, 15_038_0128_8_1)
- Home Modifications (15_039_0128_8_1)
- Therapy Sessions (15_037_0128_8_1)
- Assistive Technology (15_055_0128_8_1)

### Branding
- **Primary Color**: #0077B6 (Professional healthcare blue)
- **Secondary Color**: #00B4D8 (Lighter blue)
- **Accent Color**: #90E0EF (Soft accent)
- **Tagline**: "Empowering independence through expert occupational therapy"

## API Endpoints

### Tenant Configuration
- `GET /api/tenant/config` - Get full tenant configuration
- `GET /api/tenant/services` - Get available services
- `GET /api/tenant/business-info` - Get business information
- `GET /api/tenant/branding` - Get branding configuration

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/availability/:date` - Check availability

### Analytics
- `GET /api/analytics/bookings` - Get booking analytics
- `GET /api/analytics/ndis` - Get NDIS-specific analytics
- `POST /api/analytics/event` - Track analytics event

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test            # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Customization Guide

### Updating Tenant Configuration

The main tenant configuration is in `backend/src/config/tenant.config.ts`. Update:

1. **Business Information**: Address, phone, email, ABN
2. **Branding**: Colors, logo, tagline
3. **Services**: Add/modify services with NDIS codes
4. **Features**: Enable/disable platform features
5. **Settings**: Timezone, currency, booking policies

### Adding New Services

Edit `wallsendOTConfig.services` in `backend/src/config/tenant.config.ts`:

```typescript
{
  id: 'service-id',
  name: 'Service Name',
  description: 'Service description',
  duration: 60,  // minutes
  price: 19500,  // cents ($195.00)
  ndisEnabled: true,
  ndisSupportItems: ['15_037_0128_8_1']
}
```

### Customizing Branding

Update colors in `wallsendOTConfig.branding`:

```typescript
branding: {
  primaryColor: '#0077B6',
  secondaryColor: '#00B4D8',
  accentColor: '#90E0EF',
  // ... other settings
}
```

## Production Deployment

### Backend
1. Build the application: `npm run build`
2. Set environment variables in production
3. Run migrations if needed
4. Start with: `npm start`

### Frontend
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server
3. Configure environment variables for production API URL

### Database
- Ensure PostgreSQL is properly configured
- Set up regular backups
- Configure connection pooling for production

## Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens for authentication
- CORS configured for specific origins
- Rate limiting on API endpoints
- Helmet.js for HTTP security headers
- Input validation on all endpoints

## NDIS Compliance

This platform is designed to support NDIS compliance:
- NDIS support item codes included
- Plan-managed and self-managed support
- Invoice generation capabilities
- Participant information management
- Service agreement tracking

## Support

For technical support or customization requests, please contact:
- Email: info@wallsendoccupationaltherapy.com
- Phone: +61 2 4000 0000

## License

MIT License - Copyright (c) 2024 Wallsend Occupational Therapy

---

**Note**: This is a customized instance of a multi-tenant booking platform, specifically configured for Wallsend Occupational Therapy. The core platform features are maintained while tenant-specific configuration and branding have been customized for the healthcare industry and NDIS compliance.
