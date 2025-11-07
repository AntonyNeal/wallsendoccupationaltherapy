# prebooking.pro Configuration Summary

## ✅ What's Been Done

### 1. Frontend Configuration (`src/core/providers/TenantProvider.tsx`)

**Updated subdomain detection:**

- Now recognizes `*.prebooking.pro` subdomains
- `claire.prebooking.pro` → extracts "claire" as subdomain
- Added "prebooking" to platform domains list
- Fixed API endpoint to match backend routes: `/api/tenants/:subdomain`
- Fixed response parsing: `data.data` (API returns `{success: true, data: {...}}`)

### 2. Backend API Configuration (`api/server.js`)

**Updated CORS to allow wildcard subdomains:**

```javascript
// Allowed origins:
- https://*.prebooking.pro (all subdomains)
- https://*.companionconnect.app (legacy)
- https://clairehamilton.vip (custom domain)
- http://localhost:* (development)
```

### 3. Vercel Configuration (`vercel.json`)

**Added:**

- API route preservation
- CORS headers for all routes
- SPA routing for subdomains

### 4. Documentation

**Created:**

- `DNS-SETUP-GUIDE.md` - Step-by-step Namecheap DNS configuration
- `docs/SUBDOMAIN-ROUTING.md` - Technical architecture documentation

## 🚀 How to Deploy

### Option 1: Deploy to Vercel (Recommended)

```powershell
# 1. Deploy the app
vercel --prod

# 2. Add domains
vercel domains add prebooking.pro
vercel domains add *.prebooking.pro

# 3. Vercel will provide CNAME records
# Add them to Namecheap (see DNS-SETUP-GUIDE.md)
```

### Option 2: Deploy to DigitalOcean App Platform

```powershell
# 1. Push to GitHub
git add .
git commit -m "Add subdomain routing for prebooking.pro"
git push origin main

# 2. In DigitalOcean Console:
# - Go to your App → Settings → Domains
# - Add "prebooking.pro"
# - Add "*.prebooking.pro"
# - Follow DNS instructions provided
```

## 📋 DNS Configuration (Namecheap)

### If using Vercel:

In Namecheap → prebooking.pro → Advanced DNS:

| Type  | Host | Value                |
| ----- | ---- | -------------------- |
| CNAME | @    | cname.vercel-dns.com |
| CNAME | \*   | cname.vercel-dns.com |
| CNAME | www  | cname.vercel-dns.com |

### If using DigitalOcean:

| Type | Host | Value                          |
| ---- | ---- | ------------------------------ |
| A    | @    | [DigitalOcean IP from console] |
| A    | \*   | [Same IP]                      |

## 🧪 Testing After DNS Propagation

```powershell
# Wait 15-30 minutes, then test:

# 1. Check DNS resolution
nslookup claire.prebooking.pro

# 2. Test HTTP access
Start-Process "http://claire.prebooking.pro"

# 3. Test API endpoint
Invoke-RestMethod -Uri "http://claire.prebooking.pro/api/tenants/claire"

# 4. Once SSL is provisioned, test HTTPS
Start-Process "https://claire.prebooking.pro"
```

## 🌐 URL Structure

After deployment, these URLs will work:

### Production URLs:

- **Platform:** `https://prebooking.pro`
- **Claire:** `https://claire.prebooking.pro`
- **Claire (alt):** `https://clairehamilton.vip`
- **API:** `https://prebooking.pro/api/*`

### Development URLs:

- **Local:** `http://localhost:5173` (always loads Claire)
- **API:** `http://localhost:3001/api/*`

## 📊 Current Database

Claire's tenant is already in the database:

- **ID:** `9daa3c12-bdec-4dc0-993d-7f9f8f391557`
- **Subdomain:** `claire`
- **Custom Domain:** `clairehamilton.vip`
- **Status:** `active`
- **Location:** Sydney, Australia
- **Available Dates:** 64 dates (Nov 2025 - Feb 2026)

## ➕ Adding More Companions

Once `claire.prebooking.pro` is working, add more companions:

```sql
-- Add Emma
INSERT INTO tenants (subdomain, name, email, status)
VALUES ('emma', 'Emma Wilson', 'info@emmawilson.com', 'active');

-- Then emma.prebooking.pro will automatically work!
-- No DNS changes needed.
```

## 🔧 Environment Variables

Make sure these are set in your deployment platform:

```env
# Database
DB_HOST=companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=your_database_password_here

# Frontend (Vercel)
VITE_API_BASE_URL=https://prebooking.pro
```

## ✅ Verification Checklist

After deployment and DNS setup:

- [ ] DNS records added in Namecheap
- [ ] Domain added to hosting platform
- [ ] `nslookup claire.prebooking.pro` resolves correctly
- [ ] `http://claire.prebooking.pro` loads (HTTP)
- [ ] SSL certificate provisioned (15-30 min wait)
- [ ] `https://claire.prebooking.pro` loads (HTTPS)
- [ ] API works: `/api/tenants/claire` returns data
- [ ] Subdomain detection works (check browser console)
- [ ] Claire's content loads correctly
- [ ] Custom domain `clairehamilton.vip` still works

## 🐛 Common Issues

### "Tenant not found"

- Check API is deployed and accessible
- Verify tenant exists in database: `SELECT * FROM tenants WHERE subdomain = 'claire'`
- Check browser console for API errors

### CORS errors

- Verify `api/server.js` CORS config includes prebooking.pro
- Check browser network tab for preflight OPTIONS requests
- Make sure API is deployed with updated CORS

### DNS not resolving

- Wait longer (up to 48 hours max, usually 15 min)
- Clear DNS cache: `ipconfig /flushdns`
- Test with Google DNS: `nslookup claire.prebooking.pro 8.8.8.8`

## 📞 Next Steps

1. **Configure DNS in Namecheap** (see DNS-SETUP-GUIDE.md)
2. **Deploy to production** (Vercel or DigitalOcean)
3. **Wait for DNS propagation** (15-30 minutes)
4. **Test `claire.prebooking.pro`**
5. **Proceed with Booking API development** once verified

The code is ready - just needs DNS configuration and deployment! 🚀
