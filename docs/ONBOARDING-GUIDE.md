# Adding a New Companion - Step-by-Step Guide

This guide walks through the complete process of onboarding a new companion to the platform.

**Estimated Time:** 30-45 minutes

---

## Prerequisites

- Git access to the repository
- DigitalOcean Spaces credentials (for photo uploads)
- Companion's content ready:
  - Profile photos (hero, gallery)
  - Bio and services description
  - Pricing information
  - Contact details
  - Social media handles

---

## Step 1: Create Git Branch

```bash
# Make sure you're on the latest develop branch
git checkout develop
git pull origin develop

# Create new branch for the companion
git checkout -b tenant/emma
```

**Branch Naming Convention:** `tenant/[subdomain]`

---

## Step 2: Copy Template Structure

```bash
# Navigate to tenants directory
cd src/tenants

# Copy the template
cp -r _template emma

# Verify the copy
ls emma/
# Should show: theme.config.ts, content.config.ts, photos.config.ts, styles.module.css, README.md
```

---

## Step 3: Configure Theme

Edit `src/tenants/emma/theme.config.ts`:

```typescript
import { TenantTheme } from '../../core/types/tenant.types';

export const theme: TenantTheme = {
  colors: {
    primary: '#FF6B9D', // Emma's signature pink
    secondary: '#FFC6D9', // Light pink
    accent: '#FFE5EC', // Pale pink
    background: '#FFFFFF',
    text: '#2C2C2C',
    textLight: '#6B6B6B',
  },

  fonts: {
    heading: 'Cormorant Garamond', // Elegant serif
    body: 'Raleway', // Clean sans-serif
  },

  layout: 'modern', // 'elegant' | 'modern' | 'minimal'
  spacing: 'comfortable', // 'compact' | 'comfortable' | 'spacious'

  borderRadius: '12px', // Rounded corners
  shadowIntensity: 'medium', // 'light' | 'medium' | 'strong'
};
```

**Tips:**

- Use a color picker to match her brand colors
- Test fonts at https://fonts.google.com
- Choose layout style that matches her personality

---

## Step 4: Configure Content

Edit `src/tenants/emma/content.config.ts`:

```typescript
import { TenantContent } from '../../core/types/tenant.types';

export const content: TenantContent = {
  name: 'Emma Rose',
  tagline: "Melbourne's Most Sought-After Companion",

  bio: `With a background in classical music and a passion for fine dining, 
I offer sophisticated companionship for discerning gentlemen...`,

  services: [
    {
      id: 'dinner-date',
      name: 'Dinner Date',
      description: 'Elegant companionship for social events and fine dining',
      duration: '3-4 hours',
      price: 1200,
      featured: true,
    },
    {
      id: 'overnight',
      name: 'Overnight Experience',
      description: 'Extended companionship with no rush',
      duration: '12 hours',
      price: 4000,
      featured: true,
    },
    {
      id: 'weekend',
      name: 'Weekend Getaway',
      description: 'Travel companionship for weekend escapes',
      duration: '48 hours',
      price: 9000,
      featured: false,
    },
  ],

  pricing: {
    hourly: 600,
    overnight: 4000,
    weekend: 9000,
    displayHourly: true, // Show hourly rate
  },

  contact: {
    email: 'emma@companionconnect.app',
    phone: '+61 4XX XXX XXX', // Or omit if not provided
    availableHours: '11:00 - 23:00 AEST',
    responseTime: '2-4 hours',
  },

  socialMedia: {
    instagram: '@emma_rose_melb',
    twitter: '@emmarose',
    onlyfans: 'emmarose', // Optional
  },

  availability: {
    location: 'Melbourne, VIC',
    willingToTravel: true,
    travelCities: ['Sydney', 'Brisbane', 'Gold Coast'],
  },

  preferences: {
    minAge: 25,
    minNotice: '24 hours',
    depositRequired: true,
    depositAmount: 200,
  },

  seo: {
    title: 'Emma Rose - Premium Melbourne Companion',
    description:
      'Sophisticated companionship in Melbourne. Classical musician, fine dining enthusiast, and engaging conversationalist.',
    keywords: ['melbourne companion', 'luxury escort', 'high-end', 'premium'],
  },
};
```

---

## Step 5: Configure Photos (A/B Testing)

Edit `src/tenants/emma/photos.config.ts`:

