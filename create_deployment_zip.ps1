# ElixLumi Deployment Packaging Script (Improved Version)
Write-Host "🚀 Starting Deployment Packaging..." -ForegroundColor Cyan

# 1. Clean previous build and zip
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
$zipName = "elixlumi_hostinger_deploy.zip"
if (Test-Path $zipName) { Remove-Item $zipName }

# 2. Build the frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Aborting." -ForegroundColor Red
    exit 1
}

# 3. Define files to include
$includeFiles = @(
    "dist",
    "backend",
    "uploads",
    "package.json",
    "package-lock.json",
    ".env"
)

# 4. Create ZIP
Write-Host "📦 Creating ZIP archive: $zipName..." -ForegroundColor Yellow
Compress-Archive -Path $includeFiles -DestinationPath $zipName -Force

Write-Host "✅ Deployment package created successfully!" -ForegroundColor Green
Write-Host "👉 INFO: Zip file contains 'dist' folder. Make sure your Hostinger Node.js app is running 'backend/server.js'." -ForegroundColor White
