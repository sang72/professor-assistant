@echo off
setlocal enabledelayedexpansion

echo 🎓 Professor Assistant Web Server 시작...
echo.

REM Check if server node_modules exists
if not exist "web\server\node_modules" (
    echo 📦 백엔드 의존성 설치 중...
    cd web\server
    call npm install
    cd ..\..
)

REM Check if client node_modules exists
if not exist "web\client\node_modules" (
    echo 📦 프론트엔드 의존성 설치 중...
    cd web\client
    call npm install
    cd ..\..
)

REM Build client if dist doesn't exist
if not exist "web\client\dist" (
    echo 🏗️  프론트엔드 빌드 중...
    cd web\client
    call npm run build
    cd ..\..
)

echo.
echo ✓ 준비 완료
echo.
echo 🚀 웹 서버 시작...
echo    URL: http://localhost:3000
echo.
echo Ctrl+C로 중지할 수 있습니다
echo.

cd web\server
node server.js

pause
