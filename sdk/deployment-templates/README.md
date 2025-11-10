# Deployment Platform Templates

This directory contains reusable deployment configuration templates for various cloud platforms. Use these templates to quickly deploy this multi-tenant booking platform to your preferred hosting provider.

---

## 📁 Available Platform Kits

### Vercel (Recommended for Serverless)

**Files:**

- `vercel-config.json` - Main Vercel configuration (copy to root as `vercel.json`)
- `vercel.ignore` - Files to exclude from deployment (copy to root as `.vercelignore`)
- `vercel-api-adapter.js` - Serverless function adapter for Express API (copy to `api/index.js`)
- `vercel-guide.md` - Complete deployment guide with CLI and dashboard instructions

**Best for:** Fast deployments, serverless architecture, automatic scaling, edge functions

**Setup:**

```bash
# 1. Copy templates to project root
Copy-Item deployment\vercel-config.json vercel.json
Copy-Item deployment\vercel.ignore .vercelignore
Copy-Item deployment\vercel-api-adapter.js api\index.js

# 2. Deploy
npm install -g vercel
vercel login
vercel --prod
```

---

### DigitalOcean App Platform

**Files:**

- `app-spec-digitalocean.yaml` - Complete app specification for DO
- Includes database, static site, and API configuration

**Best for:** Full-stack deployments with managed databases, predictable pricing

**Setup:**

```bash
doctl apps create --spec deployment/app-spec-digitalocean.yaml
```

---

### Netlify

**Files:**

- `netlify-template.toml` - Netlify configuration (copy to root as `netlify.toml`)
- `vercel-template.json` - Alternative configuration

**Best for:** JAMstack deployments, form handling, split testing

**Setup:**

```bash
# Deploy via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🚀 Quick Start Guide

### 1. Choose Your Platform

| Platform         | Pros                                                        | Cons                                          | Best For                       |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------- | ------------------------------ |
| **Vercel**       | ✅ Fast edge network<br>✅ Automatic scaling<br>✅ Great DX | ⚠️ Serverless limitations<br>⚠️ Cold starts   | Serverless apps, global reach  |
| **DigitalOcean** | ✅ Predictable pricing<br>✅ Full control<br>✅ Managed DB  | ⚠️ Manual scaling<br>⚠️ Region-specific       | Traditional apps, cost control |
| **Netlify**      | ✅ Easy setup<br>✅ Form handling<br>✅ Split testing       | ⚠️ Function limitations<br>⚠️ Bandwidth costs | Static sites, JAMstack         |

### 2. Copy Platform Files

**Vercel:**

```bash
Copy-Item deployment\vercel-config.json vercel.json
Copy-Item deployment\vercel.ignore .vercelignore
Copy-Item deployment\vercel-api-adapter.js api\index.js
```

**DigitalOcean:**

```bash
Copy-Item deployment\app-spec-digitalocean.yaml app.yaml
# Edit app.yaml with your configuration
```

**Netlify:**

```bash
Copy-Item deployment\netlify-template.toml netlify.toml
# Edit netlify.toml with your configuration
```

### 3. Customize Configuration

Update the copied files with:

- Your domain name
- Environment variables
- Service names
- Resource allocations

### 4. Set Environment Variables

All platforms require:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=your@email.com
NODE_ENV=production
```

### 5. Deploy

Follow the platform-specific guide in the respective file.

---

## 📚 Detailed Guides

- **Vercel:** See `vercel-guide.md` for complete instructions
- **DigitalOcean:** See `DO-CLI-SETUP.md` and `DO-CLI-QUICK-REF.md` in root
- **Netlify:** Check Netlify dashboard for guided deployment

---

## 🔄 Reusing Templates in Other Projects

These templates are designed to be reusable across multiple service booking applications:

### Quick Template Setup for New Project

1. **Copy the entire deployment folder** to your new project:

   ```bash
   Copy-Item -Recurse C:\BoscasSlingers\osullivanfarms\deployment C:\YourNewProject\deployment
   ```

2. **Choose your platform** and copy files to project root

3. **Update configuration** with your project details:
   - App name
   - Domain
   - Database settings
   - API endpoints

4. **Deploy using platform CLI** or dashboard

### Template Customization Tips

- **Search and replace** `osullivanfarms` with your app name
- Update **CORS origins** in API adapter
- Adjust **resource limits** based on your needs
- Configure **custom domains** in platform settings

---

## 🛠️ File Reference

```
deployment/
├── README.md (this file)
│
├── Vercel Platform Kit
│   ├── vercel-config.json          # Main config (→ vercel.json)
│   ├── vercel.ignore               # Ignore file (→ .vercelignore)
│   ├── vercel-api-adapter.js       # API adapter (→ api/index.js)
│   └── vercel-guide.md             # Complete deployment guide
│
├── DigitalOcean Platform Kit
│   └── app-spec-digitalocean.yaml  # DO app specification
│
└── Netlify Platform Kit
    ├── netlify-template.toml       # Netlify config
    └── vercel-template.json        # Alternative config
```

---

## 🔐 Security Notes

1. **Never commit `.env` files** with actual credentials
2. **Use platform secrets management** for environment variables
3. **Rotate API keys** periodically
4. **Enable 2FA** on all platform accounts
5. **Use SSL/TLS** for all production deployments

---

## 💡 Pro Tips

- **Start with Vercel** for quickest setup
- **Use preview deployments** to test before production
- **Set up custom domains** early for brand consistency
- **Monitor usage** to avoid surprise costs
- **Enable analytics** to track performance

---

## 📞 Support Resources

- **Vercel:** https://vercel.com/docs
- **DigitalOcean:** https://docs.digitalocean.com
- **Netlify:** https://docs.netlify.com

---

_Last updated: 2025-11-10_
