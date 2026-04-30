@echo off
chcp 65001 >nul

echo.
echo ==================================
echo   Cleaning up Port 3000
echo ==================================
echo.

echo 포트 3000의 프로세스를 종료합니다...
echo.

REM 포트 3000 확인
netstat -ano | findstr ":3000" >nul
if errorlevel 1 (
    echo ✅ 포트 3000은 이미 비어있습니다
    echo.
    pause
    exit /b 0
)

REM Method 1: netstat와 taskkill로 종료
echo [방법 1] netstat를 통한 프로세스 종료...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000"') do (
    echo   프로세스 ID %%a 종료 중...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 0 (
        echo   ✅ 프로세스 %%a 종료됨
    )
)

REM 대기
echo.
echo 1초 대기 중...
timeout /t 1 /nobreak >nul

REM Method 2: node.exe 전체 종료
echo.
echo [방법 2] Node.js 프로세스 전체 종료...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 0 (
    echo   ✅ Node.js 프로세스 종료됨
)

REM 최종 확인
echo.
echo 포트 3000 상태 확인 중...
timeout /t 1 /nobreak >nul

netstat -ano | findstr ":3000" >nul
if errorlevel 1 (
    echo.
    echo ✅ 포트 3000이 성공적으로 정리되었습니다!
    echo.
    echo 이제 run-web.bat를 실행할 수 있습니다.
) else (
    echo.
    echo ⚠️  포트 3000이 여전히 사용 중입니다.
    echo.
    echo 다른 애플리케이션에서 포트를 사용 중일 수 있습니다.
    echo 작업 관리자에서 node.exe 프로세스를 확인하세요.
)

echo.
pause
