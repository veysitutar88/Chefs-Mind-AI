# E2E Validation Report 2025-11-10
## Status: FAIL
## Tests Executed: 11
## Passed: 0
## Failed: 11
## Timing: 45 seconds
## Issues: 
- net::ERR_CONNECTION_REFUSED at http://localhost:5001/ - All tests failed to connect to server
- OpenAPI JSON spec test: Connection refused to `/docs/openapi.json`
- Swagger UI test: Connection refused to `/docs/api`
- Health check test: Connection refused to `/health`
- Metrics endpoint test: Connection refused to `/metrics`
- Database backup test: Connection refused to `/api/db/backup`
- OAuth consent test: Connection refused to `/api/auth/google`
- Protected endpoints test: Connection refused to `/api/db/backup`
- Session management test: Connection refused to `/`
- Static files test: Connection refused to `/static/index.html`
- Auth smoke test: Connection refused to `http://localhost:3001/?e2e=1&login=admin`
- Main flow test: Connection refused to `http://localhost:3001/?e2e=1`