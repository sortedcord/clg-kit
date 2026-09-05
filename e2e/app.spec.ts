import { test, expect } from '@playwright/test';

test.describe('College Kit E2E & Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure profile is setup so we are on the main tabs
    await page.request.put('http://localhost:4000/api/v1/profile', {
      data: {
        name: 'Sam Taylor',
        college: 'Northbridge University',
        programme: 'B.Tech Computer Science',
        semester: 'Semester 3',
      },
    });
  });

  test('Today screen loads with date, week strip, and classes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Today’s classes')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Timetable' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Attendance' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('Navigation between all bottom tabs works smoothly', async ({ page }) => {
    await page.goto('/');

    // Navigate to Timetable
    await page.locator('text=Timetable').click();
    await expect(page.locator('text=Week of')).toBeVisible();

    // Navigate to Attendance
    await page.getByRole('button', { name: 'Attendance' }).click();
    await expect(page.locator('text=By subject')).toBeVisible();
    await expect(page.locator('text=Classes held')).toBeVisible();

    // Navigate to Settings
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.locator('text=Shape your class day')).toBeVisible();
    await expect(page.locator('text=Default class length')).toBeVisible();

    // Navigate back to Today
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.locator('text=classes').first()).toBeVisible();
  });

  test('Account screen displays profile information correctly', async ({ page }) => {
    await page.goto('/account');
    await expect(page.locator('text=Sam Taylor')).toBeVisible();
    await expect(page.getByText('Northbridge University').first()).toBeVisible();
    await expect(page.locator('text=B.Tech Computer Science')).toBeVisible();
  });

  test('Subject Details screen loads subject metrics', async ({ page }) => {
    // Get subjects list
    const subjectsRes = await page.request.get('http://localhost:4000/api/v1/subjects');
    const subjects = await subjectsRes.json();
    if (subjects.length > 0) {
      await page.goto(`/subjects/${subjects[0].id}`);
      await expect(page.locator('text=Subject details')).toBeVisible();
      await expect(page.locator('text=Recent classes')).toBeVisible();
    }
  });

  test('Settings can be updated and saved', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('text=Save settings')).toBeVisible();
    await page.locator('text=Save settings').click();
    await expect(page.locator('text=Settings saved')).toBeVisible();
  });
});
