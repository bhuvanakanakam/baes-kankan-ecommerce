@echo off
title ISW Ecommerce Backend
color 0A

echo.
echo  ==========================================
echo   ISW Ecommerce Website - Backend Server
echo  ==========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Node.js is not installed.
    echo  Download it from: https://nodejs.org
    pause
    exit /b 1
)

echo  [1/3] Node.js found.

:: Install dependencies if node_modules doesn't exist
IF NOT EXIST "node_modules" (
    echo  [2/3] Installing dependencies...
    npm install
) ELSE (
    echo  [2/3] Dependencies already installed.
)

echo  [3/3] Starting server...
echo.
echo  Website: http://localhost:3001
echo  API:     http://localhost:3001/api/products
echo  Health:  http://localhost:3001/api/health
echo.
echo  Press Ctrl+C to stop the server.
echo.

node server.js

pause
