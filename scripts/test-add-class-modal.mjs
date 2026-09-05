import { chromium } from 'playwright';

async function testModal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(2000);

  // Click Add a class button
  const addBtn = page.getByRole('button', { name: 'Add a class' });
  await addBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './screenshots/13-add-class-modal-default.png' });

  // Click Change subject button
  const changeBtn = page.getByText('Change');
  if (await changeBtn.isVisible()) {
    await changeBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: './screenshots/14-add-class-modal-picker-open.png' });

    // Type into search
    const searchInput = page.getByPlaceholder('Search courses by name or code...');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Data');
      await page.waitForTimeout(500);
      await page.screenshot({ path: './screenshots/15-add-class-modal-search.png' });
    }
  }

  await browser.close();
}

testModal().catch(console.error);
