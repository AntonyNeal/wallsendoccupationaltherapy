# Multi-Tenant Platform - Database Setup Guide

## Overview

This guide will help you set up the PostgreSQL database for the multi-tenant companion platform on DigitalOcean.

---

## Option 1: Using DigitalOcean Web Console (Recommended)

### Step 1: Create Database Cluster

1. Go to https://cloud.digitalocean.com/databases
2. Click **"Create Database Cluster"**
3. Configure:
   - **Database Engine:** PostgreSQL 16
   - **Plan:** Dev Database ($15/month)
     - 1 GB RAM
     - 1 vCPU
     - 10 GB Storage
   - **Datacenter Region:** Sydney (syd1)
   - **Cluster Name:** `companion-platform-db`
   - **Database Name:** `companion_platform`
   - **Tags:** `production`, `multi-tenant`

4. Click **"Create Database Cluster"**
5. Wait 3-5 minutes for provisioning

### Step 2: Get Connection Details

Once created, you'll see:

- **Host:** `companion-platform-db-do-user-xxxxx.ondigitalocean.com`
- **Port:** `25060`
- **User:** `doadmin`
- **Password:** `[auto-generated]`
- **Database:** `defaultdb`

**Save these credentials** securely!

### Step 3: Configure Trusted Sources

1. In the database page, go to **"Settings"** → **"Trusted Sources"**
2. Add your IP address:
   - Find your IP: https://www.whatismyip.com/
   - Click "Add Trusted Source"
   - Enter your IP
   - Or add `0.0.0.0/0` (all IPs) for development (NOT recommended for production)

3. Add your App Platform:
   - The database automatically trusts same-datacenter App Platform apps
   - Or manually add the app's outbound IPs

### Step 4: Connect and Run Schema

**Using psql (recommended):**

```bash
# Install PostgreSQL client if needed
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt install postgresql-client

# Connect to database
psql "postgresql://doadmin:YOUR_PASSWORD@companion-platform-db-do-user-xxxxx.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

**Once connected:**

```sql
-- Create a dedicated database
CREATE DATABASE companion_platform;

-- Connect to it
\c companion_platform

-- Run the schema file
\i db/schema-multi-tenant.sql

-- Verify tables created
\dt

-- You should see:
--  tenants
--  sessions
--  ab_tests
--  ab_assignments
--  events
--  bookings
--  social_media_metrics

-- Check views
\dv

-- You should see:
--  v_tenant_performance
--  v_ab_test_results
--  v_traffic_sources
```

### Step 5: Create Application User (Security Best Practice)

```sql
-- Create a dedicated user for the application
CREATE USER app_user WITH PASSWORD 'GENERATE_STRONG_PASSWORD_HERE';

-- Grant permissions
GRANT CONNECT ON DATABASE companion_platform TO app_user;
\c companion_platform
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- For future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO app_user;
```

### Step 6: Test Connection

```sql
-- Insert a test tenant
INSERT INTO tenants (subdomain, name, theme_config, content_config)
VALUES (
  'test',
  'Test Companion',
  '{"colors": {"primary": "#000000"}}'::jsonb,
  '{"name": "Test"}'::jsonb
);

-- Verify insert
SELECT id, subdomain, name, created_at FROM tenants;

-- Delete test data
DELETE FROM tenants WHERE subdomain = 'test';
```

---

## Option 2: Using PowerShell Script (Automated)

Save this as `scripts/setup-database.ps1`:

```powershell
# Multi-Tenant Platform - Database Setup Script
# This script creates and configures the PostgreSQL database on DigitalOcean

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseName = "companion-platform-db",

    [string]$Region = "syd1",
    [string]$Size = "db-s-1vcpu-1gb",
    [string]$Version = "16",
    [string]$ApiToken = $env:DO_API_TOKEN
)

