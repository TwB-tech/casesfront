# Appwrite Database Setup - PowerShell Script
# Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser; .\scripts\Setup-Appwrite.ps1

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Appwrite Database Setup for WakiliWorld" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check for .env
if (-not (Test-Path ".env")) {
    Write-Error ".env file not found. Create one with APPWRITE_* variables first."
    Write-Host "See .env.example for template" -ForegroundColor Yellow
    exit 1
}

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "[+] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "Node.js is not installed. Get it from https://nodejs.org"
    exit 1
}

Write-Host "[+] .env file found" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[+] Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "[+] Running Appwrite setup script..." -ForegroundColor Yellow
Write-Host ""

# Run Node.js setup script
node "scripts/setup-appwrite.js"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Setup failed. Check messages above."
    Write-Host "`nMake sure you have:" -ForegroundColor Yellow
    Write-Host "  1. Created Appwrite project at cloud.appwrite.io" -ForegroundColor Yellow
    Write-Host "  2. Got PROJECT_ID and API_KEY from Project Settings" -ForegroundColor Yellow
    Write-Host "  3. Added them to .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify collections in Appwrite Console" -ForegroundColor White
Write-Host "  2. Create indexes (Database > Collection > Indexes tab)" -ForegroundColor White
Write-Host "  3. Set DATABASE_MODE=appwrite in .env" -ForegroundColor White
Write-Host "  4. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or run full migration from Supabase:" -ForegroundColor Cyan
Write-Host "  npm run db:migrate" -ForegroundColor White
Write-Host ""
