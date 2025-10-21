@echo off
mkdir reports 2>nul
echo Building production containers...
docker compose -f docker-compose.prod.yml build > reports/prod_build.log 2>&1
if %errorlevel% neq 0 (
    echo BUILD FAILED
    exit /b 1
)
echo Starting production containers...
docker compose -f docker-compose.prod.yml up -d > reports/prod_up.log 2>&1
if %errorlevel% neq 0 (
    echo START FAILED
    exit /b 1
)
echo Deploy done.