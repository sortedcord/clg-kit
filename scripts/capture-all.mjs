import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT_DIR = './screenshots';
mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  // Update profile
  await fetch('http://localhost:4000/api/v1/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sam Taylor',
      college: 'Northbridge University',
      programme: 'B.Tech Computer Science',
      semester: 'Semester 3',
    }),
  });

  // Get subjects or create if not present
  let subjects = await fetch('http://localhost:4000/api/v1/subjects').then(r => r.json());
  if (!subjects.length) {
    await fetch('http://localhost:4000/api/v1/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Data Structures & Algorithms',
        code: 'CS201',
        shortName: 'DSA',
        classType: 'Theory',
        defaultRoom: 'Hall 101',
        color: '#0559FA',
      }),
    });
    await fetch('http://localhost:4000/api/v1/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Database Management Systems',
        code: 'CS202',
        shortName: 'DBMS',
        classType: 'Lab',
        defaultRoom: 'Lab 3',
        color: '#9B4BA4',
      }),
    });
    subjects = await fetch('http://localhost:4000/api/v1/subjects').then(r => r.json());
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Add one-off class for today
  await fetch('http://localhost:4000/api/v1/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subjectId: subjects[0].id,
      date: dateStr,
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 101',
    }),
  }).catch(() => {});

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  console.log('Capturing Today...');
  await page.goto('http://127.0.0.1:3000/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/01-today.png` });

  console.log('Capturing Timetable...');
  await page.goto('http://127.0.0.1:3000/timetable');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/02-timetable.png` });

  console.log('Capturing Attendance...');
  await page.goto('http://127.0.0.1:3000/attendance');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/03-attendance.png` });

  console.log('Capturing Settings...');
  await page.goto('http://127.0.0.1:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/04-settings.png` });

  console.log('Capturing Account...');
  await page.goto('http://127.0.0.1:3000/account');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/05-account.png` });

  console.log('Capturing Subject Details...');
  await page.goto(`http://127.0.0.1:3000/subjects/${subjects[0].id}`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/06-subject-details.png` });

  console.log('Capturing Onboarding...');
  await page.goto('http://127.0.0.1:3000/onboarding');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/07-onboarding.png` });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
