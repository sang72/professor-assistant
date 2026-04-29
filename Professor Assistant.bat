@echo off
chcp 65001 > nul
title Professor Assistant
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║      PROFESSOR ASSISTANT 시작 중...      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ─────────────────────────────────────────
:: 오류 로그 파일 설정
:: ─────────────────────────────────────────
set LOG=%USERPROFILE%\Desktop\professor_error.log
echo 실행 시간: %date% %time% > "%LOG%"
echo. >> "%LOG%"

:: ─────────────────────────────────────────
:: Git Bash 경로 찾기
:: ─────────────────────────────────────────
echo [1단계] Git Bash 경로 확인 중...
echo [1단계] Git Bash 경로 확인 >> "%LOG%"

set GITBASH=
if exist "C:\Program Files\Git\bin\bash.exe" (
    set "GITBASH=C:\Program Files\Git\bin\bash.exe"
    echo  ✅ 발견: C:\Program Files\Git\bin\bash.exe
    echo  발견: C:\Program Files\Git\bin\bash.exe >> "%LOG%"
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    set "GITBASH=C:\Program Files (x86)\Git\bin\bash.exe"
    echo  ✅ 발견: C:\Program Files ^(x86^)\Git\bin\bash.exe
    echo  발견: C:\Program Files (x86)\Git\bin\bash.exe >> "%LOG%"
)

if "%GITBASH%"=="" (
    echo  ❌ Git Bash를 찾을 수 없습니다! >> "%LOG%"
    echo  ❌ Git Bash를 찾을 수 없습니다!
    echo.
    echo  해결: https://git-scm.com/download/win 에서 설치
    echo. >> "%LOG%"
    pause
    exit /b 1
)

echo.

:: ─────────────────────────────────────────
:: 폴더 경로 확인
:: ─────────────────────────────────────────
echo [2단계] 폴더 경로 확인 중...
echo [2단계] 폴더 경로 확인 >> "%LOG%"

set "PROJ_DIR=%USERPROFILE%\Desktop\professor-assistant"
echo  설정된 경로: %PROJ_DIR%
echo  설정된 경로: %PROJ_DIR% >> "%LOG%"

if not exist "%PROJ_DIR%" (
    echo  ❌ 폴더 없음: %PROJ_DIR% >> "%LOG%"
    echo  ❌ 폴더를 찾을 수 없습니다!
    echo.
    echo  현재 바탕화면의 폴더 목록:
    dir "%USERPROFILE%\Desktop" /AD /B
    echo.
    echo  위 목록에서 professor-assistant 폴더 이름을 확인하세요.
    pause
    exit /b 1
)

echo  ✅ 폴더 확인 완료
echo  폴더 확인 완료 >> "%LOG%"
echo.

:: ─────────────────────────────────────────
:: start.sh 파일 확인
:: ─────────────────────────────────────────
echo [3단계] scripts/start.sh 확인 중...
echo [3단계] scripts/start.sh 확인 >> "%LOG%"

if not exist "%PROJ_DIR%\scripts\start.sh" (
    echo  ❌ start.sh 없음 >> "%LOG%"
    echo  ❌ scripts/start.sh 파일이 없습니다!
    echo.
    echo  현재 scripts 폴더 내용:
    if exist "%PROJ_DIR%\scripts" (
        dir "%PROJ_DIR%\scripts" /B
    ) else (
        echo  scripts 폴더 자체가 없습니다!
    )
    echo.
    pause
    exit /b 1
)

echo  ✅ start.sh 확인 완료
echo  start.sh 확인 완료 >> "%LOG%"
echo.

:: ─────────────────────────────────────────
:: 경로 변환 (백슬래시 → 슬래시)
:: ─────────────────────────────────────────
set "PROJ_UNIX=%PROJ_DIR:\=/%"
echo  Unix 경로: %PROJ_UNIX%
echo  Unix 경로: %PROJ_UNIX% >> "%LOG%"
echo.

:: ─────────────────────────────────────────
:: Git Bash 실행
:: ─────────────────────────────────────────
echo [4단계] Git Bash 실행 중...
echo [4단계] Git Bash 실행 >> "%LOG%"
echo.
echo  ══════════════════════════════════════
echo  🚀 시작합니다! Git Bash 창이 열립니다.
echo  ══════════════════════════════════════
echo.

"%GITBASH%" --login -i -c "cd '%PROJ_UNIX%' && bash scripts/start.sh; exec bash"

if %errorlevel% neq 0 (
    echo  ❌ Git Bash 실행 실패. 에러코드: %errorlevel% >> "%LOG%"
    echo  ❌ Git Bash 실행에 실패했습니다.
    echo  에러코드: %errorlevel%
    pause
)

echo 종료 완료 >> "%LOG%"
pause
