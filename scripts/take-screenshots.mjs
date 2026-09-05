import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT_DIR = './screenshots';
mkdirSync(OUT_DIR, { recursive: true });

async function capture() {
  const browser = await chromium.launch({ headless: true });
  
  // iPhone 14 dimensions & scale
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  console.log('Navigating to Today screen...');
  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/01-today.png`, fullPage: false });

  console.log('Navigating to Timetable...');
  const timetableTab = page.locator('text=Timetable');
  if (await timetableTab.isVisible()) {
    await timetableTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/02-timetable.png`, fullPage: false });
  }

  console.log('Navigating to Attendance...');
  const attendanceTab = page.locator('text=Attendance');
  if (await attendanceTab.isVisible()) {
    await attendanceTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/03-attendance.png`, fullPage: false });
  }

  console.log('Navigating to Settings...');
  const settingsTab = page.locator('text=Settings');
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/04-settings.png`, fullPage: false });
  }

  console.log('Navigating to Account...');
  await page.goto('http://127.0.0.1:3000/account');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/05-account.png`, fullPage: false });

  console.log('Navigating to Onboarding...');
  await page.goto('http://127.0.0.1:3000/onboarding');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/06-onboarding.png`, fullPage: false });

  await browser.close();
  console.log('All screenshots captured in', OUT_DIR);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
