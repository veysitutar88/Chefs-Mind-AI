@echo off
mkdir reports 2>nul
echo [SMOKE] Backend health > reports/prod_smoke.log
curl -sS http://localhost:5001/health >> reports/prod_smoke.log 2>&1 || echo "Backend not available" >> reports/prod_smoke.log
echo. >> reports/prod_smoke.log
echo [SMOKE] Frontend head >> reports/prod_smoke.log
curl -sSI http://localhost:3000 >> reports/prod_smoke.log 2>&1 || echo "Frontend not available" >> reports/prod_smoke.log
echo. >> reports/prod_smoke.log
echo [SMOKE] Done >> reports/prod_smoke.log
echo Smoke test completed.