@echo off
cd /d "%~dp0"
echo === Imagine Jiu Jitsu — first-time setup ===
call npm install
if errorlevel 1 (echo. & echo npm install failed — send Claude the error above. & pause & exit /b 1)
call npm run db:seed
start "" http://localhost:3000
call npm run dev
pause
