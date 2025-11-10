@echo off
chcp 65001
if not exist reports mkdir reports
for /f %%i in ('powershell -NoProfile -Command "(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHHmmssZ')"') do set ISO=%%i
set "REPORT=reports\frontend_audit_%ISO%.md"
echo Creating "%REPORT%" && type NUL > "%REPORT%"

echo ### 1) Node ^& NPM Versions >> "%REPORT%"
node -v >> "%REPORT%" 2>&1
echo. >> "%REPORT%"
npm -v >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 2) cd frontend >> "%REPORT%"
pushd frontend >> "%REPORT%" 2>&1
cd >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 3) package.json (raw) >> "%REPORT%"
type package.json >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 4) npm ls --depth=0 >> "%REPORT%"
npm ls --depth=0 >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 5) grep @radix-ui/react-button >> "%REPORT%"
(findstr /I /N "@radix-ui/react-button" src\* /S >> "%REPORT%" 2>&1) || (echo [no matches] >> "%REPORT%")
echo. >> "%REPORT%"

echo ### 6) grep from "@/components/ui/button" >> "%REPORT%"
(findstr /I /N "from \"@/components/ui/button\"" src\* /S >> "%REPORT%" 2>&1) || (echo [no matches] >> "%REPORT%")
echo. >> "%REPORT%"

echo ### 7) next.config.js (raw) >> "%REPORT%"
type next.config.js >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 8) npx next info >> "%REPORT%"
npx --yes next info >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 9) package.json scripts >> "%REPORT%"
node -e "let j=require('./package.json');console.log(JSON.stringify(j.scripts,null,2))" >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### 10) App Router structure (src\app, app) >> "%REPORT%"
(dir src\app >> "%REPORT%" 2>&1) || (echo [src\app not found] >> "%REPORT%")
echo. >> "%REPORT%"
(dir app >> "%REPORT%" 2>&1) || (echo [app not found] >> "%REPORT%")
echo. >> "%REPORT%"

echo ### 11) .env.local (masked values) >> "%REPORT%"
if exist .env.local (powershell -NoProfile -Command "Get-Content .env.local | ForEach-Object { ($_ -replace '(=).*','=[MASKED]') }" >> "%REPORT%") else (echo .env.local: [NO FILE] >> "%REPORT%")
echo. >> "%REPORT%"

echo ### 12) env usage in code >> "%REPORT%"
(findstr /I /N "NEXT_PUBLIC_API_URL" src\* /S >> "%REPORT%" 2>&1) || (echo [NEXT_PUBLIC_API_URL not found] >> "%REPORT%")
echo. >> "%REPORT%"
(findstr /I /N "VITE_API_BASE" src\* /S >> "%REPORT%" 2>&1) || (echo [VITE_API_BASE not found] >> "%REPORT%")
echo. >> "%REPORT%"

echo ### 13) Git rev and status >> "%REPORT%"
git rev-parse --short HEAD >> "%REPORT%" 2>&1
echo. >> "%REPORT%"
git status --porcelain >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ### APPENDIX: Attached raw files (package.json, next.config.js, .env.local masked) >> "%REPORT%"
echo ---- frontend\package.json ---- >> "%REPORT%"
type package.json >> "%REPORT%" 2>&1
echo. >> "%REPORT%"
echo ---- frontend\next.config.js ---- >> "%REPORT%"
type next.config.js >> "%REPORT%" 2>&1
echo. >> "%REPORT%"
echo ---- frontend\.env.local (masked) ---- >> "%REPORT%"
if exist .env.local (powershell -NoProfile -Command "Get-Content .env.local | ForEach-Object { ($_ -replace '(=).*','=[MASKED]') }" >> "%REPORT%") else (echo .env.local: [NO FILE] >> "%REPORT%")
echo. >> "%REPORT%"

popd >> "%REPORT%" 2>&1

if exist "%REPORT%" (echo Report ready: %REPORT%) else (echo [ERROR] Report file was not created)
