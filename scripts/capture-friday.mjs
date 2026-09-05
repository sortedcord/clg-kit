import { chromium } from 'playwright';

async function captureFriday() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(2000);
  // Click on the Friday date card (date number 4)
  const fridayCell = page.locator('text=fri').locator('..');
  if (await fridayCell.isVisible()) {
    await fridayCell.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: './screenshots/01-today-friday.png' });
  await browser.close();
}

captureFriday().catch(console.error);
