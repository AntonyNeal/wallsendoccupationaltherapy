# Simple PowerShell HTTP Server for SDK Testing
# This serves the test.html file without CORS issues

Write-Host "`n🚀 Starting Local SDK Test Server..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8080/test.html" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Check if http-server is installed
$httpServer = Get-Command http-server -ErrorAction SilentlyContinue

if ($httpServer) {
    Write-Host "✓ Using http-server (Node.js)" -ForegroundColor Green
    npx http-server -p 8080 -c-1 --cors
} else {
    Write-Host "✓ Using Python HTTP server" -ForegroundColor Green
    
    # Try Python 3
    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) {
        python -m http.server 8080
    } else {
        Write-Host "❌ No server found. Install Node.js or Python." -ForegroundColor Red
        Write-Host "   npm install -g http-server" -ForegroundColor Yellow
        Write-Host "   OR install Python from python.org" -ForegroundColor Yellow
    }
}
