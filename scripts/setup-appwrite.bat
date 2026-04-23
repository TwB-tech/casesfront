@echo off
REM Appwrite Database Setup - Windows Batch Script
REM Usage: setup-appwrite.bat

echo ================================================
echo  Appwrite Database Setup for WakiliWorld
echo ================================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found in current directory
    echo Please create .env with APPWRITE_* variables first
    echo See .env.example for template
    pause
    exit /b 1
)

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Install from https://nodejs.org
    pause
    exit /b 1
)

echo [+] Node.js found
echo [+] .env file found
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo [+] Installing npm dependencies...
    call npm install
)

echo [+] Running Appwrite setup script...
echo.
node scripts\setup-appwrite.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Setup failed. Check the messages above.
    echo Make sure you have:
    echo   1. Created Appwrite project at cloud.appwrite.io
    echo   2. Got PROJECT_ID and API_KEY from Project Settings
    echo   3. Added them to .env file
    pause
    exit /b 1
)

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo   1. Verify collections in Appwrite Console
echo   2. Create indexes (run: scripts\create-indexes.bat or manual)
echo   3. Set DATABASE_MODE=appwrite in .env
echo   4. Run: npm run dev
echo.
pause
