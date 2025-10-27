import { test, expect } from '@playwright/test';

test.describe('E2E Main Flow', () => {
  test('home -> submit prompt -> response is rendered', async ({ page }) => {
    // Intercept both possible backends to stabilize the test
    await page.route('**/api/universal-ask*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: 'Тестовый ответ',
          route: { model: 'gpt-4o-mini' }
        })
      });
    });

    await page.route('**/api/enhanced-agent/chat', async route => {
      const sse = [
        'data: {"type":"content","content":"Стримовый тест"}',
        '',
        'data: [DONE]',
        ''
      ].join('\n');
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: sse
      });
    });

    // Navigate to the home page (append e2e=1 to enable HTTP test mode in UI)
    const base = process.env.E2E_BASE_URL || 'http://localhost:3001/';
    await page.goto(base.includes('?') ? `${base}&e2e=1` : `${base}?e2e=1`);

    // Basic smoke of the page shell
    await expect(page.getByRole('heading', { level: 2, name: /Чат/ })).toBeVisible();

    // Submit a prompt
    await page.getByPlaceholder('Введите сообщение...').fill('План на вечер');
    const reqPromise = page.waitForRequest('**/api/universal-ask*', { timeout: 5000 });
    const respPromise = page.waitForResponse('**/api/universal-ask*', { timeout: 5000 });
    await page.locator('button.bg-blue-500').click();
    await Promise.all([reqPromise, respPromise]);

    // Verify either mocked universal or streamed enhanced response appears
    const expected1 = page.getByText('Тестовый ответ');
    const expected2 = page.getByText('Стримовый тест');

    await Promise.race([
      expected1.waitFor({ state: 'visible', timeout: 15000 }),
      expected2.waitFor({ state: 'visible', timeout: 15000 })
    ]);

    const vis1 = await expected1.isVisible().catch(() => false);
    const vis2 = await expected2.isVisible().catch(() => false);
    expect(vis1 || vis2).toBeTruthy();
  });
});