if (-not $ApiToken) {
    Write-Error "DO_API_TOKEN environment variable not set"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

Write-Host "🔧 Creating PostgreSQL database cluster: $DatabaseName"

# Create database cluster
$createBody = @{
    name = $DatabaseName
    engine = "pg"
    version = $Version
    size = $Size
    region = $Region
    num_nodes = 1
    tags = @("production", "multi-tenant")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.digitalocean.com/v2/databases" `
        -Method POST `
        -Headers $headers `
        -Body $createBody

    $dbId = $response.database.id
    Write-Host "✅ Database cluster created: $dbId"
    Write-Host "⏳ Waiting for database to be ready (this may take 3-5 minutes)..."

    # Poll until ready
    $ready = $false
    $attempts = 0
    while (-not $ready -and $attempts -lt 60) {
        Start-Sleep -Seconds 10
        $attempts++

        $status = Invoke-RestMethod `
            -Uri "https://api.digitalocean.com/v2/databases/$dbId" `
            -Headers $headers

        if ($status.database.status -eq "online") {
            $ready = $true
            Write-Host "✅ Database is online!"
        }
        else {
            Write-Host "   Status: $($status.database.status) (attempt $attempts/60)"
        }
    }

    if (-not $ready) {
        Write-Error "Database did not become ready in time"
        exit 1
    }

    # Get connection details
    $db = $status.database.connection
    Write-Host "`n📋 Connection Details:"
    Write-Host "   Host: $($db.host)"
    Write-Host "   Port: $($db.port)"
    Write-Host "   User: $($db.user)"
    Write-Host "   Password: $($db.password)"
    Write-Host "   Database: $($db.database)"
    Write-Host "   SSL: $($db.ssl)"

    # Save to .env file
    $envContent = @"
# Database Configuration
DATABASE_HOST=$($db.host)
DATABASE_PORT=$($db.port)
DATABASE_USER=$($db.user)
DATABASE_PASSWORD=$($db.password)
DATABASE_NAME=$($db.database)
DATABASE_SSL=true

# Connection string
DATABASE_URL=postgresql://$($db.user):$($db.password)@$($db.host):$($db.port)/$($db.database)?sslmode=require
"@

    $envContent | Out-File -FilePath ".env.database" -Encoding UTF8
    Write-Host "`n✅ Connection details saved to .env.database"

    Write-Host "`n📝 Next steps:"
    Write-Host "   1. Review connection details above"
    Write-Host "   2. Add your IP to trusted sources in the DigitalOcean console"
    Write-Host "   3. Run: psql `"$($env:DATABASE_URL)`""
    Write-Host "   4. Execute: \i db/schema-multi-tenant.sql"

}
catch {
    Write-Error "Failed to create database: $($_.Exception.Message)"
    exit 1
}
```

**Run the script:**

```powershell
.\scripts\setup-database.ps1 -DatabaseName "companion-platform-db"
```

---

## Option 3: Using doctl CLI

```bash
# Create database cluster
doctl databases create companion-platform-db \
  --engine pg \
  --version 16 \
  --size db-s-1vcpu-1gb \
  --region syd1 \
  --num-nodes 1

# Get cluster ID
doctl databases list

# Get connection details
doctl databases connection companion-platform-db \
  --format User,Password,Host,Port,Database

# Wait for it to be online
doctl databases get companion-platform-db
```

---

## Environment Variables for Application

Once database is created, add these to your App Platform environment variables:

```bash
DATABASE_URL=postgresql://doadmin:PASSWORD@HOST:25060/companion_platform?sslmode=require
DATABASE_HOST=companion-platform-db-do-user-xxxxx.ondigitalocean.com
DATABASE_PORT=25060
DATABASE_USER=app_user
DATABASE_PASSWORD=YOUR_APP_USER_PASSWORD
DATABASE_NAME=companion_platform
DATABASE_SSL=true
```

**In DigitalOcean App Platform:**

1. Go to your app
2. Settings → Environment Variables
3. Add each variable
4. Check "Encrypt" for passwords
5. Save and redeploy

---

## Backup & Maintenance

### Automatic Backups

- **Daily backups** enabled by default
- **7-day retention** on Dev Database
- **14-day retention** on larger plans

### Manual Backup

```bash
# Using pg_dump
pg_dump "postgresql://doadmin:PASSWORD@HOST:25060/companion_platform?sslmode=require" \
  > backup-$(date +%Y%m%d).sql

# Compress
gzip backup-$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Decompress
gunzip backup-20251107.sql.gz

# Restore
psql "postgresql://doadmin:PASSWORD@HOST:25060/companion_platform?sslmode=require" \
  < backup-20251107.sql
```

---

## Monitoring

### In DigitalOcean Console:

1. Go to your database cluster
2. Click "Insights" tab
3. Monitor:
   - CPU usage
   - Memory usage
   - Disk I/O
   - Connection count
   - Query performance

### Set Up Alerts:

1. Go to "Settings" → "Alerts"
2. Create alerts for:
   - CPU > 80%
   - Memory > 80%
   - Disk > 80%
   - Connection count > 90

---

## Scaling

### When to Scale?

Upgrade if you see:

- ❌ CPU consistently > 70%
- ❌ Memory consistently > 80%
- ❌ Slow query performance
- ❌ Connection limit reached
- ❌ Disk > 75% full

### Scaling Options:

| Plan     | vCPUs | RAM  | Storage | Price   |
| -------- | ----- | ---- | ------- | ------- |
| Dev      | 1     | 1 GB | 10 GB   | $15/mo  |
| Basic    | 1     | 2 GB | 25 GB   | $30/mo  |
| Standard | 2     | 4 GB | 80 GB   | $60/mo  |
| Advanced | 4     | 8 GB | 160 GB  | $120/mo |

**To scale:**

1. Go to database in DigitalOcean console
2. Click "Resize"
3. Select new plan
4. Confirm (no downtime!)

---

## Troubleshooting

### Cannot connect to database?

**Check:**

1. Is your IP in trusted sources?
2. Is the database status "online"?
3. Is SSL mode enabled in connection string?
4. Firewall blocking port 25060?

**Test connection:**

```bash
telnet HOSTNAME 25060
```

### "Too many connections" error?

**Solution:**

```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '5 minutes';
```

Or upgrade to a larger plan with more connection slots.

### Slow queries?

**Identify slow queries:**

```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Add indexes:**

```sql
CREATE INDEX idx_custom ON table_name(column_name);
```

### Database full?

**Check size:**

```sql
SELECT pg_size_pretty(pg_database_size('companion_platform'));
```

**Clean old data:**

```sql
-- Delete sessions older than 2 years (GDPR compliance)
DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '2 years';

-- Vacuum to reclaim space
VACUUM FULL;
```

Or upgrade storage.

---

## Security Best Practices

✅ **DO:**

- Use SSL connections (sslmode=require)
- Create separate app user (not doadmin)
- Restrict trusted sources to specific IPs
- Enable automatic backups
- Rotate passwords regularly
- Use environment variables for credentials
- Monitor connection logs

❌ **DON'T:**

- Expose doadmin credentials
- Allow 0.0.0.0/0 in production
- Store passwords in git
- Use same password for multiple envs
- Ignore security alerts
- Skip backups

---

## Cost Optimization

**For 5 tenants (starting out):**

- Dev Database ($15/mo) is sufficient
- Expect < 1000 sessions/day
- < 10GB storage needed

**For 20+ tenants (scaling):**

- Upgrade to Standard ($60/mo)
- Read replicas for analytics
- Connection pooling (PgBouncer)

**Estimated costs:**

- 5 tenants: $15/mo
- 20 tenants: $60/mo
- 50 tenants: $120/mo

---

## Next Steps

After database is set up:

1. ✅ Verify all tables created
2. ✅ Insert Claire's tenant data
3. ✅ Test session tracking
4. ✅ Configure App Platform connection
5. ✅ Set up monitoring alerts
6. ✅ Schedule backup testing

---

**Questions?** Refer to:

- [DigitalOcean Managed Databases Docs](https://docs.digitalocean.com/products/databases/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- `MULTI-TENANT-ARCHITECTURE.md`
