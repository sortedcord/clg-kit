import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/10-today-collapsed.png' });

  // Click extend bar
  const extendBar = page.getByRole('button', { name: 'Expand calendar' });
  await extendBar.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './screenshots/11-today-expanded.png' });

  // Select an enabled weekday (Wednesday, Aug 12)
  const day12 = page.getByRole('button', { name: /Wednesday, August 12/ });
  if (await day12.isVisible()) {
    await day12.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: './screenshots/12-today-recollapsed-after-select.png' });
  }

  await browser.close();
}

capture().catch(console.error);
