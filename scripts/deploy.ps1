# Interactive Deployment Script
# Prompts user to select deployment provider and configures GitHub workflows accordingly

Write-Host "🚀 O'Sullivan Farms - Deployment Configuration" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Check if already deployed
$azureWorkflow = Test-Path ".github\workflows\azure-static-web-apps.yml"
$doWorkflow = Test-Path ".github\workflows\deploy.yml"

if ($azureWorkflow -or $doWorkflow) {
    Write-Host "⚠️  Existing deployment configuration detected:" -ForegroundColor Yellow
    if ($azureWorkflow) { Write-Host "   - Azure Static Web Apps workflow found" }
    if ($doWorkflow) { Write-Host "   - DigitalOcean App Platform workflow found" }
    Write-Host ""
    
    $reconfigure = Read-Host "Do you want to reconfigure? (y/N)"
    if ($reconfigure -ne 'y' -and $reconfigure -ne 'Y') {
        Write-Host "Deployment configuration unchanged." -ForegroundColor Green
        exit 0
    }
}

Write-Host ""
Write-Host "Select your deployment provider:" -ForegroundColor Cyan
Write-Host "1. Azure Static Web Apps (Recommended for React/SPA)"
Write-Host "2. DigitalOcean App Platform"
Write-Host "3. Both (Multi-cloud deployment)"
Write-Host "4. None (Disable auto-deployment)"
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "✅ Configuring Azure Static Web Apps..." -ForegroundColor Green
        
        # Disable DigitalOcean workflow
        if (Test-Path ".github\workflows\deploy.yml") {
            Move-Item ".github\workflows\deploy.yml" ".github\workflows\deploy.yml.disabled" -Force
            Write-Host "   - Disabled DigitalOcean workflow"
        }
        
        # Enable Azure workflow (if disabled)
        if (Test-Path ".github\workflows\azure-static-web-apps.yml.disabled") {
            Move-Item ".github\workflows\azure-static-web-apps.yml.disabled" ".github\workflows\azure-static-web-apps.yml" -Force
            Write-Host "   - Enabled Azure workflow"
        }
        
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Create Azure Static Web App resource"
        Write-Host "2. Get deployment token from Azure Portal"
        Write-Host "3. Add GitHub secret: AZURE_STATIC_WEB_APPS_API_TOKEN"
        Write-Host "4. Push to main branch to trigger deployment"
        Write-Host ""
        Write-Host "See AZURE-DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "✅ Configuring DigitalOcean App Platform..." -ForegroundColor Green
        
        # Disable Azure workflow
        if (Test-Path ".github\workflows\azure-static-web-apps.yml") {
            Move-Item ".github\workflows\azure-static-web-apps.yml" ".github\workflows\azure-static-web-apps.yml.disabled" -Force
            Write-Host "   - Disabled Azure workflow"
        }
        
        # Enable DigitalOcean workflow (if disabled)
        if (Test-Path ".github\workflows\deploy.yml.disabled") {
            Move-Item ".github\workflows\deploy.yml.disabled" ".github\workflows\deploy.yml" -Force
            Write-Host "   - Enabled DigitalOcean workflow"
        }
        
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Create DigitalOcean App Platform app"
        Write-Host "2. Get API token from DigitalOcean"
        Write-Host "3. Add GitHub secrets:"
        Write-Host "   - DIGITALOCEAN_ACCESS_TOKEN"
        Write-Host "   - APP_ID"
        Write-Host "4. Push to main branch to trigger deployment"
        Write-Host ""
        Write-Host "See DO-CLI-SETUP.md for detailed instructions" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host ""
        Write-Host "✅ Configuring multi-cloud deployment..." -ForegroundColor Green
        
        # Enable both workflows
        if (Test-Path ".github\workflows\azure-static-web-apps.yml.disabled") {
            Move-Item ".github\workflows\azure-static-web-apps.yml.disabled" ".github\workflows\azure-static-web-apps.yml" -Force
        }
        if (Test-Path ".github\workflows\deploy.yml.disabled") {
            Move-Item ".github\workflows\deploy.yml.disabled" ".github\workflows\deploy.yml" -Force
        }
        Write-Host "   - Both workflows enabled"
        
        Write-Host ""
        Write-Host "⚠️  Warning: This will deploy to both providers on every push!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Required GitHub secrets:" -ForegroundColor Yellow
        Write-Host "   Azure: AZURE_STATIC_WEB_APPS_API_TOKEN"
        Write-Host "   DigitalOcean: DIGITALOCEAN_ACCESS_TOKEN, APP_ID"
    }
    
    "4" {
        Write-Host ""
        Write-Host "✅ Disabling auto-deployment..." -ForegroundColor Green
        
        # Disable both workflows
        if (Test-Path ".github\workflows\azure-static-web-apps.yml") {
            Move-Item ".github\workflows\azure-static-web-apps.yml" ".github\workflows\azure-static-web-apps.yml.disabled" -Force
            Write-Host "   - Disabled Azure workflow"
        }
        if (Test-Path ".github\workflows\deploy.yml") {
            Move-Item ".github\workflows\deploy.yml" ".github\workflows\deploy.yml.disabled" -Force
            Write-Host "   - Disabled DigitalOcean workflow"
        }
        
        Write-Host ""
        Write-Host "Manual deployment options still available:" -ForegroundColor Cyan
        Write-Host "   - npm run deploy:azure"
        Write-Host "   - Azure CLI: az staticwebapp create"
        Write-Host "   - DigitalOcean CLI: doctl apps create"
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Please run again and select 1-4." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=" * 60
Write-Host "✅ Configuration complete!" -ForegroundColor Green
Write-Host ""

# Ask to commit changes
$commit = Read-Host "Commit these changes? (y/N)"
if ($commit -eq 'y' -or $commit -eq 'Y') {
    git add .github/workflows/
    git commit -m "chore: Configure deployment provider via interactive script"
    Write-Host "Changes committed. Push to apply configuration." -ForegroundColor Green
}
