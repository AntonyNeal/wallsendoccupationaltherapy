# avaliable.pro Domain Configuration

**Date:** January 7, 2025  
**Primary Platform Domain:** avaliable.pro  
**Status:** 🔄 Configuration in progress

---

## Domain Overview

**avaliable.pro** is now the primary platform domain for the multi-tenant companion booking system.

### Domain Structure:

```
avaliable.pro                    → Platform landing page
claire.avaliable.pro            → Claire Hamilton's booking site
*.avaliable.pro                 → Tenant subdomains
```

### Legacy Domains (Maintained for Compatibility):

```
prebooking.pro                  → Legacy platform domain
*.prebooking.pro               → Legacy tenant subdomains
companionconnect.app           → Original platform domain
*.companionconnect.app         → Original tenant subdomains
clairehamilton.vip             → Custom domain for Claire
```

---

## DNS Configuration

### Required DNS Records (Namecheap/Cloudflare):

#### For Platform Root:

```
Type: A Record
Host: @
Value: <DigitalOcean App Platform IP> or CNAME to alias
TTL: Automatic
```

#### For Wildcard Subdomains:

```
Type: A Record
Host: *
Value: <DigitalOcean App Platform IP> or CNAME to alias
TTL: Automatic
```

#### Alternative (CNAME):

```
Type: CNAME
Host: @
Value: your-app.ondigitalocean.app
TTL: Automatic

Type: CNAME
Host: *
Value: your-app.ondigitalocean.app
TTL: Automatic
```

---

## Code Changes Implemented

### 1. API Server (api/server.js) ✅

Added `avaliable.pro` to allowed CORS origins:

```javascript
const allowedPatterns = [
  /^https?:\/\/([a-z0-9-]+\.)?avaliable\.pro$/, // *.avaliable.pro (PRIMARY)
  /^https?:\/\/([a-z0-9-]+\.)?prebooking\.pro$/, // *.prebooking.pro (legacy)
  /^https?:\/\/([a-z0-9-]+\.)?companionconnect\.app$/, // *.companionconnect.app (legacy)
  /^https?:\/\/clairehamilton\.vip$/, // clairehamilton.vip (custom)
  /^http:\/\/localhost(:\d+)?$/, // localhost
  /^http:\/\/127\.0\.0\.1(:\d+)?$/, // 127.0.0.1
];
```

### 2. Tenant Provider (src/core/providers/TenantProvider.tsx) ✅

Added subdomain extraction for `avaliable.pro`:

```typescript
// For xxx.avaliable.pro, return 'xxx'
if (host.endsWith('.avaliable.pro')) {
  return parts[0];
}

// For xxx.prebooking.pro, return 'xxx' (legacy)
if (host.endsWith('.prebooking.pro')) {
  return parts[0];
}
```

Added platform domain detection:

```typescript
const platformSubdomains = [
  '',
  'www',
  'companionconnect',
  'platform',
  'admin',
  'prebooking',
  'avaliable',
];
```

### 3. SDK Client (sdk/src/client.ts) ✅

Updated default API base URL:

```typescript
constructor(baseURL: string = 'https://avaliable.pro/api') {
  this.baseURL = baseURL;
}
```

---

## Deployment Steps

### 1. Update Domain in Namecheap ✅

You've already registered `avaliable.pro` (expires Nov 6, 2026).

**Next Steps:**

1. Go to Namecheap → avaliable.pro → Advanced DNS
2. Add DNS records (see above)
3. Wait for DNS propagation (5-60 minutes)

### 2. Configure DigitalOcean App Platform

```bash
# Add domain in App Platform UI:
# 1. Go to App Platform → Your App → Settings → Domains
# 2. Click "Add Domain"
# 3. Add: avaliable.pro
# 4. Add: *.avaliable.pro
# 5. Enable automatic SSL certificate
```

### 3. Update Environment Variables (if needed)

```bash
# .env
VITE_PLATFORM_DOMAIN=avaliable.pro
VITE_API_BASE_URL=https://avaliable.pro/api
```

### 4. Deploy Code Changes

```bash
# Commit and push
git add .
git commit -m "feat: Add avaliable.pro as primary platform domain"
git push origin main

# DigitalOcean will auto-deploy
```

### 5. Update DNS Verification

```bash
# Test DNS resolution
nslookup avaliable.pro
nslookup claire.avaliable.pro

# Test in browser
https://avaliable.pro
https://claire.avaliable.pro
```

---

## Testing Checklist

### DNS Tests:

- [ ] `avaliable.pro` resolves to DigitalOcean
- [ ] `*.avaliable.pro` resolves to DigitalOcean
- [ ] SSL certificate auto-provisioned
- [ ] Both HTTP and HTTPS work

### API Tests:

```bash
# Test tenant API
curl https://avaliable.pro/api/tenants/claire

# Test health check
curl https://avaliable.pro/api/health

# Test subdomain
curl https://claire.avaliable.pro/api/tenants/claire
```

### Browser Tests:

- [ ] Platform root loads: `https://avaliable.pro`
- [ ] Tenant subdomain loads: `https://claire.avaliable.pro`
- [ ] CORS allows API requests
- [ ] Subdomain routing works correctly
- [ ] Legacy domains still work

---

## Migration Plan

### Phase 1: Dual Domain Support (Current) ✅

- Both `avaliable.pro` and `prebooking.pro` work
- No breaking changes to existing users
- Code supports all domains

### Phase 2: Primary Domain Transition (1-2 weeks)

- Update all documentation to use `avaliable.pro`
- Update marketing materials
- Add redirects from legacy domains

### Phase 3: Legacy Domain Deprecation (3-6 months)

- Notify users of domain change
- Set up permanent redirects (301)
- Update all tenant configurations

---

## URL Structure

