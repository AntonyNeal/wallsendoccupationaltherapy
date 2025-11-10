# Deployment Templates Library

> **🎯 Common Library for All Service Booking Projects**  
> Reusable deployment configurations for multiple cloud platforms.

---

## 📚 What This Library Provides

This directory contains battle-tested deployment configurations that can be used across all your service booking platform projects. Each platform kit includes:

- ✅ Complete configuration files
- ✅ Step-by-step deployment guides
- ✅ Customization instructions
- ✅ Troubleshooting tips
- ✅ Environment variable templates

---

## 🚀 Quick Usage

### For a New Project

```powershell
# 1. Navigate to your new project
cd C:\YourNewProject

# 2. Copy the platform kit you want to use
# Example: Copy Vercel kit
Copy-Item -Path "path\to\sdk\deployment-templates\vercel-*" -Destination .

# 3. Rename files as needed
Rename-Item vercel-config.json vercel.json
Rename-Item vercel.ignore .vercelignore
Copy-Item vercel-api-adapter.js api\index.js

# 4. Customize with your details
# (See platform-specific README)

# 5. Deploy!
```

---

## 📦 Available Platform Kits

### 🔵 Vercel (Serverless - Recommended)

**Best for:** Fast global deployments, automatic scaling, edge functions

**Files:**

- `vercel-config.json` → Copy as `vercel.json`
- `vercel.ignore` → Copy as `.vercelignore`
- `vercel-api-adapter.js` → Copy to `api/index.js`
- `vercel-guide.md` - Complete guide
- `VERCEL-KIT-README.md` - Quick reference

**Quick Start:**

```powershell
vercel --prod
```

**Documentation:** [VERCEL-KIT-README.md](./VERCEL-KIT-README.md)

---

### 🌊 DigitalOcean App Platform

**Best for:** Traditional apps, predictable pricing, managed databases

**Files:**

- `app-spec-digitalocean.yaml` - Complete app specification

**Quick Start:**

```powershell
doctl apps create --spec app-spec-digitalocean.yaml
```

**Customization:** Edit YAML with your app name, domains, database config

---

### 🟢 Netlify (JAMstack)

**Best for:** Static sites, form handling, split testing

**Files:**

- `netlify-template.toml` → Copy as `netlify.toml`

**Quick Start:**

```powershell
netlify deploy --prod
```

**Customization:** Update build commands and environment variables

---

## 🛠️ Using This Library in Your SDK

### Option 1: Copy Templates to New Project

```javascript
// In your project setup script
const fs = require('fs-extra');
const path = require('path');

const sdkPath = path.join(__dirname, 'node_modules', '@your-org', 'booking-sdk');
const templatesPath = path.join(sdkPath, 'deployment-templates');

// Copy Vercel kit
fs.copySync(
  path.join(templatesPath, 'vercel-config.json'),
  path.join(process.cwd(), 'vercel.json')
);

fs.copySync(path.join(templatesPath, 'vercel.ignore'), path.join(process.cwd(), '.vercelignore'));

fs.copySync(
  path.join(templatesPath, 'vercel-api-adapter.js'),
  path.join(process.cwd(), 'api', 'index.js')
);
```

### Option 2: NPM Scripts for Template Installation

Add to your SDK's `package.json`:

```json
{
  "scripts": {
    "install:vercel": "node scripts/install-vercel-templates.js",
    "install:digitalocean": "node scripts/install-do-templates.js",
    "install:netlify": "node scripts/install-netlify-templates.js"
  }
}
```

### Option 3: CLI Tool

```javascript
// sdk/bin/deploy-setup.js
#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs-extra');

program
  .command('setup <platform>')
  .description('Set up deployment for a platform')
  .action((platform) => {
    switch(platform) {
      case 'vercel':
        // Copy Vercel templates
        break;
      case 'digitalocean':
        // Copy DO templates
        break;
      // etc...
    }
  });

program.parse();
```

Usage:

```bash
npx @your-org/booking-sdk setup vercel
```

---

## 📋 Integration Guide for SDK Maintainers

### Publishing Templates with SDK

**In SDK's package.json:**

```json
{
  "name": "@your-org/service-booking-sdk",
  "version": "1.0.0",
  "files": ["dist", "deployment-templates", "README.md"]
}
```

This ensures templates are included when the SDK is published to NPM.

### Accessing Templates in Projects

```javascript
// Projects can access templates via:
import { getDeploymentTemplate } from '@your-org/service-booking-sdk/deployment-templates';

// Or direct file access:
const templatePath = require.resolve(
  '@your-org/service-booking-sdk/deployment-templates/vercel-config.json'
);
```

---

## 🔄 Template Updates

When updating templates:

1. **Update in this directory** (source of truth)
2. **Update version** in SDK package.json
3. **Publish new SDK version**
4. **Document changes** in CHANGELOG
5. **Notify** projects to update

### Version Compatibility

Templates are versioned with the SDK:

```
SDK v1.0.x → Templates v1.0
SDK v1.1.x → Templates v1.1 (backwards compatible)
SDK v2.0.x → Templates v2.0 (breaking changes)
```

---

## 📁 Directory Structure

```
sdk/deployment-templates/
├── INDEX.md (this file)
├── README.md (platform overview)
│
├── Vercel Kit/
│   ├── VERCEL-KIT-README.md
│   ├── vercel-config.json
│   ├── vercel.ignore
│   ├── vercel-api-adapter.js
│   └── vercel-guide.md
│
├── DigitalOcean Kit/
│   └── app-spec-digitalocean.yaml
│
└── Netlify Kit/
    └── netlify-template.toml
```

---

## 🎯 Example: New Project Setup

```powershell
# 1. Install the SDK in your new project
npm install @your-org/service-booking-sdk

# 2. Find templates in node_modules
cd node_modules/@your-org/service-booking-sdk/deployment-templates

# 3. Copy the kit you need
Copy-Item vercel-config.json ../../../vercel.json
Copy-Item vercel.ignore ../../../.vercelignore
Copy-Item vercel-api-adapter.js ../../../api/index.js

# 4. Back to project root
cd ../../..

# 5. Customize and deploy
code vercel.json  # Edit configuration
vercel --prod     # Deploy
```

---

## 🧪 Testing Templates

Before publishing updates:

1. **Test each platform** with a sample app
2. **Verify builds** complete successfully
3. **Test deployments** in staging
4. **Check functionality** (API, frontend, routing)
5. **Document** any breaking changes

---

## 🤝 Contributing Templates

To add a new platform:

1. Create platform kit folder
2. Add all required config files
3. Write comprehensive README
4. Add to main README.md
5. Test deployment
6. Submit PR

### Template Checklist

- [ ] Configuration files (validated)
- [ ] README with setup instructions
- [ ] Environment variables documented
- [ ] Customization guide included
- [ ] Troubleshooting section
- [ ] Tested on real deployment
- [ ] Version compatibility noted

---

## 📞 Support

For template issues:

- Check platform-specific README first
- Review main [README.md](./README.md)
- See SDK documentation
- Create issue with `[templates]` tag

---

## 📜 License

MIT License - Templates are free to use, modify, and distribute.

---

_Last updated: 2025-11-10_  
_SDK Version: 1.0.0_  
_Template Library Version: 1.0.0_
