@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo.
echo ===================================
echo   Professor Assistant Web Server
echo ===================================
echo.

REM Kill any existing process on port 3000 using PowerShell (more reliable)
echo [0/4] Cleaning up port 3000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
timeout /t 2 /nobreak >nul

REM Check if server node_modules exists
if not exist "%SCRIPT_DIR%web\server\node_modules" (
    echo [1/4] Installing backend dependencies...
    cd /d "%SCRIPT_DIR%web\server"
    call npm install
    cd /d "%SCRIPT_DIR%"
)

REM Check if client node_modules exists
if not exist "%SCRIPT_DIR%web\client\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd /d "%SCRIPT_DIR%web\client"
    call npm install
    cd /d "%SCRIPT_DIR%"
)

REM Build client if dist doesn't exist
if not exist "%SCRIPT_DIR%web\client\dist" (
    echo [3/4] Building frontend...
    cd /d "%SCRIPT_DIR%web\client"
    call npm run build
    cd /d "%SCRIPT_DIR%"
)

echo.
echo [4/4] Starting server...
echo.
echo ===================================
echo   Server is ready!
echo   URL: http://localhost:3000
echo ===================================
echo.
echo Press Ctrl+C to stop
echo.

cd /d "%SCRIPT_DIR%web\server"
node server.js

pause
