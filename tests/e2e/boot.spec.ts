import { expect, test } from '@playwright/test';
import { canvasVariety, expectNoErrors, openGame, state, watchConsole } from './helpers';

test('the game boots, renders on the GPU and keeps drawing frames', async ({ page }) => {
  const watch = watchConsole(page);
  await openGame(page);
  const first = await state(page);
  expect(first.phase).toBe('menu');
  expect(String(first.renderer)).not.toContain('SwiftShader');
  await page.waitForTimeout(1000);
  const later = await state(page);
  expect(later.frames).toBeGreaterThan(first.frames + 20);
  expect(await canvasVariety(page)).toBeGreaterThan(0.05);
  await page.screenshot({ path: 'evidence/boot.png' });
  expectNoErrors(watch);
});