### Platform URLs:

```
https://avaliable.pro                     → Platform home/showcase
https://avaliable.pro/api/*              → API endpoints
https://avaliable.pro/api/health         → Health check
```

### Tenant URLs:

```
https://claire.avaliable.pro             → Claire's booking site
https://sophie.avaliable.pro             → Sophie's booking site (when onboarded)
https://jessica.avaliable.pro            → Jessica's booking site (when onboarded)
```

### Custom Domains (Optional):

```
https://clairehamilton.vip               → Claire's custom domain
→ CNAME to claire.avaliable.pro
```

---

## Tenant Subdomain Examples

| Tenant Name     | Subdomain | Full URL                        |
| --------------- | --------- | ------------------------------- |
| Claire Hamilton | `claire`  | `https://claire.avaliable.pro`  |
| Sophie Chen     | `sophie`  | `https://sophie.avaliable.pro`  |
| Jessica Moore   | `jessica` | `https://jessica.avaliable.pro` |
| Emma Watson     | `emma`    | `https://emma.avaliable.pro`    |
| Olivia Davis    | `olivia`  | `https://olivia.avaliable.pro`  |

---

## SDK Usage with New Domain

### Browser (CDN):

```html
<!-- Will be updated after CDN setup -->
<script src="https://cdn.avaliable.pro/companion-sdk@1.0.0.js"></script>
```

### npm:

```javascript
import { TenantDataSource } from '@clairehamilton/companion-sdk';

// SDK automatically uses avaliable.pro API
const tenant = await TenantDataSource.getBySubdomain('claire');
```

### API Client:

```typescript
// Default API base URL is now avaliable.pro
const client = new ApiClient(); // Uses https://avaliable.pro/api

// Or specify custom URL
const client = new ApiClient('https://custom.domain/api');
```

---

## Verification Commands

### PowerShell:

```powershell
# Test DNS
nslookup avaliable.pro
nslookup claire.avaliable.pro

# Test API
Invoke-RestMethod -Uri "https://avaliable.pro/api/health"
Invoke-RestMethod -Uri "https://avaliable.pro/api/tenants/claire"

# Open in browser
Start-Process "https://avaliable.pro"
Start-Process "https://claire.avaliable.pro"
```

### Bash:

```bash
# Test DNS
dig avaliable.pro
dig claire.avaliable.pro

# Test API
curl https://avaliable.pro/api/health
curl https://avaliable.pro/api/tenants/claire

# Test HTTPS
curl -I https://avaliable.pro
```

---

## Cloudflare Configuration (Optional)

For better performance and DDoS protection:

1. **Add Site to Cloudflare:**
   - Add `avaliable.pro` to Cloudflare
   - Update Namecheap nameservers to Cloudflare's

2. **DNS Records:**

   ```
   Type: CNAME
   Name: @
   Content: your-app.ondigitalocean.app
   Proxy: Enabled (orange cloud)

   Type: CNAME
   Name: *
   Content: your-app.ondigitalocean.app
   Proxy: Enabled (orange cloud)
   ```

3. **SSL/TLS Settings:**
   - Mode: Full (Strict)
   - Always Use HTTPS: ON
   - Auto HTTPS Rewrites: ON

4. **Performance:**
   - Brotli: ON
   - HTTP/2: ON
   - HTTP/3 (QUIC): ON

---

## Security Considerations

### SSL/TLS:

- ✅ Automatic Let's Encrypt certificates via DigitalOcean
- ✅ Wildcard certificate for `*.avaliable.pro`
- ✅ Force HTTPS redirect

### CORS:

- ✅ Strict origin checking
- ✅ Credentials support enabled
- ✅ Pattern-based domain matching

### WHOIS Privacy:

- ✅ Enabled on avaliable.pro (auto-renew: ON)

---

## Support & Documentation

### Internal Docs:

- `PREBOOKING-PRO-SETUP.md` - Legacy prebooking.pro setup
- `MULTI-TENANT-ARCHITECTURE.md` - Multi-tenant system design
- `DNS-SETUP-GUIDE.md` - DNS configuration guide
- `DIGITALOCEAN-DOMAIN-SETUP.md` - DigitalOcean domain setup

### External Links:

- Domain registrar: Namecheap
- Hosting: DigitalOcean App Platform (Sydney)
- CDN: Cloudflare (optional)

---

## Troubleshooting

### DNS Not Resolving:

```bash
# Check nameservers
nslookup -type=NS avaliable.pro

# Force DNS refresh (Windows)
ipconfig /flushdns

# Force DNS refresh (Mac/Linux)
sudo dscacheutil -flushcache
```

### CORS Errors:

- Check browser console for specific error
- Verify domain in allowed patterns (api/server.js)
- Check if subdomain matches pattern

### SSL Certificate Issues:

- Wait for auto-provisioning (5-15 minutes)
- Check DigitalOcean App Platform SSL status
- Verify DNS is pointing correctly

---

## Next Steps

1. **Complete DNS Setup** in Namecheap:
   - Add A/CNAME records for `avaliable.pro`
   - Add wildcard record for `*.avaliable.pro`

2. **Configure DigitalOcean:**
   - Add `avaliable.pro` domain
   - Add `*.avaliable.pro` wildcard
   - Wait for SSL certificate

3. **Test Everything:**
   - DNS resolution
   - HTTPS access
   - API endpoints
   - Subdomain routing

4. **Update Documentation:**
   - Update README.md
   - Update all example URLs
   - Update marketing materials

5. **Monitor:**
   - Check health endpoints
   - Monitor error logs
   - Track DNS propagation

---

**Status:** Configuration Complete  
**Date:** January 7, 2025  
**Domain Expires:** November 6, 2026  
**Auto-Renew:** ✅ Enabled
