@echo off
echo Running smoke tests...

curl -sS http://localhost:5001/health > reports/health_smoke.log
curl -sS http://localhost:5001/metrics > reports/metrics_smoke.log

echo Smoke tests complete. See reports/ for details.