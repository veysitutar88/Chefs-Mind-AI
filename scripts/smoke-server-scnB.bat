@echo off
setlocal

echo Stopping any existing server on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Terminating process with PID %%a
    taskkill /PID %%a /F
)
timeout /t 2 >nul

set "PORT=5001"
set "STATIC_DIR=C:\Projects\Chefs-Mind-AI\tmp\static-test"
set "NODE_ENV=production"
set "LOG_FILE=logs\boot_scnB.log"
set "STATIC_TEST_DIR=tmp\static-test"
set "STATIC_TEST_FILE=%STATIC_TEST_DIR%\index.html"

echo Creating static test directory and file...
if not exist %STATIC_TEST_DIR% mkdir %STATIC_TEST_DIR%
echo ^<html^>^<body^>Static OK^</body^>^</html^> > %STATIC_TEST_FILE%

echo Starting server for Scenario B...
start /B node --enable-source-maps dist/server/index.js > %LOG_FILE% 2>&1
echo Server started. Waiting a moment for boot up...
timeout /t 5 >nul

echo Testing static file endpoint...
curl -i http://localhost:5001/
echo.

echo Testing health endpoint...
curl -i http://localhost:5001/health
echo.

echo Checking logs for "Serving static files from" and absence of "Static directory not found"...
findstr "Serving static files from" %LOG_FILE%
if %errorlevel% equ 0 (
    echo Successfully found "Serving static files from" in logs.
) else (
    echo Error: "Serving static files from" not found in logs.
    exit /b 1
)

findstr "Static directory not found" %LOG_FILE%
if %errorlevel% equ 0 (
    echo Error: "Static directory not found" unexpectedly found in logs.
    exit /b 1
) else (
    echo "Static directory not found" not present in logs as expected.
)

echo Scenario B completed.
exit /b 0