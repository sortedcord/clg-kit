import { chromium } from 'playwright';

async function testDocker() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();

  console.log('Testing app via Docker at http://127.0.0.1:8080...');
  await page.goto('http://127.0.0.1:8080/');
  await page.waitForTimeout(2000);

  // Open add class modal
  const addBtn = page.getByRole('button', { name: 'Add a class' });
  await addBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './screenshots/docker-add-class-modal.png' });

  // Open course picker drawer
  const changeBtn = page.getByText('Change');
  if (await changeBtn.isVisible()) {
    await changeBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: './screenshots/docker-add-class-picker-open.png' });
  }

  await browser.close();
  console.log('Docker verification completed successfully.');
}

testDocker().catch(console.error);
