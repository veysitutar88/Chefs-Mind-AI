@echo off
mkdir reports 2>nul
echo === SIMPLE PRODUCTION DEPLOY TEST === > reports/prod_build.log
echo Docker not available - simulating production setup >> reports/prod_build.log
echo Checking frontend build status... >> reports/prod_build.log
cd frontend-enhanced
npm run build >> ..\reports\prod_build.log 2>&1
if %errorlevel% neq 0 (
    echo FRONTEND BUILD FAILED >> ..\reports\prod_build.log
    exit /b 1
) else (
    echo FRONTEND BUILD SUCCESS >> ..\reports\prod_build.log
)
echo Checking backend availability... >> ..\reports\prod_build.log
cd ..
curl -sSI http://localhost:5001/health >> reports/prod_build.log 2>&1 || echo "Backend not running" >> reports/prod_build.log
echo Deploy simulation done.