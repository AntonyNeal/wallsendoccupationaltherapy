# Platform Overview

**Document Version**: 1.0  
**Last Verified**: November 7, 2025  
**Verification Method**: DigitalOcean API + Live Endpoint Testing  
**Status**: Production Active

---

## Executive Summary

Claire Hamilton Booking Platform is a **production-ready multi-tenant companion booking system** deployed on DigitalOcean App Platform. The platform uses a modern tech stack with Express.js API, React frontend, and PostgreSQL database.

**Live Site**: https://clairehamilton.vip  
**Current Status**: ✅ Active and operational  
**Deployment Date**: November 4-6, 2025

---

## Architecture

### Technology Stack

**Frontend**:

- React 18.3.1 with TypeScript 5.8.3
- Vite 7.1.2 (build tool)
- Tailwind CSS 3.4.17
- React Router DOM 7.8.1
- TanStack Query 5.85.5

**Backend**:

- Node.js 20+
- Express.js 4.18.2
- PostgreSQL 16 (managed)

**Infrastructure**:

- DigitalOcean App Platform (Sydney region)
- Cloudflare (DNS proxy and CDN)
- GitHub Actions (CI/CD)

### Deployment Model

```
Internet (HTTPS)
    ↓
Cloudflare Proxy (162.159.140.98, 172.66.0.96)
    ↓
DigitalOcean App Platform - octopus-app (Sydney)
    ├── Service: api (Express.js)
    │   ├── Source: /api directory
    │   ├── Port: 8080
    │   ├── Instance: basic-xxs (512MB RAM)
    │   └── Routes: /api/*
    │
    └── Service: sw-website (React SPA)
        ├── Source: / (root)
        ├── Port: 8080
        ├── Instance: basic-xxs (512MB RAM)
        └── Routes: /* (default)
    ↓
PostgreSQL 16 - companion-platform-db
    ├── Size: 1GB RAM, 1 vCPU
    ├── Nodes: 1
    ├── Region: Sydney (syd1)
    └── Schema: Multi-tenant (1,417 lines)
```

---

## Infrastructure Details

### DigitalOcean Resources

**App Platform**:

- **Name**: octopus-app
- **ID**: d1c88e97-20a1-4b99-a582-11828f840b64
- **Region**: Sydney (syd)
- **Created**: November 4, 2025 22:02:06 UTC
- **Last Deployed**: November 7, 2025 02:08:30 UTC
- **Status**: ACTIVE (100% deployed)
- **Default URL**: https://octopus-app-tw5wu.ondigitalocean.app
- **Live URL**: https://clairehamilton.vip

**Database**:

- **Name**: companion-platform-db
- **ID**: 2ff23557-e61b-44ae-a7b3-290f0fcb7de2
- **Engine**: PostgreSQL 16
- **Host**: companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
- **Port**: 25060
- **Database**: defaultdb
- **Status**: Online
- **Size**: db-s-1vcpu-1gb (1GB RAM, 1 vCPU)
- **Nodes**: 1

**Domains** (Active):

- clairehamilton.vip (PRIMARY)
- www.clairehamilton.vip (ALIAS → octopus-app)

**Domains** (Registered but Inactive):

- prebooking.pro (no DNS records)
- avaliable.pro (no DNS records)
- clairehamilton.com.au (may be external)

### NOT Deployed

- ❌ DigitalOcean Functions (0 namespaces)
- ❌ Spaces/CDN (0 buckets)
- ❌ Terraform-managed resources (configs exist but not applied)
- ❌ Multi-domain subdomain routing (only clairehamilton.vip active)

---

## Database Schema

**Schema File**: `db/schema-multi-tenant.sql`  
**Lines**: 1,417  
**Type**: Multi-tenant architecture

### Core Tables (Verified via API)

1. **tenants** - Companion profiles
   - Stores tenant metadata, subdomain, custom domain
   - JSONB fields for theme_config and content_config
   - Status: active/inactive/preview

2. **locations** - Touring schedule
   - Location type: home/touring/available
   - Geographic coordinates for distance calculations
   - Date ranges for availability

3. **availability_calendar** - Booking availability
   - Date-based availability slots
   - Time slots (all-day or specific times)
   - Status: available/booked/blocked/tentative

4. **bookings** - Booking records
   - Client information
   - Service details
   - Payment status
   - Conversion tracking

5. **sessions** - User session tracking
   - UTM attribution
   - Device/browser info
   - Session tracking for analytics

6. **events** - Conversion funnel tracking
   - Event types and metadata
   - Session correlation
   - Analytics data

### Additional Tables

- ab_tests - A/B testing framework
- ab_assignments - Test variant assignments
- payments - Payment transactions
- social_media_metrics - Social correlation data

---

## Current Tenant Data

**Verified**: November 7, 2025

### Tenant: Claire Hamilton

**Tenant ID**: 9daa3c12-bdec-4dc0-993d-7f9f8f391557  
**Subdomain**: claire  
**Name**: Claire Hamilton  
**Email**: info@clairehamilton.vip  
**Custom Domain**: clairehamilton.vip  
**Status**: active  
**Created**: November 6, 2025 21:21:04 UTC  
**Updated**: November 6, 2025 21:26:38 UTC

