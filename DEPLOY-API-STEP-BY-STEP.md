# Step-by-Step: Add API Service to DigitalOcean

## Current Status

✅ Code pushed to GitHub
❌ API service NOT deployed (needs manual configuration)
✅ Frontend still working at clairehamilton.vip

## Steps to Deploy API

### 1. Open DigitalOcean Console

Go to: https://cloud.digitalocean.com/apps

### 2. Find Your App

Look for your app. It might be named:

- `claire-hamilton-website`
- `octopus-app`
- or something similar

Click on it to open.

### 3. Go to Settings Tab

Click the "Settings" tab at the top

### 4. Find "App Spec" Section

Scroll down until you see "App Spec"

### 5. Click "Edit" or "Edit Spec"

There should be a button to edit the app specification

### 6. You'll See Current YAML

It probably looks like this:

```yaml
name: claire-hamilton-website
services:
  - name: frontend
    github:
      repo: AntonyNeal/sw_website
      branch: main
    # ... frontend config
```

### 7. Check for Component Count

Look at the top - does it say "1 component" or "2 components"?

- If it says "1 component" → API not deployed yet
- If it says "2 components" → API might already be there!

### 8a. If API is Already There (2 components)

Look for a service named "api" in the spec. If you see it:

- Check if it has "source_dir: /api"
- Make sure it's pointing to correct branch
- Click "Save" if any changes needed
- Skip to Step 10 (Wait for Deployment)

### 8b. If API is NOT There (1 component only)

You need to add the API service. Click "Edit Spec" and add this ABOVE the frontend service:

```yaml
# Add this NEW service
- name: api
  github:
    repo: AntonyNeal/sw_website
    branch: main
    deploy_on_push: true
  source_dir: /api
  build_command: npm install
  run_command: node server.js
  http_port: 8080
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
    - path: /api
```

### 9. Add Environment Variables for API

In the same YAML, under the `api` service, add these environment variables:

```yaml
envs:
  - key: DATABASE_URL
    scope: RUN_TIME
    type: SECRET
  - key: DB_HOST
    scope: RUN_TIME
  - key: DB_PORT
    scope: RUN_TIME
  - key: DB_NAME
    scope: RUN_TIME
  - key: DB_USER
    scope: RUN_TIME
  - key: DB_PASSWORD
    scope: RUN_TIME
    type: SECRET
  - key: DB_SSL
    scope: RUN_TIME
    value: require
  - key: NODE_ENV
    scope: RUN_TIME
    value: production
```

### 10. Set Environment Variable VALUES

After adding the service, you need to set the actual values:

1. Stay in Settings → scroll to "Environment Variables"
2. Look for the API component
3. For each variable, click "Edit" and enter:
   - `DATABASE_URL`: Get from your database connection info (full connection string)
   - `DB_HOST`: `companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com`
   - `DB_PORT`: `25060`
   - `DB_NAME`: `defaultdb`
   - `DB_USER`: `doadmin`
   - `DB_PASSWORD`: (get from your database settings)
   - `DB_SSL`: `require` (already set)
   - `NODE_ENV`: `production` (already set)

### 11. Save Changes

Click "Save" button at the bottom

### 12. Confirm Deployment

A popup will show estimated costs:

- Basic XXS: $5/month for API service
- Click "Deploy Changes" or "Save & Deploy"

### 13. Wait for Deployment (5-10 minutes)

- Go to "Activity" tab
- Watch for "Deployment in progress"
- Wait until you see "Deployed successfully"
- Both "frontend" and "api" services should show "Active"

### 14. Test the API

Once deployment completes, run these tests:

```powershell
# Test 1: Health check
Invoke-RestMethod -Uri "https://clairehamilton.vip/api/health" -Method GET

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2025-11-07...",
#   "service": "sw-website-api"
# }

# Test 2: Get tenant
Invoke-RestMethod -Uri "https://clairehamilton.vip/api/tenants/claire" -Method GET

# Should return Claire's tenant data
```

## Troubleshooting

### If deployment fails:

1. Click on the failed deployment in Activity tab
2. Look at "Build Logs" or "Runtime Logs"
3. Common errors:
   - "Cannot find module" → Check package.json is in api folder
   - "Connection refused" → Check DATABASE_URL is correct
   - "Port already in use" → Check http_port is 8080

### If you see "Cannot find module 'express'":

The build didn't run correctly. Check:

- `source_dir: /api` is set correctly
- `build_command: npm install` is present
- api/package.json exists in the repo

### If you see database connection errors:

- Verify DATABASE_URL includes full connection string
- Check DB_PASSWORD is correct (get from DB settings)
- Ensure DB is in same region (nyc)

## What Happens After Deployment

Once working, your app will have:

- **Frontend**: clairehamilton.vip/ (React app)
- **API**: clairehamilton.vip/api/\* (All API endpoints)

Routes:

- `/` → Frontend
- `/api/health` → API health check
- `/api/tenants/*` → Tenant API
- `/api/availability/*` → (Will add next)
- `/api/bookings/*` → (Will add next)

## Need Help?

Take a screenshot of:

1. The App Spec (YAML)
2. Any error messages
3. The deployment logs

And I can help debug!
