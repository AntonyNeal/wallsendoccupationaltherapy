# Get Database Credentials - Step by Step

## Quick Link

🔗 **DigitalOcean Database Console**: https://cloud.digitalocean.com/databases/2ff23557-e61b-44ae-a7b3-290f0fcb7de2

---

## Steps to Get Credentials

### 1. Open DigitalOcean Console

Click the link above or:

- Go to https://cloud.digitalocean.com/databases
- Find "companion-platform-db" in the list
- Click on it

### 2. Get Connection Details

In the database page:

- Look for **"Connection ![alt text](image.png)"** section
- Click **"Connection parameters"** or **"Connection string"** tab
- You'll see:
  - **User**: `doadmin`
  - **Password**: [CLICK "SHOW" to reveal]
  - **Host**: `companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com`
  - **Port**: `25060`
  - **Database**: `defaultdb`

### 3. Copy Connection String

Look for the connection string that looks like:

```
postgresql://doadmin:AVNS_xxxxxxxxxxxxx@companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

---

## Create .env File

Once you have the password, create `.env` file in the root:

```env
# Database Connection
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD_HERE@companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# Or individual components:
DB_HOST=companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_SSL=require
```

**Replace `YOUR_PASSWORD_HERE` with the actual password from the console.**

---

## Execute Schema

After creating `.env` with the correct password:

```powershell
# Run the setup script
node scripts\setup-database.js
```

This will:

1. Connect to the database
2. Execute `db/schema-multi-tenant.sql`
3. Create all 11 tables:
   - tenants
   - locations
   - availability_calendar
   - sessions
   - ab_tests
   - ab_assignments
   - events
   - bookings
   - social_media_posts
   - social_media_post_conversions
   - social_media_metrics
4. Create 7 analytical views
5. Create 15+ helper functions
6. Verify table creation

Expected output:

```
🔗 Connected to database
📋 Reading schema file...
🚀 Executing schema...

✅ Schema executed successfully!

Created:
  - 11 tables
  - 7 views
  - 15 functions

📊 Verified tables:
  ✓ ab_assignments
  ✓ ab_tests
  ✓ availability_calendar
  ✓ bookings
  ✓ events
  ✓ locations
  ✓ sessions
  ✓ social_media_metrics
  ✓ social_media_post_conversions
  ✓ social_media_posts
  ✓ tenants
```

---

## Alternative: Use psql (if installed)

If you have PostgreSQL client installed:

```powershell
# Set password as environment variable
$env:PGPASSWORD = "YOUR_PASSWORD_HERE"

# Execute schema
psql -h companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com `
     -p 25060 `
     -U doadmin `
     -d defaultdb `
     -f db\schema-multi-tenant.sql `
     "sslmode=require"
```

---

## Troubleshooting

### "Password authentication failed"

- Double-check you copied the full password from DO console
- Password may contain special characters - ensure they're not escaped
- Try wrapping password in quotes if it has special chars

### "Connection timeout"

- Ensure you're not behind a restrictive firewall
- DigitalOcean database is online (status: online ✅)
- SSL is required - don't skip sslmode=require

### "Cannot find module 'pg'"

Already installed, but if needed:

```powershell
npm install pg
```

---

## What Happens Next

After schema execution:

1. ✅ Database structure ready
2. ⏭️ Seed Claire's tenant data
3. ⏭️ Build API endpoints
4. ⏭️ Test tenant loading
5. ⏭️ Start tracking analytics

---

## Security Reminder

⚠️ **NEVER commit `.env` to git**

- Already in `.gitignore`
- Password gives full database access
- Use environment variables in production
