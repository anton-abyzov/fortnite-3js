// Film the player: hold keys on a timeline, grab frames, and tile them into one contact sheet.
// Usage: node tools/seq.mjs --at x,z,yaw --chase dx,dy,dz --keys "KeyW:0-2000,ShiftLeft:600-2000" [--mouse "t:dx,dy;..."]
//        [--frames 8] [--every 150] [--start 0] [--out name] [--hour 16.5] [--eval "js run before filming"]
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const at = opt('at', '-60,13,0');
const chase = opt('chase', '-3.2,0.6,0').split(',').map(Number);
const keys = opt('keys', '')
  .split(',')
  .filter(Boolean)
  .map((k) => {
    const [code, range] = k.split(':');
    const [a, b] = range.split('-').map(Number);
    return { code, a, b };
  });
const mouse = opt('mouse', '')
  .split(';')
  .filter(Boolean)
  .map((m) => {
    const [t, d] = m.split(':');
    const [dx, dy] = d.split(',').map(Number);
    return { t: Number(t), dx, dy };
  });
const frames = Number(opt('frames', '8'));
const every = Number(opt('every', '150'));
const start = Number(opt('start', '0'));
const out = opt('out', 'seq');
const hour = opt('hour', '');
const pre = opt('eval', '');
const cols = Number(opt('cols', '4'));
const port = process.env.EYEWALL_PORT ?? 5183;
mkdirSync('evidence', { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/?at=${at}&freelook=1`);
await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 90_000 });
await page.evaluate(
  ([c, h, pre]) => {
    const api = window.__eyewall;
    if (h) api.setHour(Number(h));
    if (c.length === 3 && !Number.isNaN(c[0])) api.chase(c[0], c[1], c[2]);
    if (pre) new Function('api', 'game', pre)(api, api.game);
  },
  [chase, hour, pre],
);
await page.mouse.move(480, 270);
await page.waitForTimeout(150);
// The first mouse move turned the view; put it back.
await page.evaluate((at) => {
  const [x, z, yaw] = at.split(',').map(Number);
  window.__eyewall.startAt(x, z, yaw ?? 0);
}, at);
await page.waitForTimeout(600);

const shots = [];
const t0 = Date.now();
const downAt = new Set();
const upAt = new Set();
let mi = 0;
let next = start;
const end = start + frames * every;
const stats = [];
while (true) {
  const t = Date.now() - t0;
  for (const k of keys) {
    if (t >= k.a && !downAt.has(k)) {
      downAt.add(k);
      if (k.code.startsWith('Mouse')) await page.mouse.down({ button: k.code === 'Mouse2' ? 'right' : 'left' });
      else await page.keyboard.down(k.code);
    }
    if (t >= k.b && !upAt.has(k)) {
      upAt.add(k);
      if (k.code.startsWith('Mouse')) await page.mouse.up({ button: k.code === 'Mouse2' ? 'right' : 'left' });
      else await page.keyboard.up(k.code);
    }
  }
  while (mi < mouse.length && t >= mouse[mi].t) {
    await page.mouse.move(480 + mouse[mi].dx, 270 + mouse[mi].dy, { steps: 6 });
    mi++;
  }
  if (t >= next && shots.length < frames) {
    shots.push(await page.screenshot());
    const p = await page.evaluate(() => window.__eyewall.player());
    stats.push(`${String(t).padStart(5)}ms mode=${p.mode}/${p.anim.mode} speed=${p.speed.toFixed(2)} y=${p.y.toFixed(2)} facing=${p.facing.toFixed(2)} twist=${p.anim.twist.toFixed(2)} warp=${p.anim.legWarp.toFixed(2)} lean=${p.anim.leanRoll.toFixed(3)}/${p.anim.leanPitch.toFixed(3)} footErr=${p.anim.footError.toFixed(3)} slide=${(p.anim.travel > 0.5 ? p.anim.slide / p.anim.travel : 0).toFixed(3)} rate=${p.anim.strideRate.toFixed(2)}`);
    next += every;
  }
  if (t > end + 50 && shots.length >= frames) break;
  await page.waitForTimeout(8);
}
const rows = Math.ceil(shots.length / cols);
const w = 480;
const h = 270;
const tiles = await Promise.all(shots.map((s) => sharp(s).resize(w, h).toBuffer()));
await sharp({ create: { width: cols * w, height: rows * h, channels: 3, background: '#000' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * w, top: Math.floor(i / cols) * h })))
  .png()
  .toFile(`evidence/${out}.png`);
console.log(stats.join('\n'));
if (errors.length) console.log(`errors:\n${[...new Set(errors)].slice(0, 10).join('\n')}`);
await browser.close();
