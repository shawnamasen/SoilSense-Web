
@echo off
title SoilSense - Team Launcher
setlocal

:: Navigate to frontend
cd /d "%~dp0frontend"

if errorlevel 1 (
    echo ERROR: Frontend folder not found.
    pause
    exit /b 1
)

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

:: Check npm
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available.
    pause
    exit /b 1
)

echo Node.js version:
node -v

:: Install dependencies if missing
if not exist "node_modules\.bin\vite.cmd" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Installation failed.
        pause
        exit /b 1
    )
)

echo.
echo Starting SoilSense...
echo URL: http://localhost:5173
echo.

:: Open browser
start "" /min cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:5173"

:: Start website
call npm run dev -- --host localhost --port 5173 --strictPort

pause