```typescript
import { TenantPhotos } from '../../core/types/tenant.types';

export const photos: TenantPhotos = {
  // Hero photo A/B test
  hero: {
    control: {
      id: 'hero_1',
      url: 'https://companion-photos.syd1.digitaloceanspaces.com/emma/hero-1.jpg',
      alt: 'Emma Rose - Melbourne Companion',
    },
    variants: [
      {
        id: 'hero_2',
        url: 'https://companion-photos.syd1.digitaloceanspaces.com/emma/hero-2.jpg',
        alt: 'Emma Rose - Elegant Portrait',
        weight: 0.5, // 50/50 split with control
      },
    ],
  },

  // Gallery photos
  gallery: [
    {
      id: 1,
      url: 'https://companion-photos.syd1.digitaloceanspaces.com/emma/gallery-1.jpg',
      alt: 'Emma in evening wear',
      category: 'formal',
    },
    {
      id: 2,
      url: 'https://companion-photos.syd1.digitaloceanspaces.com/emma/gallery-2.jpg',
      alt: 'Professional portrait',
      category: 'portrait',
    },
    {
      id: 3,
      url: 'https://companion-photos.syd1.digitaloceanspaces.com/emma/gallery-3.jpg',
      alt: 'Casual setting',
      category: 'casual',
    },
    // ... add 8-12 photos total
  ],

  // Thumbnail for testimonials/about section
  about: {
    url: 'https://companion-photos.syd1.digitaloceanspaces.com/emma/about.jpg',
    alt: 'About Emma Rose',
  },
};
```

---

## Step 6: Upload Photos to DigitalOcean Spaces

### Using DigitalOcean Web Console:

1. Go to https://cloud.digitalocean.com/spaces
2. Click your Space (e.g., `companion-photos`)
3. Create folder: `emma/`
4. Upload photos (drag & drop)
5. Set permissions: **Public** (read-only)

### Using doctl CLI:

```bash
# Make sure you have photos in a local folder
mkdir -p ~/emma-photos

# Upload all photos
doctl spaces upload ~/emma-photos/ emma/ --recursive --space-name companion-photos --region syd1

# Set public read permissions
doctl spaces set-acl emma/ --acl public-read --recursive --space-name companion-photos
```

### Photo Requirements:

- **Format:** JPG or WebP
- **Hero:** 1920x1080px (16:9)
- **Gallery:** 1200x800px (3:2)
- **File size:** < 500KB (optimized for web)
- **Naming:** descriptive (e.g., `hero-evening-dress.jpg`)

---

## Step 7: Add Database Entry

Connect to your PostgreSQL database:

```bash
# Using psql
psql "postgresql://user:password@host:25060/defaultdb?sslmode=require"
```

Insert the tenant:

```sql
INSERT INTO tenants (
  subdomain,
  name,
  email,
  theme_config,
  content_config,
  status
) VALUES (
  'emma',
  'Emma Rose',
  'emma@companionconnect.app',
  '{"colors": {"primary": "#FF6B9D", "secondary": "#FFC6D9"}, "fonts": {"heading": "Cormorant Garamond", "body": "Raleway"}, "layout": "modern"}'::jsonb,
  '{"name": "Emma Rose", "tagline": "Melbourne''s Most Sought-After Companion", "location": "Melbourne, VIC"}'::jsonb,
  'preview'  -- Start in preview mode
);

-- Get the tenant ID
SELECT id, subdomain, name FROM tenants WHERE subdomain = 'emma';
```

**Note:** `status = 'preview'` means the site is accessible but not yet in production.

---

## Step 8: Configure Custom Styling (Optional)

If Emma needs custom CSS beyond the theme:

Edit `src/tenants/emma/styles.module.css`:

```css
/* Custom styles for Emma's page */

.heroSection {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.bioSection {
  font-style: italic;
  max-width: 800px;
  margin: 0 auto;
}

.ctaButton {
  box-shadow: 0 8px 16px rgba(255, 107, 157, 0.3);
  transition: all 0.3s ease;
}

.ctaButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(255, 107, 157, 0.4);
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .heroSection {
    min-height: 60vh;
  }
}
```

---

## Step 9: Commit and Push

```bash
# Add all changes
git add src/tenants/emma/

# Commit with descriptive message
git commit -m "Add Emma Rose tenant configuration

- Configure theme (pink/modern)
- Add bio, services, pricing
- Upload 12 gallery photos
- Set up A/B test for hero image"

# Push to remote
git push origin tenant/emma
```

---

## Step 10: Preview Deployment

The GitHub Actions workflow automatically deploys tenant branches to preview URLs:

```
https://preview-emma.companionconnect.app
```

**Wait 5-10 minutes** for deployment, then:

1. Visit the preview URL
2. Test all functionality:
   - ✅ Colors and fonts load correctly
   - ✅ All photos display
   - ✅ Bio and services are correct
   - ✅ Booking form works
   - ✅ Contact information is accurate
   - ✅ Mobile responsive

3. Ask Emma to review and approve

---

## Step 11: Create A/B Test (Optional)

If testing hero photos:

```sql
INSERT INTO ab_tests (
  tenant_id,
  name,
  description,
  element_type,
  variants,
  status
) VALUES (
  (SELECT id FROM tenants WHERE subdomain = 'emma'),
  'hero_photo_test',
  'Testing Emma evening dress vs casual photo',
  'photo',
  '[
    {
      "id": "control",
      "name": "Evening Dress",
      "config": {"photo_url": "emma/hero-1.jpg"},
      "weight": 0.5
    },
    {
      "id": "variant_a",
      "name": "Casual Portrait",
      "config": {"photo_url": "emma/hero-2.jpg"},
      "weight": 0.5
    }
  ]'::jsonb,
  'active'
);
```

---

## Step 12: Merge to Staging

Once approved:

```bash
# Switch to develop branch
git checkout develop

# Merge Emma's branch
git merge tenant/emma

# Push to staging
git push origin develop
```

**Staging URL:** `https://staging.companionconnect.app/emma`

Final review on staging environment.

---

## Step 13: Production Deployment

When ready to go live:

```bash
# Switch to main branch
git checkout main

# Merge develop (includes Emma)
git merge develop

# Push to production
git push origin main
```

**Update tenant status:**

```sql
UPDATE tenants SET status = 'active' WHERE subdomain = 'emma';
```

**Live URL:** `https://emma.companionconnect.app`

---

## Step 14: Post-Launch

### Configure DNS (if using custom domain):

1. In DigitalOcean DNS, add CNAME record:

   ```
   emma.customdomain.com → emma.companionconnect.app
   ```

2. Update tenant:
   ```sql
   UPDATE tenants
   SET custom_domain = 'emma.customdomain.com'
   WHERE subdomain = 'emma';
   ```

### Set Up Analytics Tracking:

The analytics system automatically tracks:

- Page views
- Photo clicks
- Form interactions
- Conversions

No additional setup needed!

### Monitor Performance:

Emma can access her dashboard at:

```
https://emma.companionconnect.app/dashboard
```

(Login credentials provided separately)

---

## Checklist

Before marking complete, verify:

- [ ] Theme colors and fonts match Emma's brand
- [ ] All photos uploaded and displaying correctly
- [ ] Bio and services accurate
- [ ] Pricing correct
- [ ] Contact information verified
- [ ] Social media links working
- [ ] Mobile responsive
- [ ] Booking form submits successfully
- [ ] Analytics tracking active
- [ ] A/B test configured (if applicable)
- [ ] Emma has reviewed and approved
- [ ] Database entry created
- [ ] Preview deployment successful
- [ ] Production deployment complete
- [ ] Emma trained on dashboard

---

## Troubleshooting

### Photos not displaying?

- Check Spaces permissions (must be public-read)
- Verify URLs in `photos.config.ts`
- Check browser console for 404 errors

### Theme not applying?

- Clear browser cache
- Check `theme.config.ts` syntax
- Verify colors are valid hex codes

### Booking form not working?

- Check database connection
- Verify tenant_id in sessions table
- Check email service configuration

### Analytics not tracking?

- Verify session creation
- Check browser console for errors
- Ensure scripts are loaded

---

## Timeline Summary

| Step              | Time         | Who                 |
| ----------------- | ------------ | ------------------- |
| Gather content    | 2-3 days     | Emma                |
| Photo shoot       | 1 day        | Emma + photographer |
| Photo editing     | 1-2 days     | Designer            |
| Create configs    | 1 hour       | Developer           |
| Upload photos     | 30 mins      | Developer           |
| Database setup    | 15 mins      | Developer           |
| Preview review    | 2-3 days     | Emma                |
| Revisions         | 1-2 hours    | Developer           |
| Production deploy | 15 mins      | Developer           |
| **Total**         | **5-7 days** |                     |

---

## Next Companion

To onboard the next companion, repeat this process starting from Step 1 with a new subdomain!

---

**Questions?** Contact the development team or refer to `MULTI-TENANT-ARCHITECTURE.md`
