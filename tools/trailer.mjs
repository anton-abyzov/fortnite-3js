// Film the gameplay trailer, headless, into evidence/<out>.mp4.
// Like tools/film.mjs the game is stepped by hand, one filmed frame at a time, so the film is smooth
// whatever the machine is doing. Keys and the mouse button are real events on a timeline; the view is
// turned the way a mouse would turn it.
// Usage: node tools/trailer.mjs [--out trailer] [--size 1920x1080] [--fps 30] [--only scene,scene]
//        [--skip scene,scene] [--hook "text over the first shot"] [--link play.example.com/eyewall]
//        [--music game|off|file.wav] [--stems]
// The sound is the game's own, rendered offline from a log of the shoot (tools/trailer-audio.mjs).
// The dev server must be running (EYEWALL_PORT, default 5183), and ffmpeg must be on the PATH.
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { installRecorder, renderMix } from './trailer-audio.mjs';

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
const music = opt('music', 'game');
const stems = args.includes('--stems');
const hook = opt('hook', '');
const skipped = opt('skip', '');
const port = process.env.EYEWALL_PORT ?? 5183;
const frameDir = `.temp/film/${out}`;
const tall = H > W;
// The theme runs at 100 beats a minute. Shots are whole beats long, so the cuts land on them.
const BEAT = 0.6;

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
/** Get into the vehicle beside the player: wait for its prompt, then use it. */
const board = async (prompt) => {
  for (let i = 0; i < 60; i++) {
    const p = await player();
    if (p.vehicle) return;
    if (prompt.test(String(p.prompt))) await page.evaluate(() => window.__eyewall.interact());
    await skip(0.1);
  }
  console.log(`could not board: prompt is "${(await player()).prompt}"`);
};

/**
 * A scene: `prepare` sets the stage (not filmed), `keys` are [code, down, up] in seconds, `fire` is
 * [down, up] for the trigger and `aim` for the sights, `tick` runs in the page before each filmed frame with (t, dt), and
 * `until` ends the scene early once it is true (checked every few frames).
 */
