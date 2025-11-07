# DNS Configuration for prebooking.pro

## Step-by-Step Guide to Make claire.prebooking.pro Live

### Step 1: Log into Namecheap

1. Go to https://www.namecheap.com
2. Click "Sign In" and log into your account
3. Navigate to **Domain List**
4. Find `prebooking.pro` and click **Manage**

### Step 2: Configure DNS Records

Click on the **Advanced DNS** tab and add the following records:

#### Option A: Using Vercel (Recommended)

**If deploying to Vercel:**

1. **Add to Vercel first:**

   ```bash
   # In your terminal
   vercel --prod
   vercel domains add prebooking.pro
   vercel domains add *.prebooking.pro
   ```

2. **Vercel will provide CNAME records like:**
   - `cname.vercel-dns.com`

3. **Add these records in Namecheap:**

   | Type  | Host | Value                | TTL       |
   | ----- | ---- | -------------------- | --------- |
   | CNAME | @    | cname.vercel-dns.com | Automatic |
   | CNAME | \*   | cname.vercel-dns.com | Automatic |
   | CNAME | www  | cname.vercel-dns.com | Automatic |

#### Option B: Using DigitalOcean App Platform

**If deploying to DigitalOcean:**

1. **In DigitalOcean Console:**
   - Go to your App → Settings → Domains
   - Click "Add Domain"
   - Enter `prebooking.pro`
   - Add another domain: `*.prebooking.pro`
   - DigitalOcean will provide DNS records

2. **Add the provided records in Namecheap:**

   Example records (use the actual values from DigitalOcean):

   | Type  | Host | Value                             | TTL       |
   | ----- | ---- | --------------------------------- | --------- |
   | A     | @    | 147.182.XXX.XXX (DigitalOcean IP) | Automatic |
   | A     | \*   | 147.182.XXX.XXX (same IP)         | Automatic |
   | CNAME | www  | your-app.ondigitalocean.app       | Automatic |

#### Option C: Direct Server IP (If self-hosting)

If you have a VPS or dedicated server:

| Type | Host | Value          | TTL       |
| ---- | ---- | -------------- | --------- |
| A    | @    | YOUR_SERVER_IP | Automatic |
| A    | \*   | YOUR_SERVER_IP | Automatic |
| A    | www  | YOUR_SERVER_IP | Automatic |

### Step 3: Update Nameservers (if needed)

Make sure Namecheap is managing DNS:

1. In Domain List → Manage → **Domain** tab
2. **Nameservers** should be set to: **Namecheap BasicDNS**
   - `dns1.registrar-servers.com`
   - `dns2.registrar-servers.com`

If you see other nameservers, click "Custom DNS" → "Namecheap BasicDNS"

### Step 4: Wait for DNS Propagation

- **Typical wait time:** 15-30 minutes
- **Maximum:** Up to 48 hours (rare)

### Step 5: Verify DNS Configuration

**Windows PowerShell:**

```powershell
# Test subdomain resolution
nslookup claire.prebooking.pro

# Should return your server IP or CNAME
```

**Online Tools:**

- https://dnschecker.org
- https://mxtoolbox.com/DNSLookup.aspx
- Enter `claire.prebooking.pro`

### Step 6: Test in Browser

Once DNS propagates:

```powershell
# Open in browser
Start-Process "http://claire.prebooking.pro"

# Or test with curl
Invoke-RestMethod -Uri "http://claire.prebooking.pro" | Select-Object -First 100
```

### Step 7: Enable SSL (HTTPS)

**Vercel:**

- SSL is automatic once DNS is configured
- Visit https://claire.prebooking.pro (will work within minutes)

**DigitalOcean:**

- Go to App → Settings → Domains
- SSL certificates auto-provision for verified domains
- Check status: "Certificate Status: Active"

**Let's Encrypt (self-hosting):**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get wildcard certificate
sudo certbot certonly --manual --preferred-challenges=dns -d prebooking.pro -d *.prebooking.pro

# Follow prompts to add TXT records in Namecheap
```

## Current Status Checklist

- [ ] DNS records added in Namecheap
- [ ] Domain added to hosting platform (Vercel/DigitalOcean)
- [ ] DNS propagation complete (use nslookup)
- [ ] HTTP access works (http://claire.prebooking.pro)
- [ ] SSL certificate provisioned
- [ ] HTTPS access works (https://claire.prebooking.pro)
- [ ] API endpoints accessible
- [ ] Tenant loads correctly

## Testing Endpoints

Once live, test these:

```powershell
# Test API
Invoke-RestMethod -Uri "https://prebooking.pro/api/tenants/claire"

# Test subdomain
Invoke-RestMethod -Uri "https://claire.prebooking.pro/api/tenants/claire"

# Test locations
Invoke-RestMethod -Uri "https://claire.prebooking.pro/api/locations/9daa3c12-bdec-4dc0-993d-7f9f8f391557"
```

## Troubleshooting

### DNS not resolving

```powershell
# Clear local DNS cache
ipconfig /flushdns

# Check DNS propagation
nslookup claire.prebooking.pro 8.8.8.8  # Google DNS
nslookup claire.prebooking.pro 1.1.1.1  # Cloudflare DNS
```

### SSL certificate not provisioning

- Wait 15-30 minutes after DNS propagates
- Check platform dashboard for certificate status
- Ensure both @ and \* records point correctly

### Subdomain not loading tenant

1. Check browser console for errors
2. Verify API endpoint: `/api/tenants/claire`
3. Check TenantProvider subdomain detection
4. Verify CORS settings in API

### API returns 404

- Check API routes are deployed
- Verify API base URL in `.env`
- Test direct API endpoint first

## Quick Reference

**Main domain:** https://prebooking.pro
**Claire's subdomain:** https://claire.prebooking.pro
**Claire's custom domain:** https://clairehamilton.vip

**API Base:** https://prebooking.pro/api
**Tenant API:** https://prebooking.pro/api/tenants/claire
**Availability API:** https://prebooking.pro/api/availability/:tenantId

## Next Steps After DNS is Live

1. Deploy updated code to production
2. Test all subdomains work
3. Add more companions to database
4. Configure their subdomains (no DNS changes needed!)
5. Test booking flow end-to-end
