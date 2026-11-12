import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { WorldProbe } from '../../src/core/debug';
import type { ArtPiece } from '../../src/world/billboards';
import { expectNoErrors, openGame, state, watchConsole } from './helpers';

interface ArtEntry {
  file: string;
  name: string;
  width: number;
  height: number;
}

interface Manifest {
  title: string;
  billboards: ArtEntry[];
  murals: ArtEntry[];
  posters: ArtEntry[];
}

const IMG = join(process.cwd(), 'public/assets/img');
const manifest = JSON.parse(readFileSync(join(IMG, 'art.json'), 'utf8')) as Manifest;
const credits = readFileSync(join(process.cwd(), 'CREDITS.md'), 'utf8');

const probe = (page: Page, x: number, z: number): Promise<WorldProbe> => page.evaluate(([px, pz]) => window.__eyewall!.probe(px!, pz!), [x, z]);

/** The way a piece faces, as a step on the ground. */
const facing = (p: ArtPiece): [number, number] => [-Math.sin(p.yaw), -Math.cos(p.yaw)];

/** Every placed piece, once each has its picture on it. */
async function placed(page: Page): Promise<ArtPiece[]> {
  const list = (): Promise<ArtPiece[]> => page.evaluate(() => (window.__eyewall!.ext['art']?.() ?? []) as ArtPiece[]);
  await expect.poll(async () => (await list()).length, { message: 'the city has art in it' }).toBeGreaterThan(0);
  await expect.poll(async () => (await list()).filter((p) => !p.loaded).map((p) => p.file || p.kind), { timeout: 40_000, message: 'pictures still not on their boards' }).toEqual([]);
  return list();
}

/** Where the pointer is, so each move can be made relative to the last. */
const pointer = { x: 640, y: 360 };

/** Headless browsers cannot drive a locked pointer, so the view follows plain mouse movement instead. */
async function freeLook(page: Page): Promise<void> {
  await page.evaluate(() => window.__eyewall!.setFreeLook(true));
  pointer.x = 640;
  pointer.y = 360;
  await page.mouse.move(620, 360);
  await page.mouse.move(640, 360);
}

/** Turn the view with the mouse until the crosshair is on a point in the world. */
async function lookAt(page: Page, x: number, y: number, z: number, tolerance = 0.004): Promise<void> {
  for (let i = 0; i < 60; i++) {
    const a = await page.evaluate(([px, py, pz]) => window.__eyewall!.aimAt(px!, py!, pz!), [x, y, z]);
    if (Math.abs(a.yaw) < tolerance && Math.abs(a.pitch) < tolerance) return;
    // Near an edge of the window: bring the pointer back to the middle without turning the view.
    if (pointer.x < 200 || pointer.x > 1080 || pointer.y < 150 || pointer.y > 570) {
      await page.evaluate(() => window.__eyewall!.setFreeLook(false));
      await page.mouse.move(640, 360);
      await freeLook(page);
    }
    const step = (v: number): number => Math.max(-160, Math.min(160, v));
    const dx = Math.abs(a.dx) < 0.5 ? 0 : Math.round(step(a.dx)) || Math.sign(a.dx);
    const dy = Math.abs(a.dy) < 0.5 ? 0 : Math.round(step(a.dy)) || Math.sign(a.dy);
    if (dx === 0 && dy === 0) return;
    pointer.x += dx;
    pointer.y += dy;
    await page.mouse.move(pointer.x, pointer.y);
    await page.waitForTimeout(60);
  }
  throw new Error('could not turn the view onto the picture');
}

interface Seen {
  /** How closely the colours on screen follow the picture file, cell by cell: 1 is the same picture, 0 is unrelated. */
  match: number;
  /** Mean brightness where the picture is, and over the whole frame, 0..255. */
  luma: number;
  frame: number;
  /** Different colours among the sampled cells. */
  colours: number;
  /** Share of the picture that is inside the window. */
  inFrame: number;
  /** Width of the picture on screen, in pixels. */
  widthPx: number;
}

