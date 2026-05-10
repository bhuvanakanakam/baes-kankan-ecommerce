@echo off
title ISW Ecommerce — Full Setup
color 0A
cls

echo.
echo  ============================================
echo    ISW Ecommerce — One-Click Setup
echo  ============================================
echo.

:: ── Step 1: Create the database via sqlcmd ──
echo  [1/4] Setting up webData database in SQL Server...

:: Try localhost first, then .\SQLEXPRESS
sqlcmd -S localhost -E -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name='webData') BEGIN CREATE DATABASE webData; PRINT 'Created webData'; END ELSE PRINT 'webData already exists';" >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo        Trying SQL Server Express...
    sqlcmd -S .\SQLEXPRESS -E -Q "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name='webData') BEGIN CREATE DATABASE webData; PRINT 'Created webData'; END ELSE PRINT 'webData already exists';" >nul 2>&1
    IF %ERRORLEVEL% NEQ 0 (
        echo.
        echo  ERROR: Cannot connect to SQL Server automatically.
        echo  Please open SSMS manually and run fix_run_first.sql
        echo  then re-run this file.
        echo.
        pause
        exit /b 1
    )
    SET DB_SERVER=.\SQLEXPRESS
) ELSE (
    SET DB_SERVER=localhost
)

echo  [1/4] Database ready on %DB_SERVER%.

:: ── Step 2: Clean up any stray tables ──
echo  [2/4] Cleaning up previous partial runs...
sqlcmd -S %DB_SERVER% -E -Q "IF EXISTS (SELECT 1 FROM master.sys.tables WHERE name='Users' AND DB_NAME()='master') DROP TABLE master.dbo.Users;" >nul 2>&1

:: ── Step 3: Run the main SQL setup script ──
echo  [3/4] Creating tables and loading product data...
sqlcmd -S %DB_SERVER% -E -i "%~dp0websitedb_setup.sql" >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo  WARNING: SQL script had issues. Check SSMS if products don't load.
) ELSE (
    echo  [3/4] Database tables and products loaded successfully!
)

:: ── Step 4: Start the Node.js backend ──
echo  [4/4] Starting backend server...
echo.

IF NOT EXIST "%~dp0backend\node_modules" (
    echo  Installing Node dependencies (first time only, ~30 seconds)...
    cd "%~dp0backend"
    npm install
    cd "%~dp0"
)

:: Update .env with the correct server name
echo DB_SERVER=%DB_SERVER%> "%~dp0backend\.env.tmp"
echo DB_DATABASE=webData>> "%~dp0backend\.env.tmp"
echo DB_TRUSTED_CONNECTION=true>> "%~dp0backend\.env.tmp"
echo PORT=3001>> "%~dp0backend\.env.tmp"
move /Y "%~dp0backend\.env.tmp" "%~dp0backend\.env" >nul

echo.
echo  ============================================
echo   Setup complete!
echo.
echo   Opening website now...
echo   http://localhost:3001
echo  ============================================
echo.

:: Open browser
start "" "http://localhost:3001"

:: Start server (keeps window open)
cd "%~dp0backend"
node server.js

pause
