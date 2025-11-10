@echo off
setlocal

echo Stopping any existing server on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Terminating process with PID %%a
    taskkill /PID %%a /F
)
timeout /t 2 >nul

set "PORT=5001"
set "STATIC_DIR=C:\Projects\Chefs-Mind-AI\__no_such_static__"
set "NODE_ENV=production"
set "LOG_FILE=logs\boot_scnA.log"

echo Starting server for Scenario A...
start /B node --enable-source-maps dist/server/index.js > %LOG_FILE% 2>&1
echo Server started. Waiting a moment for boot up...
timeout /t 5 >nul

echo Testing health endpoint...
curl -i http://localhost:5001/health

echo Checking logs for "Static directory not found" and absence of stack/throw...
findstr "Static directory not found" %LOG_FILE%
if %errorlevel% equ 0 (
    echo Successfully found "Static directory not found" in logs.
) else (
    echo Error: "Static directory not found" not found in logs.
    exit /b 1
)

findstr /v /c:"stack" /c:"throw" %LOG_FILE% > nul
if %errorlevel% equ 1 (
    echo Error: Stack trace or throw found in logs.
    exit /b 1
) else (
    echo No stack trace or throw found in logs related to static files.
)

echo Scenario A completed.
exit /b 0