/**
 * A screenshot of the game with a finished frame on it. When frames run slow the engine changes its
 * resolution or its preset by itself, and the canvas is empty until the next frame is drawn: wait for
 * the setup to hold over a few frames, and take the picture again if it changed meanwhile.
 */
async function photograph(page: Page): Promise<Buffer> {
  const setup = async (): Promise<{ key: string; frames: number }> => {
    const s = await state(page);
    return { key: `${s.renderScale} ${s.quality}`, frames: Number(s.frames) };
  };
  for (let attempt = 0; ; attempt++) {
    const from = await setup();
    await expect.poll(async () => (await setup()).frames, { message: 'the game keeps drawing' }).toBeGreaterThan(from.frames + 2);
    const before = await setup();
    const shot = await page.locator('#game').screenshot();
    const after = await setup();
    if (attempt >= 5 || (from.key === before.key && before.key === after.key)) return shot;
  }
}

/**
 * Compare what is on screen where a picture should be with the picture file itself. The picture is cut
 * into a grid; each cell's place on screen comes from the game's own camera, its colour from a screenshot.
 */
async function seen(page: Page, piece: ArtPiece): Promise<Seen> {
  const shot = await photograph(page);
  return page.evaluate(
    async ([b64, p]) => {
      const api = window.__eyewall!;
      const camera = api.game.engine.camera;
      const canvas = document.getElementById('game') as HTMLCanvasElement;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const load = async (src: string): Promise<HTMLImageElement> => {
        const img = new Image();
        img.src = src;
        await img.decode();
        return img;
      };
      const pixels = (img: HTMLImageElement, w: number, h: number): Uint8ClampedArray => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const COLS = 12;
      const ROWS = 8;
      // The file is cut down to K pixels a cell, and the middle B of them are compared: most of the cell.
      const K = 10;
      const B = 8;
      const screen = pixels(await load(`data:image/png;base64,${b64}`), W, H);
      const file = pixels(await load(api.game.assets.url(`img/${p.file}`)), COLS * K, ROWS * K);
      // Mean colour of a block of pixels.
      const mean = (data: Uint8ClampedArray, stride: number, x0: number, y0: number, size: number): [number, number, number] => {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let y = y0; y < y0 + size; y++) {
          for (let x = x0; x < x0 + size; x++) {
            const o = (y * stride + x) * 4;
            r += data[o]!;
            g += data[o + 1]!;
            b += data[o + 2]!;
          }
        }
        const n = size * size;
        return [r / n, g / n, b / n];
      };
      const dx = -Math.sin(p.yaw);
      const dz = -Math.cos(p.yaw);
      // To the viewer's right, standing in front of the picture.
      const rx = dz;
      const rz = -dx;
      const project = (u: number, v: number): [number, number, boolean] => {
        const q = camera.position
          .clone()
          .set(p.x + rx * (u - 0.5) * p.width, p.y + (0.5 - v) * p.height, p.z + rz * (u - 0.5) * p.width)
          .project(camera);
        const sx = ((q.x + 1) / 2) * W;
        const sy = ((1 - q.y) / 2) * H;
        return [sx, sy, q.z > -1 && q.z < 1];
      };
      const left = project(0, 0.5);
      const right = project(1, 0.5);
      const top = project(0.5, 0);
      const bottom = project(0.5, 1);
      const widthPx = Math.hypot(right[0] - left[0], right[1] - left[1]);
      const heightPx = Math.hypot(bottom[0] - top[0], bottom[1] - top[1]);
      // The block read from the screen is the same share of a cell as the block read from the file, so the
      // comparison does not turn on how sharp the frame is drawn.
      const size = Math.max(5, Math.floor((Math.min(widthPx / COLS, heightPx / ROWS) * B) / K) | 1);
      const half = (size - 1) / 2;
      const want: [number, number, number][] = [];
      const got: [number, number, number][] = [];
      let lumaSum = 0;
      const colours = new Set<number>();
      for (let j = 0; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++) {
          // Cell centres, kept a little inside the edge of the picture.
          const u = 0.04 + (0.92 * (i + 0.5)) / COLS;
          const v = 0.04 + (0.92 * (j + 0.5)) / ROWS;
          const [sx, sy, ahead] = project(u, v);
          const x0 = Math.round(sx) - half;
          const y0 = Math.round(sy) - half;
          if (!ahead || x0 < 0 || y0 < 0 || x0 + size > W || y0 + size > H) continue;
          const c = mean(screen, W, x0, y0, size);
          got.push(c);
          want.push(mean(file, COLS * K, Math.round(u * COLS * K - B / 2), Math.round(v * ROWS * K - B / 2), B));
          lumaSum += c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
          colours.add(((c[0] >> 4) << 8) | ((c[1] >> 4) << 4) | (c[2] >> 4));
        }
      }
      // Pearson correlation of each colour channel across the cells, averaged over the channels that vary in the file.
      let match = 0;
      let channels = 0;
      for (let ch = 0; ch < 3; ch++) {
        const n = want.length;
        if (n < 8) break;
        let ma = 0;
        let mb = 0;
        for (let k = 0; k < n; k++) {
          ma += want[k]![ch]!;
          mb += got[k]![ch]!;
        }
        ma /= n;
        mb /= n;
        let sab = 0;
        let saa = 0;
        let sbb = 0;
        for (let k = 0; k < n; k++) {
          const a = want[k]![ch]! - ma;
          const b = got[k]![ch]! - mb;
          sab += a * b;
          saa += a * a;
          sbb += b * b;
        }
        if (saa / n < 64) continue;
        channels++;
        match += sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
      }
      let frame = 0;
      let count = 0;
      for (let y = 4; y < H; y += 8) {
        for (let x = 4; x < W; x += 8) {
          const o = (y * W + x) * 4;
          frame += screen[o]! * 0.2126 + screen[o + 1]! * 0.7152 + screen[o + 2]! * 0.0722;
          count++;
        }
      }
      return {
        match: channels > 0 ? match / channels : 0,
        luma: got.length > 0 ? lumaSum / got.length : 0,
        frame: frame / count,
        colours: colours.size,
        inFrame: got.length / (COLS * ROWS),
        widthPx,
      };
    },
    [shot.toString('base64'), piece] as const,
  );
}

