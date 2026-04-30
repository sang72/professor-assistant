# Professor Assistant Server Startup Script (PowerShell)
# Windows에서 포트 3000을 안정적으로 정리하고 서버를 시작합니다

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Professor Assistant Web Server" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 포트 3000에서 실행 중인 모든 프로세스 종료
Write-Host "[0/4] Cleaning up port 3000..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $processId = $conn.OwningProcess
        try {
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "  ✅ Killed process $processId" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Could not kill process $processId" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  ✅ Port 3000 is free" -ForegroundColor Green
}

# node 프로세스도 모두 종료 (백업)
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Killing node processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# 프로젝트 디렉토리
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 의존성 설치 확인
if (-not (Test-Path "web/server/node_modules")) {
    Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location "web/server"
    npm install
    Set-Location $scriptDir
}

if (-not (Test-Path "web/client/node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location "web/client"
    npm install
    Set-Location $scriptDir
}

# 프론트엔드 빌드
if (-not (Test-Path "web/client/dist")) {
    Write-Host "[3/4] Building frontend..." -ForegroundColor Yellow
    Set-Location "web/client"
    npm run build
    Set-Location $scriptDir
}

# 서버 시작
Write-Host ""
Write-Host "[4/4] Starting server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Server is ready!" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

Set-Location "web/server"
node server.js
