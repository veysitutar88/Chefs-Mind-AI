# CI Summary - 2025-11-10 03:33 UTC

## Lint: FAILED
- **Exit Code**: 2
- **Log Path**: reports/artifacts/ci_logs/lint.log
- **Command**: npm run lint

## Typecheck: FAILED  
- **Exit Code**: 1
- **Log Path**: reports/artifacts/ci_logs/typecheck.log
- **Command**: npx tsc -p tsconfig.json --noEmit

## Vitest: FAILED
- **Exit Code**: 1  
- **Log Path**: reports/artifacts/ci_logs/unit_integration.log
- **Command**: npx vitest run --coverage
- **Coverage Report**: reports/artifacts/ci_logs/coverage.txt

## Playwright: FAILED
- **Exit Code**: 1
- **Log Path**: reports/artifacts/ci_logs/e2e.log  
- **Command**: npx cross-env BASE_URL=http://localhost:3001 npx playwright test --reporter=line

---

## Summary
Все четыре компонента CI-пайплайна завершились с ошибками. Подробная информация о каждой ошибке находится в соответствующих лог-файлах.

## Coverage
Покрытие кода тестами недоступно из-за ошибок выполнения тестов.

## Artifacts Location
- Все логи сохранены в: reports/artifacts/ci_logs/
- Дополнительные артефакты: npm_ci.log (если зависимости устанавливались)
- Coverage report: coverage.txt (если сгенерирован)