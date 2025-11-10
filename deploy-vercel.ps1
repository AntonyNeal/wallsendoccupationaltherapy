# Quick Vercel Deployment Script
# Run this to deploy to Vercel

Write-Host "🚀 Wallsend Occupational Therapy - Vercel Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    Write-Host ""
}

# Run build test
Write-Host "📦 Testing production build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Prompt for deployment type
Write-Host "Choose deployment type:" -ForegroundColor Cyan
Write-Host "  1. Preview deployment (test before production)"
Write-Host "  2. Production deployment"
Write-Host "  3. Cancel"
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Deploying preview..." -ForegroundColor Cyan
        vercel
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  This will deploy to your production domain!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (yes/no)"
        
        if ($confirm -eq "yes") {
            vercel --prod
        } else {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    "3" {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Deployment cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test your deployment URL"
Write-Host "  2. Check all pages load correctly"
Write-Host "  3. Test mobile navigation and hamburger menu"
Write-Host "  4. Verify booking modal works"
Write-Host ""
Write-Host "For custom domain setup, see VERCEL-DEPLOY.md" -ForegroundColor Gray
