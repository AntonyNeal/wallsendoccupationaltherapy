# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):

   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```powershell
   vercel login
   ```

3. **Deploy**:

   ```powershell
   vercel
   ```

   - Follow the prompts
   - Choose your project name (e.g., `wallsend-occupational-therapy`)
   - Confirm the settings
   - Wait for deployment to complete

4. **Deploy to Production**:
   ```powershell
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**:

   ```powershell
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the framework (Vite)

3. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node Version**: 20.x

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `https://your-project.vercel.app`

## Custom Domain Setup

### Adding a Custom Domain

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Domains"
3. Add your domain (e.g., `wallsendot.com.au`)
4. Follow Vercel's DNS configuration instructions

### Multi-Tenant Subdomain Support

Currently configured for `wallsend` tenant on localhost. For production with subdomains:

1. **DNS Configuration**:
   - Add A record: `@` → Vercel IP
   - Add CNAME: `*.wallsendot.com.au` → `cname.vercel-dns.com`

2. **Vercel Configuration**:
   - Add all subdomains you want to support in Vercel dashboard
   - The app will automatically detect the subdomain and load the correct tenant

## Environment Variables

No environment variables needed at this stage (no API/database integration yet).

When you're ready to add them:

1. Go to Vercel Project Settings → Environment Variables
2. Add variables like:
   - `VITE_API_URL` (if needed later)
   - `VITE_GA_MEASUREMENT_ID` (Google Analytics)

## Build Configuration

The project is already configured with `vercel.json`:

- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ SPA Routing: Configured with rewrites
- ✅ Security Headers: X-Frame-Options, CSP, etc.
- ✅ Code Splitting: Optimized chunks for performance

## Performance Optimizations

Already configured:

- ✅ Code splitting (vendor, ui, analytics chunks)
- ✅ Terser minification
- ✅ CSS code splitting
- ✅ Asset optimization
- ✅ Tree shaking

## Deployment Checklist

Before deploying:

- [x] Build passes locally: `npm run build`
- [x] Preview works: `npm run preview`
- [x] Linting passes: `npm run lint`
- [x] Type checking passes: `npm run type-check`
- [ ] Test on mobile devices
- [ ] Check all pages load correctly
- [ ] Verify hamburger menu works
- [ ] Test booking modal functionality

## Troubleshooting

### Build Fails on Vercel

1. **Check Node Version**: Ensure Vercel uses Node 20.x
   - Go to Project Settings → General → Node.js Version
   - Select `20.x`

2. **Clear Build Cache**:
   - Go to Project Settings → General
   - Scroll to "Build & Development Settings"
   - Click "Clear Build Cache"

3. **Check Build Logs**:
   - Review the build logs in Vercel dashboard
   - Look for specific error messages

### Routes Don't Work (404 on Refresh)

- Verify `vercel.json` has the SPA rewrite rule:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### Styling Issues

- Clear browser cache
- Check if CSS files are being loaded
- Verify Tailwind CSS is building correctly

## Post-Deployment

After successful deployment:

1. **Test All Pages**:
   - Home: `/`
   - Services: `/services`
   - About: `/about`
   - Prices: `/prices`

2. **Test Mobile Navigation**:
   - Hamburger menu opens/closes
   - Holographic windshield effect works
   - All navigation links work

3. **Performance Check**:
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test on slow 3G connection

4. **Set Up Analytics** (Optional):
   - Add Google Analytics measurement ID
   - Update environment variables in Vercel

## Support

- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vite.dev/
- React Router Documentation: https://reactrouter.com/

## Next Steps (Future)

When ready to add backend functionality:

1. Set up PostgreSQL database (Vercel Postgres or external)
2. Create API routes in `/api` folder
3. Add environment variables for database connection
4. Implement booking system with real data
5. Add email notifications
6. Set up payment processing (Stripe)
