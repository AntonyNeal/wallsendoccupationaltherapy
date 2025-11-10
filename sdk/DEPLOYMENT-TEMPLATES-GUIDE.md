# Using SDK Deployment Templates in New Projects

> **📦 Common Library Approach**  
> All deployment configurations are centralized in the SDK for easy reuse across projects.

---

## 🎯 Concept

Instead of copying deployment files between projects, the SDK acts as a **common library** that contains:

1. ✅ API client code
2. ✅ Deployment configurations (Vercel, DigitalOcean, Netlify)
3. ✅ Setup scripts
4. ✅ Best practices documentation

**Benefits:**

- Single source of truth for deployment configs
- Easy updates across all projects
- Consistent deployment patterns
- Reduced duplication

---

## 🚀 Quick Start for New Projects

### Method 1: NPM Scripts (Recommended)

If the SDK is installed in your project:

```bash
# Install the SDK
npm install @your-org/service-booking-sdk

# Set up Vercel deployment
npm run setup:vercel --prefix node_modules/@your-org/service-booking-sdk

# Or for DigitalOcean
npm run setup:digitalocean --prefix node_modules/@your-org/service-booking-sdk

# Or for Netlify
npm run setup:netlify --prefix node_modules/@your-org/service-booking-sdk
```

### Method 2: Direct Script Execution

```bash
# Navigate to SDK
cd node_modules/@your-org/service-booking-sdk

# Run setup script
node scripts/install-deployment.js vercel
```

### Method 3: Manual Copy (If SDK is in same repo)

```powershell
# From project root
Copy-Item sdk/deployment-templates/vercel-config.json vercel.json
Copy-Item sdk/deployment-templates/vercel.ignore .vercelignore
Copy-Item sdk/deployment-templates/vercel-api-adapter.js api/index.js
```

---

## 📋 Platform-Specific Setup

### Vercel Setup

**1. Copy templates:**

```bash
npm run setup:vercel --prefix node_modules/@your-org/service-booking-sdk
```

**2. Customize configuration:**

Edit `vercel.json` if needed (usually works as-is)

Edit `api/index.js` to update CORS:

```javascript
const allowedPatterns = [
  /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/,
  /^https?:\/\/your-domain\.com$/, // ← Add your domain
];
```

**3. Deploy:**

```bash
vercel --prod
```

**Documentation:** `node_modules/@your-org/service-booking-sdk/deployment-templates/VERCEL-KIT-README.md`

---

### DigitalOcean Setup

**1. Copy template:**

```bash
npm run setup:digitalocean --prefix node_modules/@your-org/service-booking-sdk
```

**2. Edit `app.yaml`:**

```yaml
name: your-app-name # Change this
domains:
  - domain: your-domain.com # Change this
```

**3. Deploy:**

```bash
doctl apps create --spec app.yaml
```

---

### Netlify Setup

**1. Copy template:**

```bash
npm run setup:netlify --prefix node_modules/@your-org/service-booking-sdk
```

**2. Edit `netlify.toml`:**

```toml
[build]
  command = "npm run build"  # Verify this matches your build
```

**3. Deploy:**

```bash
netlify deploy --prod
```

---

## 🔄 Updating Templates Across Projects

When the SDK updates deployment templates:

**1. Update SDK version:**

```bash
npm update @your-org/service-booking-sdk
```

**2. Re-run setup (backs up existing files):**

```bash
npm run setup:vercel --prefix node_modules/@your-org/service-booking-sdk
```

**3. Review changes and merge:**

```bash
# Compare your customizations with new templates
git diff vercel.json
```

---

## 🏗️ Project Structure

```
your-new-project/
├── node_modules/
│   └── @your-org/
│       └── service-booking-sdk/
│           ├── dist/                   # SDK code
│           ├── deployment-templates/   # 👈 Templates library
│           │   ├── INDEX.md
│           │   ├── README.md
│           │   ├── VERCEL-KIT-README.md
│           │   ├── vercel-config.json
│           │   ├── vercel.ignore
│           │   ├── vercel-api-adapter.js
│           │   ├── app-spec-digitalocean.yaml
│           │   └── netlify-template.toml
│           └── scripts/
│               └── install-deployment.js
│
├── api/
│   └── index.js              # 👈 Copied from SDK
├── src/
├── vercel.json               # 👈 Copied from SDK
├── .vercelignore            # 👈 Copied from SDK
└── package.json
```

