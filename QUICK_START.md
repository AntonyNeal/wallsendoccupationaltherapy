# Quick Start Guide - Wallsend Occupational Therapy Platform

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Installation (5 minutes)

### 1. Clone and Install Dependencies
```bash
# Clone the repository (if not already done)
git clone https://github.com/AntonyNeal/wallsendoccupationaltherapy.git
cd wallsendoccupationaltherapy

# Install all dependencies
npm run install-all
```

### 2. Set Up Database
```bash
# Create database
createdb wallsend_ot

# Run schema
psql wallsend_ot < backend/src/config/schema.sql
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
# Edit .env if needed (default should work)
```

### 4. Start Development Servers

**Option A: Both servers at once (from root):**
```bash
npm run dev
```

**Option B: Separate terminals:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Testing the Platform

### Test API Endpoints
```bash
# Get tenant configuration
curl http://localhost:3001/api/tenant/config

# Get services
curl http://localhost:3001/api/tenant/services

# Get branding
curl http://localhost:3001/api/tenant/branding
```

### View Pages
- Home: http://localhost:3000/
- Services: http://localhost:3000/services
- Booking: http://localhost:3000/booking
- Contact: http://localhost:3000/contact

## Customization

### Update Business Information
Edit `backend/src/config/tenant.config.ts`:

```typescript
businessInfo: {
  legalName: 'Your Business Name',
  abn: 'Your ABN',
  address: {
    street: 'Your Street',
    suburb: 'Your Suburb',
    state: 'NSW',
    postcode: 'Your Postcode',
    country: 'Australia'
  },
  phone: 'Your Phone',
  email: 'your@email.com',
  website: 'https://yourwebsite.com'
}
```

### Update Branding
```typescript
branding: {
  primaryColor: '#YourColor',
  secondaryColor: '#YourColor',
  accentColor: '#YourColor',
  tagline: 'Your tagline'
}
```

### Add/Modify Services
```typescript
services: [
  {
    id: 'your-service-id',
    name: 'Your Service Name',
    description: 'Service description',
    duration: 60,  // minutes
    price: 10000,  // cents ($100.00)
    ndisEnabled: true,
    ndisSupportItems: ['NDIS_CODE']
  }
]
```

After changes:
```bash
cd backend
npm run build
npm run dev
```

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

## Common Commands

```bash
# Install dependencies
npm run install-all

# Run both dev servers
npm run dev

# Build both projects
npm run build

# Lint both projects
npm run lint

# Backend only
cd backend
npm run dev          # Development
npm run build        # Production build
npm run lint         # Check code
npm test            # Run tests

# Frontend only
cd frontend
npm run dev          # Development
npm run build        # Production build
npm run lint         # Check code
npm run preview      # Preview production build
```

## Troubleshooting

### Port Already in Use
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `backend/.env`
- Ensure database exists: `psql -l | grep wallsend_ot`

### Build Errors
```bash
# Clean install
rm -rf backend/node_modules frontend/node_modules
npm run install-all
```

## Need Help?

- 📧 Email: info@wallsendoccupationaltherapy.com
- 📞 Phone: +61 2 4000 0000
- 📖 Full Documentation: See README.md
- 📋 Implementation Details: See IMPLEMENTATION_SUMMARY.md

## What's Included?

✅ Booking calendar
✅ Payment integration setup (Stripe)
✅ NDIS services with support codes
✅ Analytics endpoints
✅ Multi-tenant architecture
✅ Professional healthcare design
✅ Responsive mobile-friendly UI
✅ Security features (Helmet, CORS, rate limiting)
✅ TypeScript throughout
✅ Linting and formatting setup

## Next Steps

1. ✅ Update business information in `tenant.config.ts`
2. ✅ Add your logo to `frontend/public/assets/`
3. ✅ Configure Stripe keys in `.env` for payments
4. ✅ Set up production database
5. ✅ Deploy to your hosting provider
6. ✅ Set up SSL certificate
7. ✅ Configure domain and subdomain

---

**Version:** 1.0.0
**Last Updated:** November 2024
**Status:** Production Ready ✅