/** A spot on open ground in front of a piece, between `near` and `far` metres out, where the player can stand and look back at it. */
async function standBefore(page: Page, piece: ArtPiece, near: number, far: number, across: boolean): Promise<{ x: number; z: number } | null> {
  const [dx, dz] = facing(piece);
  const open = ['sidewalk', 'plaza', 'lot', 'yard', 'grass', 'sand'];
  let crossed = false;
  for (let d = near; d <= far; d += 1) {
    const x = piece.x + dx * d;
    const z = piece.z + dz * d;
    const here = await probe(page, x, z);
    if (here.type === 'road' || here.type === 'bridge') crossed = true;
    // Bare ground: nothing parked, planted or built on the spot.
    if (!open.includes(here.type) || Math.abs(here.ground - here.height) > 0.3) continue;
    if (across && !crossed) continue;
    const next = await probe(page, x + dx, z + dz);
    if (open.includes(next.type) && Math.abs(next.ground - next.height) < 0.3) return { x: x + dx, z: z + dz };
  }
  return null;
}

/**
 * Put the player on the ground in front of a piece and turn the view onto it with the mouse. The camera
 * looks over the character's right shoulder, so the crosshair goes on the picture's lower left corner:
 * the picture then fills the view above and to the right, clear of the character's own head.
 */
