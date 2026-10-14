
@echo off
title SoilSense Web Portal
setlocal

:: Node.js PATH
set "PATH=F:\node\node-v25.6.0-win-x64;%PATH%"

:: Go to frontend folder
cd /d "%~dp0frontend"

if errorlevel 1 (
    echo ERROR: Frontend folder not found!
    pause
    exit /b 1
)

:: Check Node.js
node -v
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

:: Install dependencies if missing
if not exist "node_modules\vite" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Installation failed!
        pause
        exit /b 1
    )
)

:: Open website automatically
start "" "http://localhost:5173"

echo ======================================
echo        SOILSENSE WEB PORTAL
echo ======================================
echo.
echo Website: http://localhost:5173
echo.
echo Keep this window open.
echo.

:: Start Vite using localhost
call npm run dev -- --host localhost --port 5173 --strictPort

pause
