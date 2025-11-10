#!/usr/bin/env node

/**
 * Deployment Template Installer
 *
 * Usage:
 *   node install-deployment.js vercel
 *   node install-deployment.js digitalocean
 *   node install-deployment.js netlify
 */

const fs = require('fs');
const path = require('path');

const platform = process.argv[2];

if (!platform) {
  console.error('❌ Please specify a platform: vercel, digitalocean, or netlify');
  console.log('\nUsage:');
  console.log('  node scripts/install-deployment.js vercel');
  console.log('  node scripts/install-deployment.js digitalocean');
  console.log('  node scripts/install-deployment.js netlify');
  process.exit(1);
}

const templatesDir = path.join(__dirname, '..', 'deployment-templates');
const projectRoot = process.cwd();

function copyFile(source, destination, optional = false) {
  try {
    const sourcePath = path.join(templatesDir, source);
    const destPath = path.join(projectRoot, destination);

    if (!fs.existsSync(sourcePath)) {
      if (optional) {
        console.log(`⚠️  Optional file not found: ${source}`);
        return;
      }
      throw new Error(`Source file not found: ${source}`);
    }

    // Create destination directory if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${destination}`);
  } catch (error) {
    console.error(`❌ Error copying ${source}:`, error.message);
    if (!optional) throw error;
  }
}

console.log(`\n🚀 Installing ${platform} deployment templates...\n`);

switch (platform.toLowerCase()) {
  case 'vercel':
    copyFile('vercel-config.json', 'vercel.json');
    copyFile('vercel.ignore', '.vercelignore');
    copyFile('vercel-api-adapter.js', 'api/index.js');
    console.log('\n📚 Documentation:');
    console.log('  - deployment-templates/VERCEL-KIT-README.md');
    console.log('  - deployment-templates/vercel-guide.md');
    console.log('\n🎯 Next steps:');
    console.log('  1. Update CORS patterns in api/index.js');
    console.log('  2. Add environment variables in Vercel dashboard');
    console.log('  3. Deploy: vercel --prod');
    break;

  case 'digitalocean':
  case 'do':
    copyFile('app-spec-digitalocean.yaml', 'app.yaml');
    console.log('\n🎯 Next steps:');
    console.log('  1. Edit app.yaml with your configuration');
    console.log('  2. Deploy: doctl apps create --spec app.yaml');
    break;

  case 'netlify':
    copyFile('netlify-template.toml', 'netlify.toml');
    console.log('\n🎯 Next steps:');
    console.log('  1. Edit netlify.toml with your settings');
    console.log('  2. Deploy: netlify deploy --prod');
    break;

  default:
    console.error(`❌ Unknown platform: ${platform}`);
    console.log('\nSupported platforms:');
    console.log('  - vercel');
    console.log('  - digitalocean (or do)');
    console.log('  - netlify');
    process.exit(1);
}

console.log('\n✨ Installation complete!\n');
