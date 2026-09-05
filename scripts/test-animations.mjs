import { chromium } from 'playwright';

async function verifyAnimations() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();

  console.log('Verifying Today screen animations...');
  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './screenshots/22-animated-today.png' });

  console.log('Testing pull-down / click to morph into calendar widget...');
  const expandHandle = page.getByRole('button', { name: 'Expand calendar' });
  await expandHandle.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: './screenshots/23-animated-morph-calendar.png' });

  console.log('Clicking to collapse back...');
  const collapseHandle = page.getByRole('button', { name: 'Collapse calendar' });
  await collapseHandle.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: './screenshots/24-animated-collapsed-daypicker.png' });

  await browser.close();
  console.log('Verification completed successfully.');
}

verifyAnimations().catch(console.error);
