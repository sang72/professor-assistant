@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo.
echo ===================================
echo   Professor Assistant Web Server
echo ===================================
echo.

echo [0/4] Cleaning up port 3000...

REM 모든 node.exe 프로세스 강제 종료
taskkill /F /IM node.exe >nul 2>&1

REM 포트 3000 프로세스 강제 종료
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000"') do taskkill /F /PID %%a >nul 2>&1

timeout /t 2 /nobreak >nul

if not exist "%SCRIPT_DIR%web\server\node_modules" (
    echo [1/4] Installing backend dependencies...
    cd /d "%SCRIPT_DIR%web\server"
    call npm install
    cd /d "%SCRIPT_DIR%"
)

if not exist "%SCRIPT_DIR%web\client\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd /d "%SCRIPT_DIR%web\client"
    call npm install
    cd /d "%SCRIPT_DIR%"
)

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
