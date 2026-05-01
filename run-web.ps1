# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "   Professor Assistant Web Server" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 0: Clean up port 3000
Write-Host "[0/4] Cleaning up port 3000..." -ForegroundColor Yellow

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$portConnections = netstat -ano 2>$null | Select-String ":3000"
if ($portConnections) {
    $portConnections | ForEach-Object {
        $tokens = $_ -split '\s+'
        $pid = $tokens[-1]
        if ($pid -match '^\d+$') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Start-Sleep -Seconds 2

# Step 1: Install backend dependencies
if (-not (Test-Path "$scriptDir\web\server\node_modules")) {
    Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location "$scriptDir\web\server"
    npm install
    Pop-Location
}

# Step 2: Install frontend dependencies
if (-not (Test-Path "$scriptDir\web\client\node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location "$scriptDir\web\client"
    npm install
    Pop-Location
}

# Step 3: Build frontend
if (-not (Test-Path "$scriptDir\web\client\dist")) {
    Write-Host "[3/4] Building frontend..." -ForegroundColor Yellow
    Push-Location "$scriptDir\web\client"
    npm run build
    Pop-Location
}

# Step 4: Start server
Write-Host ""
Write-Host "[4/4] Starting server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "   Server is ready!" -ForegroundColor Green
Write-Host "   URL: http://localhost:3000" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

Set-Location "$scriptDir\web\server"
node server.js
