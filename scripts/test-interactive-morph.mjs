import { chromium } from 'playwright';

async function verifyInteractiveMorph() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('Navigating to Today...');
  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './screenshots/25-morph-initial-collapsed.png' });

  console.log('Testing click to expand...');
  const expandHandle = page.getByRole('button', { name: 'Expand calendar' });
  await expectVisible(expandHandle);
  await expandHandle.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: './screenshots/26-morph-dragged-expanded.png' });

  console.log('Testing click to collapse...');
  const collapseHandle = page.getByRole('button', { name: 'Collapse calendar' });
  await expectVisible(collapseHandle);
  await collapseHandle.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: './screenshots/27-morph-dragged-collapsed.png' });

  await browser.close();
  console.log('Done verifying interactive morph.');
}

async function expectVisible(locator) {
  const visible = await locator.isVisible();
  if (!visible) throw new Error('Locator not visible');
}

verifyInteractiveMorph().catch((err) => {
  console.error(err);
  process.exit(1);
});
