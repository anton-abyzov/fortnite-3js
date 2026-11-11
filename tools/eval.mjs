// Evaluate a JS expression in the running game (headless) and print the JSON result.
// Usage: node tools/eval.mjs "<expression using api (window.__eyewall) and game>" [--query "a=b"] [--wait ms]
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const query = opt('query', '');
const wait = Number(opt('wait', '300'));
const shot = opt('shot', '');
const port = process.env.EYEWALL_PORT ?? 5183;
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e}`));
await page.goto(`http://127.0.0.1:${port}/?${query}`);
try {
  await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 90_000 });
  await page.waitForTimeout(wait);
  for (const expr of args) {
    const result = await page.evaluate(async (src) => {
      const api = window.__eyewall;
      const game = api.game;
      const fn = new Function('api', 'game', `return (async () => (${src}))()`);
      return await fn(api, game);
    }, expr);
    console.log(JSON.stringify(result, null, 1));
  }
  if (shot) await page.screenshot({ path: shot });
} catch (e) {
  console.log('ERR', String(e).slice(0, 600));
}
if (logs.length) console.log(`console:\n${[...new Set(logs)].slice(0, 20).join('\n')}`);
await browser.close();
