import { expect, test } from '@playwright/test';
import { canvasVariety, expectNoErrors, openGame, state, watchConsole } from './helpers';

test('the game boots to the title, Play starts the match aboard the seaplane, and the scene renders on the GPU', async ({ page }) => {
  const watch = watchConsole(page);
  await openGame(page);
  const first = await state(page);
  expect(first.phase).toBe('menu');
  if (!process.env.EYEWALL_SWIFTSHADER) expect(String(first.renderer)).not.toContain('SwiftShader');
  await expect(page.locator('.title')).toBeVisible();
  await expect(page.locator('.title-name')).toHaveText('EYEWALL');
  await page.screenshot({ path: 'evidence/boot-title.png' });

  await page.locator('#play').click();
  await expect.poll(async () => (await state(page)).phase).toBe('match');
  await expect(page.locator('.title')).toHaveClass(/hidden/);
  const started = await state(page);
  await expect.poll(async () => (await state(page)).frames, { timeout: 60_000 }).toBeGreaterThan(started.frames + 20);
  // The title has faded: what is on screen now is the city itself.
  await page.waitForTimeout(600);
  expect(await canvasVariety(page)).toBeGreaterThan(0.05);
  // A match opens aboard the seaplane, high over the bay.
  const player = await page.evaluate(() => window.__eyewall!.player());
  expect(player?.state).toBe('plane');
  expect(player?.altitude).toBeGreaterThan(300);
  await page.screenshot({ path: 'evidence/boot.png' });
  expectNoErrors(watch);
});
