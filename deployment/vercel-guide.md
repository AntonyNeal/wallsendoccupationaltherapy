# Vercel Deployment Guide

> **📋 Reusable Template**  
> This guide and associated configuration files are designed to be reused across multiple projects.  
> Copy the entire Vercel platform kit from the `deployment/` folder to your new project.

---

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally via npm
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Methods

You have two options to deploy to Vercel:

### Option 1: Deploy via Vercel Dashboard (Recommended for First-Time Setup)

This is the easiest method and provides a visual interface:

1. **Push your code to GitHub/GitLab/Bitbucket** (if not already done)

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git provider
   - Choose your repository: `osullivanfarms`

3. **Configure the project**:
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Set Environment Variables**:
   Click "Environment Variables" and add:

   ```
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database

   # SendGrid (Email)
   SENDGRID_API_KEY=your_sendgrid_key
   SENDGRID_FROM_EMAIL=your_email@domain.com

   # Node Environment
   NODE_ENV=production

   # Your domain (optional)
   VITE_API_BASE_URL=https://your-app.vercel.app/api
   ```

5. **Deploy**: Click "Deploy" and wait for the build to complete

### Option 2: Deploy via Vercel CLI

This method gives you more control and is useful for CI/CD:

#### Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

#### Step 2: Login to Vercel

```powershell
vercel login
```

This will open a browser for authentication.

#### Step 3: Link Your Project (First Time Only)

From your project root:

```powershell
vercel link
```

Answer the prompts:

- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (for first deployment)
- Project name? **osullivanfarms** (or your preferred name)
- In which directory? **./** (press Enter)

#### Step 4: Set Environment Variables

```powershell
# Database
vercel env add DATABASE_URL

# SendGrid
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL

# Add more as needed
```

For each command, you'll be prompted to:

1. Enter the value
2. Select environment (choose: Production, Preview, Development)

#### Step 5: Deploy to Preview

Test your deployment in a preview environment first:

```powershell
vercel
```

This creates a preview URL like: `https://osullivanfarms-abc123.vercel.app`

#### Step 6: Deploy to Production

Once you've tested the preview:

```powershell
vercel --prod
```

This deploys to your production URL: `https://osullivanfarms.vercel.app`

## Project Structure for Vercel

Your project is now configured with:

```
osullivanfarms/
├── api/
│   ├── index.js          # Serverless function entry point (NEW)
│   ├── server.js         # Original server (for local dev)
│   ├── routes/           # API routes
│   ├── controllers/      # Controllers
│   └── services/         # Business logic
├── src/                  # Frontend source
├── dist/                 # Build output (auto-generated)
├── vercel.json           # Vercel configuration (UPDATED)
├── .vercelignore         # Files to ignore (NEW)
└── package.json          # Dependencies
```

## How It Works

### Frontend (Vite/React)

- Built to `dist/` folder
- Served as static files
- All routes redirect to `index.html` for client-side routing

### Backend API

- Express app exported from `api/index.js`
- Runs as Vercel serverless functions
- API routes accessible at `/api/*`
- Each request spins up a serverless instance

## Custom Domain Setup

### Add Your Domain

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your domain: `osullivanfarms.tech`
4. Follow the DNS configuration instructions

### DNS Configuration

Add these records to your DNS provider:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

Or use Vercel's nameservers for automatic configuration.

### Update Environment Variables

After adding your domain, update:

```powershell
vercel env add VITE_API_BASE_URL
# Enter: https://osullivanfarms.tech/api
```

Redeploy for changes to take effect:

```powershell
vercel --prod
```

## Testing Your Deployment

### Health Check

```powershell
curl https://your-app.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T...",
  "environment": "production"
}
```

### Frontend

Open: `https://your-app.vercel.app`

## Continuous Deployment

Once connected via Git:

1. **Every push to `main` branch** → Automatic production deployment
2. **Every push to other branches** → Automatic preview deployment
3. **Every pull request** → Preview deployment with unique URL

## Environment Variables Reference

Required environment variables:

| Variable              | Description                  | Example                               |
| --------------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SENDGRID_API_KEY`    | SendGrid API key for emails  | `SG.xxxxx`                            |
| `SENDGRID_FROM_EMAIL` | Sender email address         | `noreply@yourdomain.com`              |
| `NODE_ENV`            | Node environment             | `production`                          |
| `VITE_API_BASE_URL`   | API base URL for frontend    | `https://yourdomain.com/api`          |

Optional variables:

- `POSTGRES_SSL` - Enable SSL for database (set to `true` for production)
- Any other API keys or secrets your app uses

## Troubleshooting

### Build Fails

Check build logs in Vercel dashboard:

1. Go to your project
2. Click on the failed deployment
3. View logs for errors

Common issues:

- Missing dependencies: Run `npm install` locally
- Environment variables not set
- TypeScript errors: Run `npm run type-check`

### API Routes 404

Verify:

1. `api/index.js` exists
2. Routes are correctly imported
3. Function configuration in `vercel.json` is correct

### CORS Errors

Update allowed origins in `api/index.js`:

```javascript
const allowedPatterns = [
  /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/,
  /^https?:\/\/your-domain\.com$/,
];
```

### Database Connection Issues

Ensure:

1. Database is accessible from Vercel's servers
2. `DATABASE_URL` is correctly set
3. Database accepts SSL connections (required for most cloud databases)

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard
2. Navigate to your project → **Deployments**
3. Find the working deployment
4. Click **⋯** → **Promote to Production**

Or via CLI:

```powershell
vercel rollback
```

## Monitoring & Logs

### View Logs

```powershell
vercel logs
```

### Real-time Logs

```powershell
vercel logs --follow
```

### Analytics

Enable in Vercel Dashboard:

- **Settings** → **Analytics**
- View page views, performance metrics, and errors

## Cost Considerations

Vercel Free Tier includes:

- 100 GB bandwidth per month
- Unlimited serverless function executions (with limits)
- 100 GB-Hrs of serverless function execution time

Pro tier ($20/month) offers:

- 1 TB bandwidth
- More execution time
- Advanced analytics
- Priority support

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

## Quick Commands Reference

```powershell
# Install CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Remove deployment
vercel remove [deployment-url]

# Check project info
vercel inspect
```

---

## Next Steps

1. ✅ Configuration files are ready (`vercel.json`, `.vercelignore`, `api/index.js`)
2. Choose your deployment method (Dashboard or CLI)
3. Set up environment variables
4. Deploy and test
5. Configure custom domain (optional)
6. Enable continuous deployment via Git

Your app is ready to deploy to Vercel! 🚀
