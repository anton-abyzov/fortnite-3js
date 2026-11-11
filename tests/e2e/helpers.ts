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

/** `EYEWALL_WITHOUT=cars,boats` opens the game without those parts, for checking one part while another is in pieces. */
const WITHOUT = process.env['EYEWALL_WITHOUT'] ?? '';

export async function openGame(page: Page, query = ''): Promise<void> {
  const all = [query, WITHOUT ? `without=${WITHOUT}` : ''].filter(Boolean).join('&');
  await page.goto(`/${all ? `?${all}` : ''}`);
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

/** Mean brightness of the canvas, 0..255. */
export async function canvasLuma(page: Page): Promise<number> {
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
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += d[i]! * 0.2126 + d[i + 1]! * 0.7152 + d[i + 2]! * 0.0722;
    return sum / (d.length / 4);
  }, shot.toString('base64'));
}

/** Park the camera for a screenshot and let a few frames draw. */
export async function view(page: Page, pos: [number, number, number], target: [number, number, number], hour?: number): Promise<void> {
  await page.evaluate(
    ([p, t, h]) => {
      const api = window.__eyewall!;
      if (h !== null) api.setHour(h as number);
      const a = p as number[];
      const b = t as number[];
      api.view(a[0]!, a[1]!, a[2]!, b[0]!, b[1]!, b[2]!);
    },
    [pos, target, hour ?? null] as const,
  );
  await page.waitForTimeout(400);
}
