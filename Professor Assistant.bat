@echo off
chcp 65001 > nul
cd /d "%USERPROFILE%\Desktop\professor-assistant"
bash scripts/start.sh
pause
