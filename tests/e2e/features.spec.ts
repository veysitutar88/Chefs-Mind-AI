import { test, expect } from '@playwright/test';

test.describe('Chef\'s Mind AI - API Documentation and E2E Features', () => {
  test.describe('OpenAPI 3.1 Documentation', () => {
    test('should serve OpenAPI JSON spec at /docs/openapi.json', async ({ page }) => {
      const response = await page.goto('/docs/openapi.json');
      expect(response?.status()).toBe(200);
      
      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('application/json');
      
      const json = await response?.json();
      expect(json).toHaveProperty('openapi', '3.1.0');
      expect(json).toHaveProperty('info.title', 'Chef\'s Mind AI API');
    });

    test('should serve Swagger UI at /docs/api', async ({ page }) => {
      await page.goto('/docs/api');
      
      // Check Swagger UI loads
      await expect(page.locator('.swagger-ui')).toBeVisible();
      await expect(page.locator('.opblock-tag')).toContainText('Authentication');
    });
  });

  test.describe('Core API Endpoints', () => {
    test('should respond to health check', async ({ request }) => {
      const response = await request.get('/health');
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('ok', true);
      expect(data).toHaveProperty('uptime');
      expect(typeof data.uptime).toBe('number');
    });

    test('should respond to metrics endpoint', async ({ request }) => {
      const response = await request.get('/metrics');
      expect(response.status()).toBe(200);
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/plain');
      
      const text = await response.text();
      expect(text).toContain('# HELP http_requests_total');
    });

    test('should handle database backup endpoint', async ({ request }) => {
      // Test without authentication (should fail)
      const response = await request.post('/api/db/backup');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Authentication and Security', () => {
    test('should serve OAuth consent page', async ({ page }) => {
      await page.goto('/api/auth/google');
      expect(page.url()).toContain('accounts.google.com/o/oauth2/v2/auth');
    });

    test('should require authentication for protected endpoints', async ({ request }) => {
      // Test backup endpoint without auth
      const response = await request.post('/api/db/backup');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Integration Features', () => {
    test('should handle session management', async ({ page, context }) => {
      await page.goto('/');
      // Session should be established via cookies
      const cookies = await context.cookies();
      expect(cookies.length).toBeGreaterThan(0);
    });

    test('should serve static files', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.status()).toBe(200);
    });
  });
});