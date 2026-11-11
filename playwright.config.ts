import { defineConfig } from '@playwright/test';

// Headless Chromium on the machine's real GPU through ANGLE/Vulkan.
// Set EYEWALL_SWIFTSHADER=1 to force the software renderer (slow, for machines without a GPU).
const gpuArgs = process.env.EYEWALL_SWIFTSHADER
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu'];

const PORT = Number(process.env.EYEWALL_PORT ?? 5183);

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    headless: true,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: [...gpuArgs, '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
    },
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
  },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