async function walkUpTo(page: Page, piece: ArtPiece, spot: { x: number; z: number }): Promise<void> {
  await page.evaluate(([x, z, yaw]) => window.__eyewall!.startAt(x!, z!, yaw!), [spot.x, spot.z, piece.yaw + Math.PI]);
  await expect.poll(async () => (await state(page)).phase).toBe('match');
  await page.waitForTimeout(500);
  await freeLook(page);
  const [dx, dz] = facing(piece);
  // To the viewer's left along the picture, and down.
  const left = -0.42 * piece.width;
  await lookAt(page, piece.x + dz * left, piece.y - 0.38 * piece.height, piece.z - dx * left);
  await page.waitForTimeout(400);
}

const setHour = async (page: Page, hour: number): Promise<void> => {
  await page.evaluate((h) => window.__eyewall!.setHour(h), hour);
  await page.waitForTimeout(700);
};

test.describe('key art, billboards and signs', () => {
  test('the title screen shows the key art', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    expect((await state(page)).phase).toBe('menu');
    await expect(page.locator('.title')).toBeVisible();
    // The loading screen fades out over the title for a moment after the game is ready.
    await expect(page.locator('#boot')).toHaveCSS('opacity', '0');
    // The art is the screen's backdrop: a CSS background, or a picture element inside it.
    const art = await page.evaluate(async (name) => {
      const root = document.querySelector('.title');
      if (!root) return null;
      let url = '';
      let box: DOMRect | null = null;
      for (const el of [root, ...root.querySelectorAll('*')]) {
        const img = el instanceof HTMLImageElement ? el.currentSrc || el.src : '';
        const bg = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(el).backgroundImage)?.[1] ?? '';
        const found = [img, bg].find((u) => u.split('?')[0]!.endsWith(`/img/${name}`));
        if (found) {
          url = found;
          box = el.getBoundingClientRect();
          break;
        }
      }
      if (!url || !box) return null;
      const img = new Image();
      img.src = url;
      await img.decode();
      return { url, width: img.naturalWidth, height: img.naturalHeight, x: box.x, y: box.y, w: box.width, h: box.height };
    }, manifest.title);
    expect(art, `the title screen shows ${manifest.title}`).not.toBeNull();
    expect(art!.width).toBeGreaterThanOrEqual(1280);
    expect(art!.height).toBeGreaterThanOrEqual(720);
    expect(art!.w).toBeGreaterThanOrEqual(1280 * 0.6);
    expect(art!.h).toBeGreaterThanOrEqual(720 * 0.6);

    // What is on screen beside the menu is that picture, not a flat panel: compare the two cell by cell.
    const shot = await page.screenshot();
    const onScreen = await page.evaluate(
      async ([b64, a]) => {
        const load = async (src: string): Promise<HTMLImageElement> => {
          const img = new Image();
          img.src = src;
          await img.decode();
          return img;
        };
        const W = window.innerWidth;
        const H = window.innerHeight;
        const draw = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): Uint8ClampedArray => {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d', { willReadFrequently: true })!;
          paint(ctx);
          return ctx.getImageData(0, 0, w, h).data;
        };
        const frame = await load(`data:image/png;base64,${b64}`);
        const screen = draw(W, H, (ctx) => ctx.drawImage(frame, 0, 0, W, H));
        const file = await load(a.url);
        // The picture as it would sit in its box, filling it or fitted inside it.
        const laid = (cover: boolean): Uint8ClampedArray =>
          draw(W, H, (ctx) => {
            const s = cover ? Math.max(a.w / a.width, a.h / a.height) : Math.min(a.w / a.width, a.h / a.height);
            ctx.drawImage(file, a.x + (a.w - a.width * s) / 2, a.y + (a.h - a.height * s) / 2, a.width * s, a.height * s);
          });
        // Mean brightness of a 9 x 9 block, so fine detail and resampling do not decide the comparison.
        const luma = (d: Uint8ClampedArray, x: number, y: number): number => {
          let sum = 0;
          for (let yy = Math.round(y) - 4; yy <= Math.round(y) + 4; yy++) {
            for (let xx = Math.round(x) - 4; xx <= Math.round(x) + 4; xx++) {
              const o = (yy * W + xx) * 4;
              sum += d[o]! * 0.2126 + d[o + 1]! * 0.7152 + d[o + 2]! * 0.0722;
            }
          }
          return sum / 81;
        };
        // The right-hand third of the picture's box, clear of the menu and its shade.
        const cells: [number, number][] = [];
        for (let j = 0; j < 12; j++) for (let i = 0; i < 12; i++) cells.push([a.x + a.w * (0.68 + (0.3 * (i + 0.5)) / 12), a.y + a.h * (0.06 + (0.88 * (j + 0.5)) / 12)]);
        const got = cells.map(([x, y]) => luma(screen, x, y));
        const colours = new Set(cells.map(([x, y]) => {
          const o = (Math.round(y) * W + Math.round(x)) * 4;
          return ((screen[o]! >> 4) << 8) | ((screen[o + 1]! >> 4) << 4) | (screen[o + 2]! >> 4);
        })).size;
        const pearson = (want: number[]): number => {
          const n = want.length;
          const ma = want.reduce((s, v) => s + v, 0) / n;
          const mb = got.reduce((s, v) => s + v, 0) / n;
          let sab = 0;
          let saa = 0;
          let sbb = 0;
          for (let k = 0; k < n; k++) {
            sab += (want[k]! - ma) * (got[k]! - mb);
            saa += (want[k]! - ma) ** 2;
            sbb += (got[k]! - mb) ** 2;
          }
          return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
        };
        const match = Math.max(
          ...[true, false].map((cover) => {
            const picture = laid(cover);
            return pearson(cells.map(([x, y]) => luma(picture, x, y)));
          }),
        );
        return { match, colours };
      },
      [shot.toString('base64'), art!] as const,
    );
    expect(onScreen.colours, 'the backdrop is a picture, not a flat colour').toBeGreaterThan(30);
    expect(onScreen.match, 'the backdrop on screen is the title art').toBeGreaterThan(0.9);
    await page.screenshot({ path: 'evidence/t13-title.png' });
    expectNoErrors(watch);
  });

  test('every picture in the manifest ships with the game and is credited', async ({ request }) => {
    const all = [...manifest.billboards, ...manifest.murals, ...manifest.posters];
    expect(manifest.billboards.length + manifest.murals.length).toBeGreaterThanOrEqual(6);
    expect(new Set(all.map((e) => e.file)).size).toBe(all.length);
    for (const file of [manifest.title, ...all.map((e) => e.file)]) {
      const path = join(IMG, file);
      expect(existsSync(path), `${file} is in public/assets/img`).toBe(true);
      expect(statSync(path).size, `${file} is a real picture`).toBeGreaterThan(8000);
      const res = await request.get(`/assets/img/${file}`);
      expect(res.ok(), `the game serves ${file}`).toBe(true);
      expect(res.headers()['content-type'] ?? '').toContain('image/');
      // CREDITS.md names each picture by its file name without the extension, and the folder it ships in.
      const name = file.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/, '');
      const folder = file.includes('/') ? `public/assets/img/${file.slice(0, file.lastIndexOf('/'))}/` : `public/assets/img/${file}`;
      expect(credits, `CREDITS.md names ${file}`).toContain(`\`${name}\``);
      expect(credits, `CREDITS.md says where ${file} ships`).toContain(folder);
    }
    expect(credits).toContain('AI-generated');
  });

  test('billboards stand on rooftops and poles and murals cover blank walls, each with its picture loaded', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    const pieces = await placed(page);
    const boards = pieces.filter((p) => p.kind === 'billboard');
    const murals = pieces.filter((p) => p.kind === 'mural');
    const posters = pieces.filter((p) => p.kind === 'poster');
    expect(boards.length + murals.length, 'AC-13: at least six billboards or murals').toBeGreaterThanOrEqual(6);

    // Every billboard and mural picture is up somewhere, and no two boards or walls show the same one.
    for (const entry of manifest.billboards) expect(boards.map((p) => p.file), entry.name).toContain(entry.file);
    for (const entry of manifest.murals) expect(murals.map((p) => p.file), entry.name).toContain(entry.file);
    expect(new Set(boards.map((p) => p.file)).size).toBe(boards.length);
    expect(new Set(murals.map((p) => p.file)).size).toBe(murals.length);
    expect(boards.filter((p) => p.mount === 'roof').length).toBeGreaterThanOrEqual(2);
    expect(boards.filter((p) => p.mount === 'pole').length).toBeGreaterThanOrEqual(2);
    expect(posters.length).toBeGreaterThanOrEqual(4);

    // Each piece shows a picture from the manifest, at that picture's proportions.
    const entries = new Map([...manifest.billboards, ...manifest.murals, ...manifest.posters].map((e) => [e.file, e]));
    for (const p of pieces) {
      const entry = entries.get(p.file);
      expect(entry, `${p.kind} at ${p.x.toFixed(0)}, ${p.z.toFixed(0)} shows a manifest picture`).toBeDefined();
      expect(p.name).toBe(entry!.name);
      expect(p.loaded).toBe(true);
      expect(Math.abs(p.width / p.height - entry!.width / entry!.height), `${p.file} keeps its proportions`).toBeLessThan(0.02);
    }

    // Rooftop boards stand on a roof, facing off it; pole boards stand high over pavement; murals are on a wall that reaches above them.
    for (const p of boards) {
      const [dx, dz] = facing(p);
      const bottom = p.y - p.height / 2;
      if (p.mount === 'roof') {
        const under = await probe(page, p.x - dx, p.z - dz);
        expect(under.type, `${p.name} stands on a building`).toBe('building');
        expect(bottom - under.height, `${p.name} clears its parapet`).toBeGreaterThan(1.5);
        expect(bottom - under.height).toBeLessThan(3);
        const street = await probe(page, p.x + dx * 12, p.z + dz * 12);
        expect(['road', 'sidewalk', 'bridge'], `${p.name} faces a street`).toContain(street.type);
      } else {
        const under = await probe(page, p.x - dx * 0.5, p.z - dz * 0.5);
        expect(['sidewalk', 'plaza', 'road'], `${p.name} stands over pavement`).toContain(under.type);
        expect(bottom - under.height, `${p.name} is clear of traffic and palms`).toBeGreaterThan(8);
        expect(p.faces).toBe(2);
      }
    }
    for (const p of murals) {
      const [dx, dz] = facing(p);
      const top = p.y + p.height / 2;
      const bottom = p.y - p.height / 2;
      const wall = await probe(page, p.x - dx * 1.5, p.z - dz * 1.5);
      expect(wall.type, `${p.name} is on a building`).toBe('building');
      // The field gives the roof; the wall itself carries on up into a parapet of at most 0.9 m, and the picture stops short of its coping.
      expect(top, `${p.name} fits on its wall`).toBeLessThan(wall.height + 0.9 - 0.3);
      const front = await probe(page, p.x + dx * 2.5, p.z + dz * 2.5);
      expect(front.type === 'building' ? front.height : front.height + 0.5, `${p.name} starts above what stands in front of it`).toBeLessThan(bottom);
    }

    // The budget: with every piece inside the view, the art costs fewer than 30 draw calls.
    await page.evaluate(() => {
      const api = window.__eyewall!;
      api.setHour(15);
      api.view(0, 620, 40, 0, 0, 0);
    });
    await page.waitForTimeout(600);
    const calls = (visible: boolean): Promise<number> =>
      page.evaluate(async (on) => {
        const api = window.__eyewall!;
        const group = api.game.world.group.getObjectByName('billboards')!;
        group.visible = on;
        const frame = (): Promise<void> => new Promise((done) => requestAnimationFrame(() => done()));
        const seen: number[] = [];
        for (let i = 0; i < 6; i++) {
          await frame();
          if (i >= 2) seen.push(Number(api.state()['drawCalls']));
        }
        return seen.sort((a, b) => a - b)[Math.floor(seen.length / 2)]!;
      }, visible);
    const withArt = await calls(true);
    const without = await calls(false);
    const again = await calls(true);
    expect(Math.min(withArt, again) - without, 'the art is drawn').toBeGreaterThan(0);
    expect(Math.max(withArt, again) - without, 'draw calls added by the art').toBeLessThan(30);
    expectNoErrors(watch);
  });

  test('walking up to a billboard or a mural and looking at it puts its picture on screen, and lamps light the billboard at night', async ({ page }) => {
    test.setTimeout(300_000);
    const watch = watchConsole(page);
    await openGame(page);
    const pieces = await placed(page);

    // A rooftop board, seen from the pavement across its street.
    let board: ArtPiece | undefined;
    let spot: { x: number; z: number } | null = null;
    for (const p of pieces.filter((q) => q.kind === 'billboard' && q.mount === 'roof')) {
      spot = await standBefore(page, p, 12, 40, true);
      if (spot) {
        board = p;
        break;
      }
    }
    expect(board, 'a rooftop billboard can be seen from the pavement across its street').toBeDefined();
    await setHour(page, 15);
    await walkUpTo(page, board!, spot!);
    const day = await seen(page, board!);
    await page.screenshot({ path: 'evidence/t13-player-billboard-day.png' });
    expect(day.inFrame, 'the whole board is in view').toBe(1);
    expect(day.widthPx).toBeGreaterThan(200);
    expect(day.colours).toBeGreaterThan(20);
    expect(day.match, `${board!.name}: the picture on screen is the one in ${board!.file}`).toBeGreaterThan(0.8);

    // After dark the street dims, with or without street lamps (the lighter presets have none), and the
    // board does not: its own lamps keep it as bright as by day, brighter than the view around it, and
    // it still reads as the same picture.
    await setHour(page, 22);
    expect(Number((await state(page)).night)).toBeGreaterThan(0.9);
    const night = await seen(page, board!);
    await page.screenshot({ path: 'evidence/t13-player-billboard-night.png' });
    expect(night.frame, 'the street is darker than by day').toBeLessThan(day.frame * 0.7);
    expect(night.match, 'the lit board still shows its picture').toBeGreaterThan(0.75);
    expect(night.luma, 'the lamps keep the board as bright as by day').toBeGreaterThan(day.luma * 0.9);
    expect(night.luma, 'the board stands out from the street after dark').toBeGreaterThan(night.frame * 1.2);
    expect(day.luma, 'by day it does not: it is the lamps that do it').toBeLessThan(day.frame);

    // A mural, from the open ground in front of its wall. It has no lamps: at night it has only what the
    // street gives it, and loses much more of its daytime brightness than the lit board does.
    let mural: ArtPiece | undefined;
    for (const p of pieces.filter((q) => q.kind === 'mural')) {
      spot = await standBefore(page, p, Math.round(p.width * 1.8), Math.round(p.width * 1.8) + 14, false);
      if (spot) {
        mural = p;
        break;
      }
    }
    expect(mural, 'a mural can be seen from the ground in front of it').toBeDefined();
    await setHour(page, 15);
    await walkUpTo(page, mural!, spot!);
    const wall = await seen(page, mural!);
    await page.screenshot({ path: 'evidence/t13-player-mural.png' });
    expect(wall.inFrame, 'the whole mural is in view').toBe(1);
    expect(wall.widthPx).toBeGreaterThan(200);
    expect(wall.colours).toBeGreaterThan(20);
    // Worn paint, and street furniture in front of the wall: a little further from the file than a board.
    expect(wall.match, `${mural!.name}: the picture on screen is the one in ${mural!.file}`).toBeGreaterThan(0.75);
    await setHour(page, 22);
    const dark = await seen(page, mural!);
    expect(dark.luma / wall.luma, 'a mural has no lamps of its own').toBeLessThan((night.luma / day.luma) * 0.75);
    expectNoErrors(watch);
  });
});
