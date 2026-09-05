import { chromium } from 'playwright';

async function testOnboarding() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:3000/onboarding');
  await page.waitForTimeout(1000);
  
  // Fill step 1
  await page.fill('input[placeholder="e.g. Sam Taylor"]', 'Alex Morgan');
  await page.fill('input[placeholder="e.g. Northbridge University"]', 'Stanford University');
  await page.click('text=Continue');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: './screenshots/08-onboarding-step2.png' });
  
  // Add a subject
  await page.fill('input[placeholder="e.g. Data Structures"]', 'Algorithms');
  await page.fill('input[placeholder="e.g. CS201"]', 'CS161');
  await page.click('text=Add subject');
  await page.waitForTimeout(500);

  await page.screenshot({ path: './screenshots/09-onboarding-with-subject.png' });

  await browser.close();
}

testOnboarding().catch(console.error);
