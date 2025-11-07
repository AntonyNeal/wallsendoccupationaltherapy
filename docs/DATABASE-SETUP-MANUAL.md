# Database Setup - Manual Steps Required

## Current Status

✅ PostgreSQL 16 cluster created and online  
✅ Frontend structure complete  
✅ Claire's tenant config extracted  
⏳ Database schema pending execution

## Issue

The DigitalOcean API does not return database credentials (user/password) for security reasons. You need to retrieve them manually.

## Get Database Credentials (Choose One Method)

### Method 1: DigitalOcean Web Console (Easiest)

1. Go to: https://cloud.digitalocean.com/databases
2. Click on `companion-platform-db`
3. Go to "Connection Details" tab
4. Copy the connection parameters (user, password, URI)

### Method 2: DigitalOcean CLI

```bash
doctl databases connection companion-platform-db --format User,Password
```

## Once You Have Credentials

### 1. Create `.env` file

Create `c:\Users\julia\sw_website\.env` with:

```env
# Database Connection
DATABASE_URL=postgresql://USER:PASSWORD@companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# Replace USER and PASSWORD with actual credentials from DO console
```

### 2. Execute Database Schema

```powershell
node scripts\setup-database.js
```

This will:

- Connect to the database
- Execute `db/schema-multi-tenant.sql`
- Create all 7 tables, 3 views, and 4 functions
- Verify table creation

## Expected Output

```
🔗 Connected to database
📋 Reading schema file...
🚀 Executing schema...

✅ Schema executed successfully!

Created:
  - 7 tables (tenants, sessions, ab_tests, ab_assignments, events, bookings, social_media_metrics)
  - 3 views (funnel_metrics_view, conversion_sources_view, tenant_dashboard_view)
  - 4 functions (track_event, assign_ab_test, create_booking, get_ab_assignment)

📊 Verified tables:
  ✓ ab_assignments
  ✓ ab_tests
  ✓ bookings
  ✓ events
  ✓ sessions
  ✓ social_media_metrics
  ✓ tenants
```

## What's Already Done

### ✅ Frontend Multi-Tenant Infrastructure

- `src/core/types/tenant.types.ts` - TypeScript type definitions
- `src/core/providers/TenantProvider.tsx` - React context for tenant management
- `src/tenants/_template/` - Template for new tenants
- `src/tenants/claire/` - Claire's configuration extracted
- `src/tenants/index.ts` - Tenant registry
- `src/main.tsx` - App wrapped with TenantProvider

### ✅ Database Schema Ready

- `db/schema-multi-tenant.sql` - Complete PostgreSQL schema
- `scripts/setup-database.js` - Schema execution script

### ✅ Documentation

- `MULTI-TENANT-ARCHITECTURE.md` - Complete architecture spec
- `docs/ONBOARDING-GUIDE.md` - New tenant onboarding process
- `docs/DATABASE-CONNECTION.md` - Connection details

## Next Steps (After Schema Execution)

1. **Test Tenant Loading**

   ```bash
   npm run dev
   # Should load Claire's config automatically on localhost
   ```

2. **Insert Claire's Tenant Record**
   Create `scripts/seed-claire.js`:

   ```javascript
   import pg from 'pg';
   import claireConfig from '../src/tenants/claire/index.js';

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false },
   });

   const client = await pool.connect();

   await client.query(
     `
     INSERT INTO tenants (subdomain, name, email, custom_domain, status, theme_config, content_config)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (subdomain) DO UPDATE
     SET theme_config = $6, content_config = $7, updated_at = NOW()
   `,
     [
       'claire',
       'Claire Hamilton',
       'contact.clairehamilton@proton.me',
       'clairehamilton.vip',
       'active',
       JSON.stringify(claireConfig.theme),
       JSON.stringify(claireConfig.content),
     ]
   );

   console.log('✅ Claire tenant seeded');

   client.release();
   pool.end();
   ```

   Then run: `node scripts/seed-claire.js`

3. **Setup Subdomain Testing**
   Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator):

   ```
   127.0.0.1 claire.localhost
   ```

   Then visit: `http://claire.localhost:5173`

4. **Create API Endpoints**
   - `GET /api/tenants/subdomain/:subdomain` - Load tenant config
   - `POST /api/sessions` - Create tracking session
   - `POST /api/events` - Track events
   - `POST /api/bookings` - Submit booking

## Security Notes

- **Never commit `.env` to git** (already in `.gitignore`)
- Database password should only be in environment variables
- Production: Use DigitalOcean App Platform secret environment variables
