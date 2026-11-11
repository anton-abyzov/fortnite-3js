// Film a scripted tour of the game, headless, into evidence/<out>.mp4.
// The game is stepped by hand (two fixed steps per filmed frame), so the film is smooth whatever the
// machine is doing, and keys are real key events on a timeline.
// Usage: node tools/film.mjs [--out preview] [--size 1280x720] [--fps 30] [--only scene,scene]
// The dev server must be running (npm run dev), and ffmpeg must be on the PATH.
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const out = opt('out', 'preview');
const [W, H] = opt('size', '1280x720').split('x').map(Number);
const fps = Number(opt('fps', '30'));
const only = opt('only', '');
const port = process.env.EYEWALL_PORT ?? 5183;
const frameDir = `.temp/film/${out}`;
const EAST = -Math.PI / 2;

/**
 * A scene is either a camera move (`path`: from and to, each [x, y, z, tx, ty, tz]) or the player on
 * foot (`at`: [x, z, yaw]). `keys` are [code, down, up] in seconds, `turn` is the view's yaw added
 * over the scene as [time, radians] points, `chase` parks the camera at an offset from the player.
 */
const SCENES = [
  { name: 'title', title: true, seconds: 2.6 },
  {
    name: 'aerial',
    caption: 'Marazul Bay',
    seconds: 4.6,
    hour: 16.8,
    path: [
      [760, 210, 520, 60, 0, -20],
      [470, 120, 330, 40, 10, -40],
    ],
  },
  {
    name: 'canal',
    caption: 'Canals through Deco Row',
    seconds: 4,
    hour: 16.8,
    path: [
      [-150, 2.6, -155, -5, 3.5, -155],
      [-70, 3.4, -155, -5, 3.5, -155],
    ],
  },
  {
    name: 'street',
    caption: 'Walk, jog, sprint, jump',
    seconds: 10,
    hour: 16.5,
    at: [-150, 6.4, EAST],
    keys: [
      ['AltLeft', 0, 2.6],
      ['KeyW', 0.3, 10],
      ['ShiftLeft', 5.4, 10],
      ['Space', 7.6, 7.75],
    ],
    turn: [
      [0, 0],
      [2.6, 0],
      [4.2, 0.22],
      [5.6, -0.16],
      [7, 0],
      [10, 0],
    ],
  },
  {
    name: 'strafe',
    caption: 'Legs follow the ground, torso follows the aim',
    seconds: 5,
    hour: 16.5,
    at: [-70, 12.2, EAST],
    chase: [3.4, 0.5, 1.6],
    keys: [
      ['KeyA', 0.3, 2.4],
      ['KeyD', 2.6, 4.8],
    ],
  },
  {
    name: 'bridge',
    caption: 'Gran Via bridge',
    seconds: 7,
    hour: 17.4,
    at: [-5, -122, 0],
    keys: [['KeyW', 0.2, 7]],
    turn: [
      [0, 0],
      [2.5, 0],
      [4.2, 0.5],
      [5.6, 0.5],
      [7, 0],
    ],
  },
  {
    name: 'beach',
    caption: 'Into the ocean: wade, then swim',
    seconds: 10,
    hour: 15.5,
    at: [380, 135, EAST],
    keys: [
      ['KeyW', 0.2, 10],
      ['ShiftLeft', 0.2, 10],
    ],
  },
  {
    name: 'dusk',
    caption: 'Dusk over the canal',
    seconds: 3.4,
    hour: 19.4,
    path: [
      [-96, 6, -155, -5, 4, -155],
      [-84, 5.2, -155, -5, 4, -155],
    ],
  },
  {
    name: 'promenade',
    caption: 'Ocean Parade after dark',
    seconds: 3.2,
    hour: 21.5,
    path: [
      [344, 5, -52, 300, 8, -200],
      [338, 5, -68, 300, 8, -200],
    ],
  },
  {
    name: 'skyline',
    caption: 'Marazul Bay at night',
    seconds: 3.6,
    hour: 21.5,
    path: [
      [-60, 64, 176, -60, 10, -40],
      [-60, 52, 128, -60, 10, -60],
    ],
  },
].filter((s) => !only || only.split(',').includes(s.name));

rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });
mkdirSync('evidence', { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--mute-audio'],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 90_000 });
await page.waitForTimeout(700);

let frame = 0;
const grab = async () => {
  const file = `${frameDir}/f-${String(frame++).padStart(5, '0')}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
};

// The caption is part of the film, not of the game.
await page.evaluate(() => {
  const cap = document.createElement('div');
  cap.id = 'film-caption';
  cap.style.cssText =
    'position:fixed;left:36px;bottom:32px;padding:9px 16px;border-radius:10px;background:rgba(11,29,42,.66);' +
    'border:1px solid rgba(244,251,250,.16);font:600 20px/1.2 "Segoe UI",system-ui,sans-serif;letter-spacing:.04em;' +
    'color:#f4fbfa;z-index:40;display:none';
  document.body.append(cap);
});

const t0 = Date.now();
let titleGone = false;
for (const scene of SCENES) {
  const frames = Math.round(scene.seconds * fps);
  if (scene.title) {
    for (let i = 0; i < frames; i++) await grab();
    continue;
  }
  await page.evaluate(
    ([s]) => {
      const api = window.__eyewall;
      const game = api.game;
      game.engine.stop();
      game.input.freeLook = true;
      api.setHour(s.hour ?? 16.5);
      const cap = document.getElementById('film-caption');
      cap.textContent = s.caption ?? '';
      cap.style.display = s.caption ? 'block' : 'none';
      api.chase();
      if (s.at) {
        api.startAt(s.at[0], s.at[1], s.at[2]);
        if (s.chase) api.chase(s.chase[0], s.chase[1], s.chase[2]);
        // Settle on the ground before the first frame.
        for (let i = 0; i < 20; i++) game.engine.step(1 / 60);
      } else {
        api.view(...s.path[0]);
        for (let i = 0; i < 4; i++) game.engine.step(1 / 60);
      }
    },
    [scene],
  );
  // Let the title screen finish fading out.
  if (!titleGone) await page.waitForTimeout(900);
  titleGone = true;
  const down = new Set();
  const up = new Set();
  for (let i = 0; i < frames; i++) {
    const t = i / fps;
    for (const k of scene.keys ?? []) {
      if (t >= k[1] && !down.has(k)) {
        down.add(k);
        await page.keyboard.down(k[0]);
      }
      if (t >= k[2] && !up.has(k)) {
        up.add(k);
        await page.keyboard.up(k[0]);
      }
    }
    await page.evaluate(
      ([s, t, dt]) => {
        const api = window.__eyewall;
        const game = api.game;
        const ease = (u) => u * u * (3 - 2 * u);
        if (s.path) {
          const u = ease(Math.min(1, t / s.seconds));
          const [a, b] = s.path;
          api.view(...a.map((v, i) => v + (b[i] - v) * u));
        } else if (s.turn) {
          // Turn the view the way the mouse would.
          let yaw = 0;
          for (let i = 0; i < s.turn.length - 1; i++) {
            const [t0, y0] = s.turn[i];
            const [t1, y1] = s.turn[i + 1];
            if (t >= t0 && t <= t1) yaw = y0 + (y1 - y0) * ease((t - t0) / Math.max(1e-6, t1 - t0));
          }
          if (t > s.turn[s.turn.length - 1][0]) yaw = s.turn[s.turn.length - 1][1];
          game.camera.yaw = s.at[2] + yaw;
        }
        game.engine.step(dt);
      },
      [scene, t, 1 / fps],
    );
    await grab();
  }
  for (const k of scene.keys ?? []) await page.keyboard.up(k[0]);
  const p = scene.at ? await page.evaluate(() => window.__eyewall.player()) : null;
  console.log(`${scene.name}: ${frames} frames${p ? ` end x=${p.x.toFixed(1)} y=${p.y.toFixed(2)} z=${p.z.toFixed(1)} mode=${p.mode} swimming=${p.swimming}` : ''}`);
}
await browser.close();
console.log(`${frame} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (errors.length) console.log(`errors:\n${[...new Set(errors)].slice(0, 10).join('\n')}`);

const target = `evidence/${out}.mp4`;
const ff = spawnSync(
  'ffmpeg',
  ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${frameDir}/f-%05d.jpg`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', target],
  { stdio: 'inherit' },
);
if (ff.status !== 0) {
  console.log('ffmpeg failed');
  process.exit(1);
}
writeFileSync(`${frameDir}/scenes.json`, JSON.stringify(SCENES.map((s) => ({ name: s.name, seconds: s.seconds })), null, 1));
console.log(`wrote ${target}`);
