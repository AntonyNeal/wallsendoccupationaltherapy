# Subdomain Routing with prebooking.pro

This document explains how to configure `prebooking.pro` so that each companion gets their own subdomain (e.g., `claire.prebooking.pro`).

## Domain Configuration

### Current Setup

- **Domain**: `prebooking.pro` (registered with Namecheap)
- **Subdomain Pattern**: `{subdomain}.prebooking.pro`
- **Example**: `claire.prebooking.pro` → Claire Hamilton's booking page

### DNS Configuration (Namecheap)

#### Step 1: Configure Wildcard DNS

In your Namecheap DNS settings for `prebooking.pro`:

1. **Add A Record for root domain:**
   - Type: `A Record`
   - Host: `@`
   - Value: `your-server-ip` or point to DigitalOcean App Platform

2. **Add Wildcard A Record for subdomains:**
   - Type: `A Record`
   - Host: `*`
   - Value: `same-server-ip`
   - TTL: Automatic or 300

**OR** if using DigitalOcean App Platform:

3. **Add CNAME for wildcard:**
   - Type: `CNAME Record`
   - Host: `*`
   - Value: `your-app.ondigitalocean.app`
   - TTL: Automatic

#### Step 2: Verify DNS Propagation

```powershell
# Test wildcard DNS
nslookup claire.prebooking.pro
nslookup test.prebooking.pro

# Should resolve to your server IP or DigitalOcean app
```

## Application Configuration

### Frontend: TenantProvider

The `TenantProvider` already supports subdomain detection. Update the domain check:

```typescript
// src/tenants/TenantProvider.tsx

const detectTenant = (): string | null => {
  const hostname = window.location.hostname;

  // Check for prebooking.pro subdomains
  if (hostname.endsWith('.prebooking.pro')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'prebooking') {
      return subdomain; // e.g., 'claire' from 'claire.prebooking.pro'
    }
  }

  // Check for custom domains
  if (hostname === 'clairehamilton.vip') {
    return 'claire';
  }

  // Development fallback
  if (hostname === 'localhost') {
    return 'claire'; // Or read from localStorage
  }

  return null;
};
```

### Backend: CORS Configuration

Update CORS to allow all subdomains:

```javascript
// api/server.js

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all subdomains of prebooking.pro
      const allowedPatterns = [
        /^https?:\/\/([a-z0-9-]+\.)?prebooking\.pro$/,
        /^https?:\/\/clairehamilton\.vip$/,
        /^http:\/\/localhost(:\d+)?$/,
      ];

      if (!origin || allowedPatterns.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

## Database Updates

### Update Tenant Records

```sql
-- Update Claire's tenant record to use prebooking.pro subdomain
UPDATE tenants
SET subdomain = 'claire',
    custom_domain = 'clairehamilton.vip'  -- Keep custom domain as alternative
WHERE id = '9daa3c12-bdec-4dc0-993d-7f9f8f391557';

-- Add more companions
INSERT INTO tenants (subdomain, name, email, status)
VALUES
  ('emma', 'Emma Wilson', 'info@emmawilson.com', 'active'),
  ('sophia', 'Sophia Chen', 'info@sophiachen.com', 'active');
```

## Deployment

### DigitalOcean App Platform

1. **Add domain in App Settings:**
   - Go to Settings → Domains
   - Add `prebooking.pro`
   - Add `*.prebooking.pro` (wildcard)
   - DigitalOcean will provide DNS records

2. **Update DNS at Namecheap:**
   - Use the CNAME records provided by DigitalOcean
   - Wait for DNS propagation (up to 48 hours, usually minutes)

3. **SSL Certificates:**
   - DigitalOcean automatically provisions SSL for wildcard domains
   - Both `prebooking.pro` and `claire.prebooking.pro` will be HTTPS

### Vercel (Alternative)

If using Vercel:

1. **Add domain:**

   ```bash
   vercel domains add prebooking.pro
   vercel domains add *.prebooking.pro
   ```

2. **Configure DNS:**
   - Vercel will provide CNAME records
   - Add them to Namecheap DNS

## Testing

### Test Subdomain Routing

```powershell
# Test API
Invoke-RestMethod -Uri "https://prebooking.pro/api/tenants/claire"

# Test subdomain (after DNS propagation)
Start-Process "https://claire.prebooking.pro"
```

### Test Custom Domain

```powershell
# Claire's custom domain should still work
Start-Process "https://clairehamilton.vip"
```

## URL Examples

- **Main site**: `https://prebooking.pro` (platform landing page)
- **Claire**: `https://claire.prebooking.pro` OR `https://clairehamilton.vip`
- **Emma**: `https://emma.prebooking.pro`
- **Sophia**: `https://sophia.prebooking.pro`

## Troubleshooting

### Subdomain not resolving

```powershell
# Check DNS
nslookup claire.prebooking.pro

# Clear DNS cache
ipconfig /flushdns
```

### CORS errors

- Check `ALLOWED_ORIGINS` in `.env`
- Verify CORS regex patterns in `server.js`
- Test with browser dev tools (Network tab)

### Tenant not loading

1. Check API endpoint: `GET /api/tenants/claire`
2. Verify subdomain detection in browser console
3. Check TenantProvider logic

## Benefits of This Setup

1. **Easy Scaling**: Add new companions by just creating tenant records
2. **Professional URLs**: Each companion gets `name.prebooking.pro`
3. **Custom Domains**: Supports custom domains like `clairehamilton.vip`
4. **Centralized Management**: All companions share same codebase
5. **SSL Included**: Wildcard SSL covers all subdomains

## Next Steps

1. Update DNS at Namecheap (see Step 1 above)
2. Wait for DNS propagation (~15 minutes)
3. Test `claire.prebooking.pro` works
4. Deploy frontend with updated `TenantProvider`
5. Add more companions to the database