**Features Enabled**:

- ✅ Booking system
- ✅ Analytics
- ✅ A/B testing
- ✅ Availability calendar

**Social Media**:

- Twitter: https://x.com/ClaireSydney_

### Location: Sydney

**Location ID**: 402b0c59-358c-4fea-b169-e9cec9dac20b  
**Type**: Home base  
**City**: Sydney  
**State**: NSW  
**Country**: Australia (AU)  
**Coordinates**: -33.8688, 151.2093  
**Current**: Yes  
**Public**: Yes  
**Available From**: January 1, 2024  
**Available Until**: Ongoing  
**Available Dates**: 62 slots configured

### Availability Calendar

**Total Slots**: 62  
**Date Range**: November 7, 2025 - February 3, 2026  
**All Slots**: All-day availability  
**Status**: All marked as "available"  
**Created**: November 6, 2025 21:26:38 UTC

---

## API Endpoints

**Base URL**: https://clairehamilton.vip/api

### Verified Working Endpoints

| Method | Endpoint                    | Status     | Description               |
| ------ | --------------------------- | ---------- | ------------------------- |
| GET    | /api/health                 | ✅ Working | Health check              |
| GET    | /api/tenants                | ✅ Working | List all tenants          |
| GET    | /api/tenants/:subdomain     | ✅ Working | Get tenant by subdomain   |
| GET    | /api/locations/:tenantId    | ✅ Working | Get tenant locations      |
| GET    | /api/availability/:tenantId | ✅ Working | Get availability calendar |
| POST   | /api/bookings               | ✅ Working | Create booking            |

### Expected Endpoints (Not Yet Tested)

| Method | Endpoint                       | Expected | Description           |
| ------ | ------------------------------ | -------- | --------------------- |
| GET    | /api/bookings/:id              | Likely   | Get booking details   |
| PATCH  | /api/bookings/:id/status       | Likely   | Update booking status |
| GET    | /api/bookings/tenant/:tenantId | Likely   | Get tenant bookings   |
| POST   | /api/payments                  | Likely   | Create payment        |
| GET    | /api/analytics/\*              | Likely   | Analytics queries     |

---

## Environment Variables

### API Service

```bash
DATABASE_URL=postgresql://doadmin:[password]@companion-platform-db...
DB_HOST=companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=[redacted]
DB_SSL=require
NODE_ENV=production
PORT=8080
```

### Frontend Service

```bash
VITE_API_BASE_URL=https://clairehamilton.vip/api
```

---

## Cost Analysis

**Monthly Costs** (as of November 2025):

| Resource     | Configuration             | Cost          |
| ------------ | ------------------------- | ------------- |
| App Platform | 2× basic-xxs (512MB each) | $12           |
| PostgreSQL   | 1GB RAM, 1 vCPU, 1 node   | $15           |
| Domains      | 4 domains registered      | $4            |
| **Total**    |                           | **$31/month** |

**Not Currently Paying For**:

- Functions (not deployed)
- Spaces/CDN (not created)
- Additional instances or scaling

---

## Development Timeline

**November 4, 2025**: Initial app deployment  
**November 6, 2025**: Database seeded with Claire tenant  
**November 6, 2025**: Location and availability data added  
**November 7, 2025**: Production verification and testing

---

## Completion Status

**Overall Project**: 70-80% Complete

### Completed (✅)

- ✅ Multi-tenant database architecture
- ✅ Express.js API with tenant management
- ✅ Location management system
- ✅ Availability calendar system
- ✅ Tenant data seeded and configured
- ✅ Production deployment on DigitalOcean
- ✅ Custom domain configured
- ✅ SSL/HTTPS via Cloudflare
- ✅ API endpoints operational

### In Progress (⏳)

- ⏳ Frontend booking form integration
- ⏳ Payment processing
- ⏳ Email notifications
- ⏳ Analytics dashboard UI
- ⏳ A/B testing UI

### Planned (📋)

- 📋 Additional tenant onboarding
- 📋 Subdomain routing (\*.prebooking.pro)
- 📋 Admin dashboard
- 📋 Social media integration
- 📋 Advanced analytics

---

## Security

**Implemented**:

- ✅ HTTPS enforced (Cloudflare + DigitalOcean)
- ✅ SSL certificate management (automatic)
- ✅ Database encryption at rest (managed)
- ✅ Environment variable secrets
- ✅ CORS configuration
- ✅ SQL injection protection (parameterized queries)

**Pending**:

- ⏳ Rate limiting
- ⏳ CSRF protection
- ⏳ Input sanitization audit
- ⏳ Authentication system

---

## Monitoring & Logs

**Available**:

- DigitalOcean App Platform metrics
- Database connection monitoring
- Deployment logs
- Runtime logs

**Access**: DigitalOcean Console → Apps → octopus-app → Runtime Logs

---

## Support Resources

**Repository**: https://github.com/AntonyNeal/sw_website  
**Documentation**: See `/docs` directory  
**API Testing**: See `/api/test-*.js` files

---

**Document Maintained By**: Infrastructure Team  
**Last Review**: November 7, 2025  
**Next Review**: Monthly or on major changes
