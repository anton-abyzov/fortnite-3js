// Film the gameplay trailer, headless, into evidence/<out>.mp4.
// Like tools/film.mjs the game is stepped by hand, one filmed frame at a time, so the film is smooth
// whatever the machine is doing. Keys and the mouse button are real events on a timeline; the view is
// turned the way a mouse would turn it.
// Usage: node tools/trailer.mjs [--out trailer] [--size 1920x1080] [--fps 30] [--only scene,scene]
//        [--link play.example.com/eyewall] [--music evidence/music.wav]
// The dev server must be running (EYEWALL_PORT, default 5183), and ffmpeg must be on the PATH.
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const out = opt('out', 'trailer');
const [W, H] = opt('size', '1920x1080').split('x').map(Number);
const fps = Number(opt('fps', '30'));
const only = opt('only', '');
const link = opt('link', '');
const music = opt('music', '');
const port = process.env.EYEWALL_PORT ?? 5183;
const frameDir = `.temp/film/${out}`;
const tall = H > W;

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

let frame = 0;
const grab = async () => {
  await page.screenshot({ path: `${frameDir}/f-${String(frame++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
};
/** Run the game forward without filming. */
const skip = (seconds) => page.evaluate((s) => window.__eyewall.fastForward(s), seconds);
const player = () => page.evaluate(() => window.__eyewall.player());

/**
 * A scene: `prepare` sets the stage (not filmed), `keys` are [code, down, up] in seconds, `fire` is
 * [down, up] for the trigger, `tick` runs in the page before each filmed frame with (t, dt), and
 * `until` ends the scene early once it is true (checked every few frames).
 */
const SCENES = [
  { name: 'title', seconds: 2.4, still: true },
  {
    name: 'aerial',
    caption: 'Marazul Bay',
    seconds: 3.4,
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        api.setHour(17.3);
        api.view(760, 210, 520, 60, 0, -20);
        window.__film = { from: [760, 210, 520, 60, 0, -20], to: [520, 130, 360, 40, 10, -40], len: 3.4 };
      }),
    tick: (t) => {
      const f = window.__film;
      const u = Math.min(1, t / f.len);
      const e = u * u * (3 - 2 * u);
      window.__eyewall.view(...f.from.map((v, i) => v + (f.to[i] - v) * e));
    },
  },
  {
    name: 'aboard',
    caption: '24 drop in',
    seconds: 1.8,
    prepare: async () => {
      await page.evaluate(() => {
        const api = window.__eyewall;
        api.setHour(16.6);
        api.startMatch();
      });
      // Ride until the doors are open and the city is underneath.
      for (let i = 0; i < 200; i++) {
        await skip(0.25);
        const ok = await page.evaluate(() => {
          const api = window.__eyewall;
          const p = api.player();
          return api.drop().doorOpen && Math.abs(p.x) < 260 && Math.abs(p.z) < 300;
        });
        if (ok) break;
      }
    },
  },
  {
    name: 'freefall',
    caption: 'Dive for the rooftops',
    seconds: 3.6,
    keys: [
      ['Space', 0, 0.12],
      ['KeyW', 0.5, 3.6],
    ],
  },
  {
    name: 'canopy',
    caption: 'Pull the cord',
    seconds: 3.2,
    keys: [['Space', 0, 0.12]],
    // Start the shot a little lower, so the city fills the frame under the canopy.
    prepare: async () => {
      for (let i = 0; i < 40; i++) {
        const p = await player();
        if (p.state !== 'freefall' || p.altitude < 150) break;
        await skip(0.2);
      }
    },
  },
  {
    name: 'landing',
    caption: 'Hit the ground running',
    seconds: 4.5,
    keys: [['KeyW', 0, 4.5]],
    prepare: async () => {
      for (let i = 0; i < 200; i++) {
        const p = await player();
        if (p.state !== 'chute' || p.altitude < 16) break;
        await skip(0.2);
      }
    },
    until: () => {
      const f = (window.__film ??= {});
      const p = window.__eyewall.player();
      if (p.state === 'normal') f.down = (f.down ?? 0) + 1;
      return (f.down ?? 0) > 5;
    },
  },
  {
    name: 'loot',
    caption: 'Loot up',
    seconds: 4.2,
    keys: [
      ['KeyW', 0.1, 0.7],
      ['KeyE', 0.9, 1.0],
      ['KeyE', 1.9, 2.0],
      ['KeyE', 2.5, 2.6],
      ['KeyE', 3.1, 3.2],
      ['KeyE', 3.7, 3.8],
    ],
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.match.stop();
        api.setHour(16.8);
        // A box on the street near the middle of town, with room in front of it.
        let best = null;
        let bestD = Infinity;
        for (const c of api.loot().containers) {
          if (c.roof || c.opened || c.kind === 'ammo') continue;
          if (api.nav(c.x, c.z + 2.8).kind === 'blocked' || api.nav(c.x, c.z + 2.8).kind === 'water') continue;
          const d = Math.hypot(c.x + 60, c.z - 13);
          if (d < bestD) {
            bestD = d;
            best = c;
          }
        }
        api.startAt(best.x, best.z + 2.8, 0);
        for (let i = 0; i < 20; i++) game.engine.step(1 / 60);
      }),
  },
  {
    name: 'fight',
    caption: 'Outgun 23 rivals',
    seconds: 7.5,
    keys: [
      ['Digit3', 0.05, 0.15],
      ['KeyA', 1.4, 2.6],
      ['KeyD', 3.2, 4.6],
      ['KeyA', 5.4, 6.4],
    ],
    fire: [0.9, 7.4],
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.match.stop();
        api.setHour(17.4);
        api.startAt(-60, 13, -Math.PI / 2);
        api.give('rifle', 1, 2);
        api.give('ammo_medium', 180);
        api.give('vest', 1);
        const me = game.player;
        me.armor = 100;
        const kit = [
          ['smg', 1],
          ['ammo_light', 120],
          ['bandage', 2],
        ];
        // Down the street to the east, in the open.
        api.deployBots(4, me.position.x + 30, me.position.z, 9, kit);
        for (let i = 0; i < 20; i++) game.engine.step(1 / 60);
        window.__film = { yaw: game.camera.yaw, pitch: game.camera.pitch };
      }),
    tick: (t, dt) => {
      const game = window.__eyewall.game;
      const me = game.player;
      // The film is about the fight, not about losing it.
      me.health = Math.max(me.health, 62);
      let best = null;
      let bestD = Infinity;
      for (const b of game.bots.list) {
        if (!b.c.alive || b.c.state !== 'normal') continue;
        const d = b.c.position.distanceTo(me.position);
        if (d < bestD) {
          bestD = d;
          best = b.c;
        }
      }
      if (!best) return;
      const cam = game.engine.camera.position;
      const dx = best.position.x - cam.x;
      const dy = best.position.y + 1.25 - cam.y;
      const dz = best.position.z - cam.z;
      const yaw = Math.atan2(-dx, -dz);
      const pitch = Math.atan2(dy, Math.hypot(dx, dz));
      const f = window.__film;
      // A hand on a mouse: quick, not instant.
      const k = 1 - Math.exp(-dt * 9);
      let off = yaw - f.yaw;
      off = Math.atan2(Math.sin(off), Math.cos(off));
      f.yaw += off * k;
      f.pitch += (pitch - f.pitch) * k;
      game.camera.yaw = f.yaw;
      game.camera.pitch = f.pitch;
    },
  },
  {
    name: 'drive',
    caption: 'Take the wheel',
    seconds: 7.5,
    keys: [
      ['KeyW', 0.2, 5.0],
      ['KeyD', 4.4, 6.2],
      ['Space', 4.7, 6.0],
      ['KeyW', 5.6, 7.5],
      ['KeyA', 6.5, 7.2],
    ],
    prepare: async () => {
      await page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.match.stop();
        game.bots.parkAll();
        api.setHour(18.4);
        // The sports car on the port apron: a long run of open concrete ahead of it.
        const car = api.ext.cars.nearestParked(-294, 335, 'sedan-sports');
        api.startAt(car.x, car.z - 2.4, Math.PI);
        for (let i = 0; i < 30; i++) game.engine.step(1 / 60);
        window.__film = {};
      });
      for (let i = 0; i < 40; i++) {
        const p = await player();
        if (p.vehicle) break;
        if (String(p.prompt).startsWith('Drive')) await page.evaluate(() => window.__eyewall.interact());
        else {
          await page.keyboard.down('KeyW');
          await skip(0.1);
          await page.keyboard.up('KeyW');
        }
        await skip(0.1);
      }
      await skip(0.6);
    },
  },
  {
    name: 'shop',
    caption: 'Every shop is open',
    seconds: 4.4,
    keys: [
      ['KeyW', 0.2, 2.2],
      ['KeyE', 2.6, 2.7],
    ],
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        api.setHour(15.5);
        const shops = api.ext.shops.list();
        const pick = shops.find((s) => s.kind === 'gun') ?? shops.find((s) => s.kind === 'market') ?? shops[0];
        api.ext.shops.enter(pick.id);
        for (let i = 0; i < 30; i++) game.engine.step(1 / 60);
      }),
  },
  {
    name: 'storm',
    caption: 'The eye is closing',
    seconds: 4.2,
    keys: [
      ['KeyW', 0.4, 4.2],
      ['ShiftLeft', 0.4, 4.2],
    ],
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        api.setHour(17.8);
        // Running west down the street with the wall coming up behind: look back at it.
        api.startAt(-20, 13, -Math.PI / 2);
        const z = game.zone;
        z.begin(7);
        z.stage = 'hold';
        z.left = 99;
        z.x = z.nextX = -330;
        z.z = z.nextZ = 13;
        z.radius = 296;
        z.nextRadius = 200;
        window.__film = { r: 296 };
        for (let i = 0; i < 20; i++) game.engine.step(1 / 60);
        game.camera.yaw = Math.PI / 2 + 0.5;
      }),
    tick: (t, dt) => {
      const game = window.__eyewall.game;
      const f = window.__film;
      const z = game.zone;
      // The wall comes on at a jog.
      f.r -= dt * 5.2;
      z.stage = 'hold';
      z.left = 99;
      z.radius = f.r;
      // The view swings from over the shoulder at the wall to the way ahead.
      const u = Math.min(1, Math.max(0, (t - 1.6) / 1.6));
      const e = u * u * (3 - 2 * u);
      game.camera.yaw = Math.PI / 2 + 0.5 + (-Math.PI / 2 - (Math.PI / 2 + 0.5) + Math.PI * 2) * e;
    },
  },
  {
    name: 'end',
    end: true,
    seconds: 3.8,
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.zone.clear();
        api.setHour(21.4);
        api.view(-60, 64, 176, -60, 10, -40);
        window.__film = { from: [-60, 64, 176, -60, 10, -40], to: [-60, 50, 120, -60, 10, -60], len: 3.8 };
      }),
    tick: (t) => {
      const f = window.__film;
      const u = Math.min(1, t / f.len);
      const e = u * u * (3 - 2 * u);
      window.__eyewall.view(...f.from.map((v, i) => v + (f.to[i] - v) * e));
    },
  },
].filter((s) => !only || only.split(',').includes(s.name));

rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });
mkdirSync('evidence', { recursive: true });

await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 120_000 });
await page.waitForTimeout(900);

// Captions and the end card are part of the film, not of the game.
await page.evaluate(
  ([tall, link]) => {
    const style = document.createElement('style');
    style.textContent = `
      #film-caption { position: fixed; left: 50%; top: ${tall ? '16%' : '11%'}; transform: translateX(-50%); z-index: 60;
        font: 800 ${tall ? '5.4vw' : '3.1vw'}/1.05 "Lato", "Segoe UI", system-ui, sans-serif; letter-spacing: .06em; text-transform: uppercase;
        color: #fff; text-shadow: 0 .12em .5em rgba(0,0,0,.75), 0 0 .08em rgba(0,0,0,.9); white-space: nowrap; display: none; }
      #film-caption::after { content: ''; display: block; height: .1em; margin: .22em auto 0; width: 2.2em; border-radius: 1em; background: #ffb45e; }
      #film-end { position: fixed; inset: 0; z-index: 61; display: none; flex-direction: column; align-items: center; justify-content: center;
        background: radial-gradient(ellipse at center, rgba(6,16,24,.35), rgba(6,16,24,.82)); color: #fff; text-align: center;
        font-family: "Lato", "Segoe UI", system-ui, sans-serif; }
      #film-end .name { font-weight: 900; font-size: ${tall ? '15vw' : '9vw'}; letter-spacing: .04em; line-height: 1; text-shadow: 0 .06em .4em rgba(0,0,0,.6); }
      #film-end .place { font-weight: 800; font-size: ${tall ? '5vw' : '2.6vw'}; letter-spacing: .3em; color: #ffd9a0; margin-top: .5em; }
      #film-end .pitch { font-weight: 700; font-size: ${tall ? '4.4vw' : '2.1vw'}; margin-top: 1.6em; }
      #film-end .link { font-weight: 800; font-size: ${tall ? '4vw' : '1.9vw'}; margin-top: .7em; padding: .45em 1em; border-radius: 99em; background: #ffb45e; color: #0b1d2a; }
    `;
    document.head.append(style);
    const cap = document.createElement('div');
    cap.id = 'film-caption';
    const end = document.createElement('div');
    end.id = 'film-end';
    end.innerHTML = `<div class="name">EYEWALL</div><div class="place">MARAZUL BAY</div><div class="pitch">Play free in your browser</div>${link ? `<div class="link">${link}</div>` : ''}`;
    document.body.append(cap, end);
  },
  [tall, link],
);

const t0 = Date.now();
let started = false;
for (const scene of SCENES) {
  const frames = Math.round(scene.seconds * fps);
  if (scene.still) {
    for (let i = 0; i < frames; i++) await grab();
    console.log(`${scene.name}: ${frames} frames`);
    continue;
  }
  await page.evaluate(
    ([caption, end]) => {
      const game = window.__eyewall.game;
      game.engine.stop();
      game.input.freeLook = true;
      window.__eyewall.chase();
      const cap = document.getElementById('film-caption');
      cap.textContent = caption ?? '';
      cap.style.display = caption ? 'block' : 'none';
      document.getElementById('film-end').style.display = end ? 'flex' : 'none';
      // The end card stands alone: no health bars under it.
      document.getElementById('ui').style.visibility = end ? 'hidden' : '';
    },
    [scene.caption ?? '', scene.end === true],
  );
  if (scene.prepare) await scene.prepare();
  // Let the title screen finish fading out before the first moving shot.
  if (!started) await page.waitForTimeout(900);
  started = true;
  const down = new Set();
  const up = new Set();
  let firing = false;
  let shot = 0;
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
    if (scene.fire) {
      const want = t >= scene.fire[0] && t < scene.fire[1];
      if (want && !firing) {
        await page.mouse.move(W / 2, H / 2);
        await page.mouse.down();
      }
      if (!want && firing) await page.mouse.up();
      firing = want;
    }
    if (scene.tick) await page.evaluate(([fn, t, dt]) => new Function(`return (${fn})`)()(t, dt), [scene.tick.toString(), t, 1 / fps]);
    await page.evaluate((dt) => window.__eyewall.game.engine.step(dt), 1 / fps);
    await grab();
    shot++;
    if (scene.until && i % 3 === 2 && (await page.evaluate((fn) => new Function(`return (${fn})`)()(), scene.until.toString()))) break;
  }
  if (firing) await page.mouse.up();
  for (const k of scene.keys ?? []) await page.keyboard.up(k[0]);
  const p = await player();
  console.log(`${scene.name}: ${shot} frames${p ? ` | player ${p.state} x=${p.x.toFixed(0)} y=${p.y.toFixed(1)} z=${p.z.toFixed(0)} hp ${p.health?.toFixed?.(0)}` : ''}`);
}
await browser.close();
console.log(`${frame} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (errors.length) console.log(`errors:\n${[...new Set(errors)].slice(0, 10).join('\n')}`);

const target = `evidence/${out}.mp4`;
const input = ['-framerate', String(fps), '-i', `${frameDir}/f-%05d.jpg`];
const video = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
const withMusic = music && existsSync(music);
const length = frame / fps;
const ff = spawnSync(
  'ffmpeg',
  withMusic
    ? ['-y', '-loglevel', 'error', ...input, '-i', music, ...video, '-af', `afade=t=in:d=0.4,afade=t=out:st=${(length - 1.6).toFixed(2)}:d=1.6`, '-c:a', 'aac', '-b:a', '192k', '-shortest', target]
    : ['-y', '-loglevel', 'error', ...input, ...video, target],
  { stdio: 'inherit' },
);
if (ff.status !== 0) {
  console.log('ffmpeg failed');
  process.exit(1);
}
console.log(`wrote ${target} (${length.toFixed(1)} s${withMusic ? ', with music' : ', silent'})`);
