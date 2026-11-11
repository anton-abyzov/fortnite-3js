// Headless screenshots of chosen camera views. The dev server must be running (npm run dev).
// Usage: node tools/shot.mjs name:x,y,z,tx,ty,tz[:hour] ...   [--query "a=b"] [--size 1280x720] [--wait ms]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const query = opt('query', '');
const [w, h] = opt('size', '1280x720').split('x').map(Number);
const wait = Number(opt('wait', '500'));
const port = process.env.EYEWALL_PORT ?? 5183;
mkdirSync('evidence', { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e}`));
const t0 = Date.now();
await page.goto(`http://127.0.0.1:${port}/?${query}`);
try {
  await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 90_000 });
} catch {
  console.log('NOT READY', errors.join('\n'));
  await page.screenshot({ path: 'evidence/not-ready.png' });
  await browser.close();
  process.exit(1);
}
console.log(`ready in ${Date.now() - t0} ms`);
for (const spec of args) {
  const [name, coords, hour] = spec.split(':');
  const v = coords.split(',').map(Number);
  await page.evaluate(
    ([v, hour]) => {
      const api = window.__eyewall;
      api.setHour(hour ?? 16.5);
      api.view(...v);
    },
    [v, hour === undefined ? null : Number(hour)],
  );
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `evidence/${name}.png` });
  const s = await page.evaluate(() => window.__eyewall.state());
  console.log(name, `fps=${Number(s.fps).toFixed(0)} calls=${s.drawCalls} tris=${s.triangles}`);
}
if (errors.length) console.log(`console (${errors.length}):\n${[...new Set(errors)].slice(0, 12).join('\n')}`);
await browser.close();
