import { expect, type Page } from '@playwright/test';
import type { DebugApi } from '../../src/core/debug';

export type { DebugApi };

export interface ConsoleWatch {
  errors: string[];
}

/** Collect console errors and page errors so a test can assert the game ran clean. */
export function watchConsole(page: Page): ConsoleWatch {
  const watch: ConsoleWatch = { errors: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') watch.errors.push(msg.text());
  });
  page.on('pageerror', (err) => watch.errors.push(String(err)));
  return watch;
}

export async function openGame(page: Page, query = ''): Promise<void> {
  await page.goto(`/${query ? `?${query}` : ''}`);
  await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 120_000 });
}

export async function state(page: Page): Promise<Record<string, any>> {
  return page.evaluate(() => window.__eyewall!.state());
}

/** Fraction of sampled canvas pixels that differ from the first one. Zero means a blank frame. */
export async function canvasVariety(page: Page): Promise<number> {
  const shot = await page.locator('#game').screenshot();
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 90;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let diff = 0;
    for (let i = 4; i < d.length; i += 4) {
      if (Math.abs(d[i]! - d[0]!) + Math.abs(d[i + 1]! - d[1]!) + Math.abs(d[i + 2]! - d[2]!) > 24) diff++;
    }
    return diff / (d.length / 4);
  }, shot.toString('base64'));
}

export function expectNoErrors(watch: ConsoleWatch): void {
  expect(watch.errors, `console errors:\n${watch.errors.join('\n')}`).toEqual([]);
}
