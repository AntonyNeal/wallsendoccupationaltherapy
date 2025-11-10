# Vercel Deployment Kit

> **🎯 Purpose:** Complete, reusable configuration for deploying multi-tenant booking platforms to Vercel

---

## 📦 What's Included

This kit contains everything needed to deploy a Vite + Express application to Vercel:

| File                    | Purpose                                 | Copy To                        |
| ----------------------- | --------------------------------------- | ------------------------------ |
| `vercel-config.json`    | Main Vercel configuration               | `vercel.json` (project root)   |
| `vercel.ignore`         | Files to exclude from deployment        | `.vercelignore` (project root) |
| `vercel-api-adapter.js` | Serverless function wrapper for Express | `api/index.js`                 |
| `vercel-guide.md`       | Complete deployment instructions        | (reference only)               |

---

## 🚀 Quick Setup for New Project

### 1. Copy Files to Your Project

```powershell
# From the source project
$sourceDeployment = "C:\BoscasSlingers\osullivanfarms\deployment"
$targetProject = "C:\YourNewProject"

# Copy Vercel kit
Copy-Item "$sourceDeployment\vercel-config.json" "$targetProject\vercel.json"
Copy-Item "$sourceDeployment\vercel.ignore" "$targetProject\.vercelignore"
Copy-Item "$sourceDeployment\vercel-api-adapter.js" "$targetProject\api\index.js"
Copy-Item "$sourceDeployment\vercel-guide.md" "$targetProject\docs\"
```

### 2. Customize Configuration

**In `vercel.json`:**

- Verify `buildCommand` matches your package.json scripts
- Verify `outputDirectory` matches your build output (usually `dist` for Vite)
- Update API routes if different from `/api/*`

**In `api/index.js`:**

- Update CORS `allowedPatterns` with your domains:

  ```javascript
  const allowedPatterns = [
    /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/,
    /^https?:\/\/([a-z0-9-]+\.)?yourdomain\.com$/, // ← Change this
    /^http:\/\/localhost(:\d+)?$/,
  ];
  ```

- Update route imports to match your API structure:
  ```javascript
  const bookingRoutes = require('./routes/bookings'); // Match your routes
  const yourRoutes = require('./routes/your-routes'); // Add your routes
  ```

### 3. Deploy to Vercel

**Option A: Via Dashboard**

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Deploy

**Option B: Via CLI**

```powershell
npm install -g vercel
vercel login
vercel --prod
```

---

## ⚙️ Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Email Service
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=bookings@yourdomain.com

# Node Environment
NODE_ENV=production

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🎨 Customization Guide

### For Different Frontend Frameworks

**Next.js:**

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

**React (CRA):**

```json
{
  "framework": "create-react-app",
  "buildCommand": "react-scripts build",
  "outputDirectory": "build"
}
```

**Vue:**

```json
{
  "framework": "vue",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### For Different API Structures

**If your API has different routes:**

Edit `api/index.js`:

```javascript
// Example: E-commerce routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
```

**If your API uses different middleware:**

Add to `api/index.js`:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### For Custom Domains

**In Vercel Dashboard:**

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Update CORS in `api/index.js`

**Update environment variable:**

```bash
VITE_API_BASE_URL=https://yourdomain.com/api
```

---

## 📋 Configuration Reference

### vercel.json Structure

```json
{
  "version": 2,                      // Vercel config version
  "buildCommand": "npm run build",   // Build command from package.json
  "outputDirectory": "dist",         // Build output folder
  "framework": "vite",               // Framework detection
  "installCommand": "npm install",   // Dependency installation

  "functions": {                     // Serverless function configuration
    "api/**/*.js": {
      "runtime": "nodejs20.x",       // Node version
      "maxDuration": 30              // Max execution time (seconds)
    }
  },

  "rewrites": [                      // URL routing rules
    {
      "source": "/api/:path*",       // API routes
      "destination": "/api/index"    // → Serverless function
    },
    {
      "source": "/(.*)",             // All other routes
      "destination": "/index.html"   // → SPA (client-side routing)
    }
  ],

  "headers": [...]                   // Security headers
}
```

### API Adapter Structure

```javascript
// 1. Express app setup
const app = express();

// 2. CORS configuration (customize allowedPatterns)
app.use(cors({ origin: function(origin, callback) {...} }));

// 3. Body parsing
app.use(express.json());

// 4. Route mounting (customize your routes)
app.use('/api/bookings', bookingRoutes);

// 5. Error handling
app.use((err, req, res, next) => {...});

// 6. Export for Vercel
module.exports = app;
```

---

## 🧪 Testing Before Deployment

### Local Testing

```powershell
# Install Vercel CLI
npm install -g vercel

# Test build locally
npm run build

# Run Vercel dev server (simulates Vercel environment)
vercel dev
```

### Preview Deployments

Every git push creates a preview deployment:

```powershell
vercel
# Returns: https://your-app-xxxxx.vercel.app
```

Test thoroughly before promoting to production:

```powershell
vercel --prod
```

---

## 🔧 Troubleshooting

### Build Fails

**Check:**

- Build command in `vercel.json` matches `package.json`
- All dependencies listed in `package.json`
- No hardcoded localhost URLs in code

**Debug:**

```powershell
# Test build locally
npm run build

# Check for errors
npm run type-check  # TypeScript
npm run lint        # ESLint
```

### API Routes Return 404

**Check:**

- `api/index.js` exists and exports the Express app
- Route imports are correct
- Functions configuration in `vercel.json` is correct

**Verify:**

```javascript
// In api/index.js
console.log('API routes loaded:', app._router.stack);
```

### CORS Errors

**Update allowedPatterns in `api/index.js`:**

```javascript
const allowedPatterns = [
  /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/,
  /^https?:\/\/your-domain\.com$/, // Add your domain
];
```

### Environment Variables Not Working

**Check:**

1. Variables are set in Vercel Dashboard
2. Variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Use `VITE_` prefix for frontend variables

---

## 📚 Additional Resources

- **Full Deployment Guide:** See `vercel-guide.md`
- **Vercel Documentation:** https://vercel.com/docs
- **Serverless Functions:** https://vercel.com/docs/functions
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables

---

## ✅ Checklist for New Project

- [ ] Copy all 3 files to correct locations
- [ ] Update CORS patterns with your domain
- [ ] Customize API routes to match your structure
- [ ] Test build locally (`npm run build`)
- [ ] Push to Git repository
- [ ] Import to Vercel
- [ ] Add environment variables
- [ ] Deploy and test
- [ ] Configure custom domain (optional)
- [ ] Set up continuous deployment

---

_Last updated: 2025-11-10_
_Compatible with: Vite 5.x, Node.js 20.x, Vercel CLI 33.x_
