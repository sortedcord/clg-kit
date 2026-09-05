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
  await page.screenshot({ path: './screenshots/16-today-metrics-and-nav.png' });

  await page.getByRole('button', { name: 'Attendance' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: './screenshots/17-attendance-new-nav.png' });

  await browser.close();
}

capture().catch(console.error);