---

## 🎨 Customization Workflow

### 1. Copy Base Templates

```bash
npm run setup:vercel --prefix node_modules/@your-org/service-booking-sdk
```

### 2. Make Project-Specific Changes

**Common customizations:**

- Domain names
- CORS origins
- Build commands
- Environment variables
- API routes

### 3. Document Your Changes

Create `deployment-notes.md` in your project:

```markdown
# Deployment Customizations

## Changes from SDK templates:

- Added custom domain: example.com
- Updated CORS for subdomain: \*.example.com
- Added custom API route: /api/webhooks
```

### 4. Commit to Your Repo

```bash
git add vercel.json .vercelignore api/index.js
git commit -m "Add Vercel deployment config from SDK"
```

---

## 🔐 Environment Variables

Templates don't include secrets. Set these in your platform:

### Vercel

```bash
vercel env add DATABASE_URL
vercel env add SENDGRID_API_KEY
vercel env add NODE_ENV
```

### DigitalOcean

Add in App Platform dashboard under "Settings → App-Level Environment Variables"

### Netlify

```bash
netlify env:set DATABASE_URL "your-value"
```

---

## 🧪 Testing Setup

**Test locally before deploying:**

```bash
# 1. Install dependencies
npm install

# 2. Build
npm run build

# 3. Test dev server
npm run dev

# 4. Test Vercel locally (if using Vercel)
vercel dev
```

---

## 📚 Full Documentation

Access comprehensive guides from the SDK:

```bash
# View all available docs
ls node_modules/@your-org/service-booking-sdk/deployment-templates/

# Key files:
# - INDEX.md                 # Template library overview
# - README.md                # Platform comparison
# - VERCEL-KIT-README.md     # Complete Vercel guide
# - vercel-guide.md          # Step-by-step deployment
```

---

## 🤝 Contributing Back to SDK

Found a better deployment configuration?

**1. Update in your project and test**

**2. Propose changes to SDK:**

```bash
# Fork the SDK repo
# Update deployment-templates/
# Test across multiple projects
# Submit PR
```

**3. Benefits all projects** when merged!

---

## 💡 Pro Tips

### Tip 1: Keep SDK Updated

```bash
# Check for updates
npm outdated @your-org/service-booking-sdk

# Update
npm update @your-org/service-booking-sdk
```

### Tip 2: Use Version Control

```bash
# Track SDK version used
echo "@your-org/service-booking-sdk@1.0.0" > .sdk-version

# Document when you update
git log -- vercel.json
```

### Tip 3: Automate Setup

Add to your project's `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm run setup:vercel --prefix node_modules/@your-org/service-booking-sdk"
  }
}
```

### Tip 4: Template Comparison

```bash
# Compare your version with SDK template
diff vercel.json node_modules/@your-org/service-booking-sdk/deployment-templates/vercel-config.json
```

---

## 🐛 Troubleshooting

### Templates Not Found

```bash
# Verify SDK is installed
npm list @your-org/service-booking-sdk

# Reinstall if needed
npm install @your-org/service-booking-sdk
```

### Script Permission Denied

```bash
# On Unix systems
chmod +x node_modules/@your-org/service-booking-sdk/scripts/install-deployment.js
```

### Files Already Exist

The script will overwrite. Backup first:

```bash
cp vercel.json vercel.json.backup
npm run setup:vercel --prefix node_modules/@your-org/service-booking-sdk
```

---

## 📞 Support

- **SDK Issues:** Check SDK repository issues
- **Deployment Issues:** See platform-specific guides in `deployment-templates/`
- **Template Questions:** See `deployment-templates/INDEX.md`

---

_Last updated: 2025-11-10_  
_SDK Version: 1.0.0_
