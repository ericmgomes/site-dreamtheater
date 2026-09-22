import { test, expect } from '@playwright/test';

test('initial viewport stays stable with delayed fonts and JavaScript', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route(/\.(woff2?|js)(\?|$)/, async route => {
    if (!route.request().url().startsWith('http://127.0.0.1:4322/')) return route.fallback();
    await new Promise(resolve => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.addInitScript(() => {
    (window as any).layoutShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) (window as any).layoutShifts.push({ value: entry.value, sources: entry.sources?.map((source: any) => source.node?.className) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-setlist-city]')).toBeVisible();
  await page.waitForTimeout(500);
  const shifts = await page.evaluate(() => (window as any).layoutShifts);
  console.log(JSON.stringify(shifts));
  expect(shifts.reduce((sum: number, entry: any) => sum + entry.value, 0)).toBeLessThan(0.05);
});
