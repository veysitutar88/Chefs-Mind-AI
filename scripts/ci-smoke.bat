@echo off
echo === CI Smoke Test Started ===

cd frontend-enhanced

echo 1. Building project...
npm run build > ..\reports\ci_build.log 2>&1
if %errorlevel% neq 0 (
    echo BUILD FAILED
    exit /b 1
) else (
    echo BUILD SUCCESS
)

echo 2. Linting code...
npx next lint > ..\reports\ci_lint.log 2>&1
if %errorlevel% neq 0 (
    echo LINT FAILED
    exit /b 1
) else (
    echo LINT SUCCESS
)

echo 3. Type checking...
npx tsc -p . --noEmit > ..\reports\ci_tsc.log 2>&1
if %errorlevel% neq 0 (
    echo TSC FAILED
    exit /b 1
) else (
    echo TSC SUCCESS
)

echo === CI Smoke Test Completed Successfully ===