# Tenant Template

This is the template for creating a new companion profile on the platform.

## Quick Start

1. **Copy this directory:**

   ```bash
   cp -r src/tenants/_template src/tenants/your-subdomain
   ```

2. **Customize configuration files:**
   - `theme.config.ts` - Colors, fonts, layout
   - `content.config.ts` - Bio, services, pricing, contact
   - `photos.config.ts` - Photo URLs and gallery

3. **Upload photos** to DigitalOcean Spaces

4. **Add database entry** for the tenant

5. **Test locally** at `http://your-subdomain.localhost:5173`

## Files

### `theme.config.ts`

Visual styling configuration:

- Brand colors (primary, secondary, accent)
- Typography (heading and body fonts)
- Layout style (elegant, modern, minimal)
- Spacing and border radius

### `content.config.ts`

All text content and business information:

- Name, tagline, bio
- Services offered
- Pricing information
- Contact details (email, phone, social media)
- Availability and preferences
- SEO metadata

### `photos.config.ts`

Photo URLs and configuration:

- Hero photo (with A/B testing variants)
- Gallery photos (8-12 recommended)
- About section photo

### `styles.module.css`

Custom CSS overrides (optional):

- Use only if you need styling beyond the theme config
- CSS variables from theme are available

## Photo Guidelines

**Format:** JPG or WebP  
**Hero:** 1920x1080px (16:9)  
**Gallery:** 1200x800px (3:2)  
**Size:** < 500KB each (optimized)

**Upload to Spaces:**

```bash
doctl spaces upload ./photos/ tenants/your-subdomain/ --recursive
```

## Development

**Test locally:**

```bash
# Edit /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts
127.0.0.1 your-subdomain.localhost

# Start dev server
npm run dev

# Visit
http://your-subdomain.localhost:5173
```

## Deployment

See `docs/ONBOARDING-GUIDE.md` for complete onboarding process.

## Support

Questions? See main documentation or contact the development team.
