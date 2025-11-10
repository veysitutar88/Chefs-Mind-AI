import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('E2E Auth Smoke', () => {
  test('login=admin → dashboard=OK → logout → dashboard=DENIED', async ({
    page,
  }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    const logFilePath = path.join(
      process.cwd(),
      'reports',
      'artifacts',
      'e2e_auth_smoke.log'
    );

    try {
      // Step 1: Login with admin role
      await page.goto(`${baseURL}/?e2e=1&login=admin`);
      await page.waitForLoadState('networkidle');

      // Step 2: Navigate to dashboard and verify access is granted
      await page.goto(`${baseURL}/dashboard?e2e=1`);
      await page.waitForLoadState('networkidle');

      // Check if we can access dashboard (should see dashboard content, not access denied)
      try {
        await expect(page.getByText('Dashboard')).toBeVisible({
          timeout: 5000,
        });
        console.log('✓ Dashboard access granted after login=admin');
      } catch (error) {
        // If no "Dashboard" text found, check for access denied message
        const accessDenied = await page
          .getByText('Доступ ограничен')
          .isVisible()
          .catch(() => false);
        if (accessDenied) {
          throw new Error(
            'Dashboard should be accessible with admin role, but got access denied'
          );
        } else {
          throw new Error('Dashboard page did not load properly');
        }
      }

      // Step 3: Logout
      await page.goto(`${baseURL}/?e2e=1&logout=1`);
      await page.waitForLoadState('networkidle');

      // Step 4: Try to access dashboard again - should be blocked
      await page.goto(`${baseURL}/dashboard?e2e=1`);
      await page.waitForLoadState('networkidle');

      // Verify access is now denied
      await expect(page.getByText('Доступ ограничен')).toBeVisible({
        timeout: 5000,
      });
      console.log('✓ Dashboard access denied after logout');

      // Success logging
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp} | e2e_auth_smoke | login=admin → dashboard=OK → logout → dashboard=DENIED | base=${baseURL}\n`;

      // Ensure directory exists
      const dir = path.dirname(logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.appendFileSync(logFilePath, logEntry, 'utf8');
      console.log(`✓ Test completed successfully, logged to ${logFilePath}`);
    } catch (error) {
      // Log failure
      const timestamp = new Date().toISOString();
      const errorEntry = `${timestamp} | e2e_auth_smoke | FAILED: ${error.message} | base=${baseURL}\n`;

      try {
        const dir = path.dirname(logFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.appendFileSync(logFilePath, errorEntry, 'utf8');
      } catch (logError) {
        console.error('Failed to write error log:', logError);
      }

      throw error;
    }
  });
});