const SCENES = [
  { name: 'title', seconds: 1.2, still: true },
  {
    name: 'aerial',
    caption: 'Marazul Bay',
    seconds: 3.6,
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        api.setHour(17.3);
        api.view(760, 210, 520, 60, 0, -20);
        window.__film = { from: [760, 210, 520, 60, 0, -20], to: [520, 130, 360, 40, 10, -40], len: 3.6 };
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
    caption: 'Dive for the beach',
    seconds: 3.6,
    keys: [['KeyW', 0.3, 3.6]],
    // Out over the surf, the whole city ahead.
    prepare: async () => {
      await page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        api.skydive(654, 330, 150);
        game.camera.yaw = Math.PI / 2;
        game.camera.pitch = -0.5;
        game.camera.snap();
      });
      await skip(0.6);
    },
  },
  {
    name: 'canopy',
    caption: 'Pull the cord',
    seconds: 3.0,
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
    seconds: 4.8,
    keys: [['KeyW', 0, 4.8]],
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
    seconds: 7.2,
    keys: [
      ['Digit3', 0.05, 0.15],
      ['KeyA', 1.2, 2.0],
      ['KeyD', 4.6, 5.6],
    ],
    fire: [0.9, 7.1],
    aim: [2.3, 4.4],
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.match.stop();
        game.bots.parkAll();
        api.setHour(17.4);
        // Plaza Marazul: open paving, the rivals a dozen strides off with the fountain behind them.
        api.startAt(-84, -34, -Math.PI / 2);
        api.give('rifle', 1, 2);
        api.give('ammo_medium', 180);
        const me = game.player;
        me.armor = 100;
        const kit = [
          ['smg', 1],
          ['ammo_light', 120],
        ];
        const ids = api.deployBots(5, -70.5, -34, 4.5, kit);
        // Rivals met late in a round are already hurt: a burst puts one down.
        for (const c of game.characters) {
          if (!ids.includes(c.id)) continue;
          c.health = 64;
          c.armor = 0;
        }
        for (let i = 0; i < 20; i++) game.engine.step(1 / 60);
        game.camera.yaw = -Math.PI / 2;
        game.camera.snap();
        window.__film = { yaw: game.camera.yaw, pitch: game.camera.pitch, ids };
      }),
    until: () => {
      const game = window.__eyewall.game;
      return !game.characters.some((c) => window.__film.ids.includes(c.id) && c.alive);
    },
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
    seconds: 7.2,
    keys: [
      ['KeyW', 0.1, 5.2],
      ['KeyA', 0.9, 1.25],
      ['KeyD', 1.5, 1.8],
      ['KeyA', 5.0, 6.6],
      ['Space', 5.2, 6.4],
      ['KeyW', 6.2, 7.2],
    ],
    prepare: async () => {
      await page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.match.stop();
        game.bots.parkAll();
        api.setHour(17.5);
        // A hot hatch at the kerb on Ocean Parade, pointing south with the beach on its left.
        const car = api.ext.cars.nearestParked(319, 47, 'hatchback-sports');
        api.startAt(car.x + 2.3, car.z, Math.PI / 2);
        for (let i = 0; i < 30; i++) game.engine.step(1 / 60);
      });
      await board(/^Drive/);
      await skip(0.5);
      await page.evaluate(() => {
        const game = window.__eyewall.game;
        game.camera.yaw = Math.PI;
        game.camera.snap();
      });
    },
  },
  {
    name: 'jetski',
    caption: 'Or take the sea',
    seconds: 6,
    keys: [
      ['KeyW', 0, 6],
      ['ShiftLeft', 0.8, 6],
      ['KeyD', 2.6, 3.5],
      ['KeyA', 4.2, 5.4],
    ],
    prepare: async () => {
      await page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        api.setHour(18.1);
        const ski = api.ext.boats.nearest('jetski', 440, 0);
        api.startAt(380, 0, 0);
        const me = game.player;
        // In the water at its side, as someone who swam out to it.
        me.teleport(ski.x + Math.cos(ski.yaw) * 1.5, -1.1, ski.z - Math.sin(ski.yaw) * 1.5, ski.yaw);
        for (let i = 0; i < 30; i++) game.engine.step(1 / 60);
        window.__film = { id: ski.id };
      });
      await board(/^(Ride|Board|Take)/);
      // Out past the pier, pointed back at the skyline.
      await page.evaluate(() => {
        const craft = window.__eyewall.ext.boats.craft(window.__film.id);
        const yaw = 1.22;
        craft.body.setTranslation({ x: 610, y: 0.3, z: 150 }, true);
        craft.body.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }, true);
        craft.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        craft.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        craft.buoyancy.reset();
        window.__film.yaw = yaw;
      });
      // Under way before the shot starts.
      await page.keyboard.down('KeyW');
      await skip(1.2);
      await page.evaluate(() => {
        const game = window.__eyewall.game;
        game.camera.yaw = window.__film.yaw;
        game.camera.snap();
      });
    },
  },
  {
    name: 'shop',
    caption: 'Every shop is open',
    seconds: 4.2,
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
    seconds: 4.8,
    keys: [
      ['KeyW', 0.1, 4.8],
      ['ShiftLeft', 0.1, 4.8],
    ],
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.match.stop();
        game.bots.parkAll();
        api.setHour(17.9);
        // Sprinting west down the avenue, the wall a few strides behind and coming on.
        api.startAt(-44, 5, Math.PI / 2);
        const z = game.zone;
        z.begin(7);
        z.stage = 'hold';
        z.left = 99;
        z.x = z.nextX = -330;
        z.z = z.nextZ = 5;
        z.radius = 296;
        z.nextRadius = 200;
        window.__film = { r: 296 };
        for (let i = 0; i < 20; i++) game.engine.step(1 / 60);
      }),
    tick: (t, dt) => {
      const api = window.__eyewall;
      const game = api.game;
      const f = window.__film;
      const z = game.zone;
      f.r -= dt * 6.6;
      z.stage = 'hold';
      z.left = 99;
      z.radius = f.r;
      // The camera backs away down the avenue ahead of the runner, low, looking up at the wall.
      const p = game.player.position;
      api.view(p.x - 8 - t * 0.7, 2.75, p.z + 2.1, p.x + 14, 9, p.z - 2.5);
    },
  },
  {
    name: 'end',
    end: true,
    seconds: 4.2,
    prepare: () =>
      page.evaluate(() => {
        const api = window.__eyewall;
        const game = api.game;
        game.zone.clear();
        api.setHour(21.4);
        api.view(-60, 64, 176, -60, 10, -40);
        window.__film = { from: [-60, 64, 176, -60, 10, -40], to: [-60, 50, 120, -60, 10, -60], len: 4.2 };
      }),
    tick: (t) => {
      const f = window.__film;
      const u = Math.min(1, t / f.len);
      const e = u * u * (3 - 2 * u);
      window.__eyewall.view(...f.from.map((v, i) => v + (f.to[i] - v) * e));
    },
  },
].filter((s) => (!only || only.split(',').includes(s.name)) && !skipped.split(',').includes(s.name));
// A line for the feed, over the first moving shot.
const opener = SCENES.find((s) => !s.still && !s.end);
if (hook && opener) opener.caption = hook;

rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });
mkdirSync('evidence', { recursive: true });

await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.__eyewall?.ready === true, undefined, { timeout: 120_000 });
await page.waitForTimeout(900);

// A tall frame sees a narrow slice of the world at the game's usual lens: open it up.
if (tall) {
  await page.evaluate(() => {
    const game = window.__eyewall.game;
    game.camera.baseFov = 88;
    game.engine.camera.fov = 88;
    game.engine.camera.updateProjectionMatrix();
  });
}
const sound = music === 'game' && (await page.evaluate(installRecorder));
if (music === 'game' && !sound) console.log('this build has no audio to record: the film will be silent');
/** Where each shot starts, in film seconds. */
const cuts = [];

// Captions and the end card are part of the film, not of the game.
await page.evaluate(
  ([tall, link]) => {
    const style = document.createElement('style');
    style.textContent = `
      #film-caption { position: fixed; left: 50%; top: ${tall ? '16%' : '11%'}; transform: translateX(-50%); z-index: 60;
        font: 800 ${tall ? '5.4vw' : '3.1vw'}/1.05 "Lato", "Segoe UI", system-ui, sans-serif; letter-spacing: .06em; text-transform: uppercase;
        color: #fff; text-shadow: 0 .12em .5em rgba(0,0,0,.75), 0 0 .08em rgba(0,0,0,.9); display: none;
        ${tall ? 'width: 84vw; text-align: center; text-wrap: balance;' : 'white-space: nowrap;'} }
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
  cuts.push([scene.name, frame / fps]);
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
  let aiming = false;
  let shot = 0;
  let ending = false;
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
    if (scene.aim) {
      const want = t >= scene.aim[0] && t < scene.aim[1];
      if (want !== aiming) await (want ? page.mouse.down({ button: 'right' }) : page.mouse.up({ button: 'right' }));
      aiming = want;
    }
    if (scene.tick) await page.evaluate(([fn, t, dt]) => new Function(`return (${fn})`)()(t, dt), [scene.tick.toString(), t, 1 / fps]);
    await page.evaluate(([dt, at]) => (window.__filmStep ? window.__filmStep(dt, at) : window.__eyewall.game.engine.step(dt)), [1 / fps, frame / fps]);
    await grab();
    shot++;
    // A shot that ends on an event still ends on a beat.
    if (scene.until && !ending && i % 3 === 2) ending = await page.evaluate((fn) => new Function(`return (${fn})`)()(), scene.until.toString());
    if (ending && shot % Math.max(1, Math.round(BEAT * fps)) === 0) break;
  }
  if (firing) await page.mouse.up();
  if (aiming) await page.mouse.up({ button: 'right' });
  for (const k of scene.keys ?? []) await page.keyboard.up(k[0]);
  const p = await player();
  console.log(`${scene.name}: ${shot} frames${p ? ` | player ${p.state} x=${p.x.toFixed(0)} y=${p.y.toFixed(1)} z=${p.z.toFixed(0)} hp ${p.health?.toFixed?.(0)}` : ''}`);
}
const length = frame / fps;
console.log(`${frame} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
console.log(`cuts: ${cuts.map(([name, at]) => `${name} ${at.toFixed(1)}`).join(', ')}`);

let track = music !== 'game' && music !== 'off' && existsSync(music) ? music : '';
if (sound) {
  // The theme from the bar where the whole band is in (the tune enters four bars later), the storm's
  // own music for the storm, and the victory sting under the end card.
  const at = (name) => cuts.find((c) => c[0] === name)?.[1];
  const plan = { length, musicLevel: 0.6, sfx: 1.25, music: [[0, 'menu', 0.05, 12, 1]], sfxCues: [], extra: [] };
  if (at('storm') !== undefined) {
    // The storm is the loudest thing in the film: its own music up, and thunder on the cut.
    plan.music.push([Math.max(0, at('storm') - 0.25), 'storm', 0.5, 0, 2.2]);
    plan.sfxCues.push([at('storm'), 1.8]);
    plan.extra.push([at('storm') + 0.05, 'thunder', 0.9], [at('storm') + 2.7, 'thunder', 0.6]);
  }
  if (at('end') !== undefined) {
    plan.music.push([at('end'), 'victory', 0.35, 0, 1.25]);
    plan.sfxCues.push([at('end'), 0.5]);
  }
  let parts = [];
  await page.exposeFunction('__wav', (b64) => void parts.push(Buffer.from(b64, 'base64')));
  const render = async (file, extra = {}) => {
    parts = [];
    const mix = await page.evaluate(renderMix, { ...plan, ...extra });
    const data = Buffer.concat(parts);
    const head = Buffer.alloc(44);
    head.write('RIFF', 0);
    head.writeUInt32LE(36 + data.length, 4);
    head.write('WAVEfmt ', 8);
    head.writeUInt32LE(16, 16);
    head.writeUInt16LE(1, 20);
    head.writeUInt16LE(2, 22);
    head.writeUInt32LE(mix.sampleRate, 24);
    head.writeUInt32LE(mix.sampleRate * 4, 28);
    head.writeUInt16LE(4, 32);
    head.writeUInt16LE(16, 34);
    head.write('data', 36);
    head.writeUInt32LE(data.length, 40);
    writeFileSync(file, Buffer.concat([head, data]));
    return mix;
  };
  track = `evidence/${out}.wav`;
  const mix = await render(track);
  console.log(`sound: ${mix.seconds.toFixed(1)} s, ${mix.shots} one-shots, ${mix.loops} loops, peak ${mix.peak}, rms ${mix.rms}`);
  // For balancing the mix: the music and the effects on their own.
  if (stems) {
    await render(`evidence/${out}-music.wav`, { sfx: 0 });
    await render(`evidence/${out}-sfx.wav`, { musicLevel: 0 });
  }
}
await browser.close();
if (errors.length) console.log(`errors:\n${[...new Set(errors)].slice(0, 10).join('\n')}`);

const target = `evidence/${out}.mp4`;
const input = ['-framerate', String(fps), '-i', `${frameDir}/f-%05d.jpg`];
const video = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
// Streaming loudness, so the film is as loud as what plays before and after it in a feed.
const audio = ['-af', `loudnorm=I=-14:TP=-1.5:LRA=11${sound ? '' : `,afade=t=in:d=0.4,afade=t=out:st=${(length - 1.6).toFixed(2)}:d=1.6`}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-shortest'];
const ff = spawnSync('ffmpeg', track ? ['-y', '-loglevel', 'error', ...input, '-i', track, ...video, ...audio, target] : ['-y', '-loglevel', 'error', ...input, ...video, target], { stdio: 'inherit' });
if (ff.status !== 0) {
  console.log('ffmpeg failed');
  process.exit(1);
}
console.log(`wrote ${target} (${length.toFixed(1)} s${track ? `, sound from ${sound ? "the game's own synths" : track}` : ', silent'})`);
