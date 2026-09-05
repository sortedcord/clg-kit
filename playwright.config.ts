import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'node backend/server.mjs',
      port: 4000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node scripts/serve-dist.mjs',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
