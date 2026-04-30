# 가장 간단한 서버 시작 스크립트
# PowerShell에서 실행: .\start.ps1

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Professor Assistant Server" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 포트 3000 강제 정리
Write-Host "[0/2] Killing all node.exe processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue | Out-Null
Start-Sleep -Seconds 1

Write-Host "[1/2] Starting server..." -ForegroundColor Yellow

# 서버 시작
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\web\server"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Server is starting..." -ForegroundColor Green
Write-Host "  URL: http://localhost:3000" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

node server.js
