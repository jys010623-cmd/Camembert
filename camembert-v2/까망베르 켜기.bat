@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 까망베르 v2 실행 중...
call npm run dev
pause
