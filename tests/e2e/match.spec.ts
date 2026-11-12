import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, state, watchConsole } from './helpers';

type Row = Record<string, any>;

const player = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.player()!);
const match = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.match());
const zone = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.zone());
/** What the display says it is showing: the same nodes the assertions below read from the page. */
const hud = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.ext['hud']());

/**
 * Run the game forward without drawing it. A round is five minutes of play: simulated, it takes
 * well under a minute, and what happens does not depend on how fast this machine draws.
 */
async function forward(page: Page, seconds: number): Promise<void> {
  await page.evaluate((s) => {
    const api = window.__eyewall!;
    api.game.engine.stop();
    api.game.engine.renderEnabled = false;
    api.fastForward(s);
  }, seconds);
}

/** Back to the display's own pace, at full resolution: for real keys, real clicks and screenshots. */
async function resume(page: Page): Promise<void> {
  await page.evaluate(() => {
    const engine = window.__eyewall!.game.engine as any;
    engine.renderEnabled = true;
    engine.adaptive = false;
    engine.setRenderScale(1);
    engine.start(engine.handlers);
  });
  const from = (await state(page)).frames;
  await expect.poll(async () => (await state(page)).frames, { timeout: 60_000 }).toBeGreaterThan(from + 3);
}

/** Step the simulation until something is true. Returns false when it never was. */
async function forwardUntil(page: Page, done: () => Promise<boolean>, step: number, limit: number): Promise<boolean> {
  for (let t = 0; t < limit; t += step) {
    if (await done()) return true;
    await forward(page, step);
  }
  return done();
}

async function startRound(page: Page): Promise<void> {
  await openGame(page);
  await page.locator('#play').click();
  await expect.poll(async () => (await player(page))?.state, { timeout: 30_000 }).toBe('plane');
}

const clock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const toSeconds = (text: string): number => {
  const m = /(\d+):(\d\d)/.exec(text);
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
};
/** Degrees between two compass bearings. */
const turn = (a: number, b: number): number => Math.abs(((a - b + 540) % 360) - 180);

/**
 * How much of one of the storm's circles is on a map, read from the canvas itself: points around
 * the circle that fall on the map, and how many of them are the circle's colour. The wall as it
 * stands is a teal line; where it will close to is a broken yellow one.
 */
async function circleOnMap(page: Page, map: 'mini' | 'full', circle: 'eye' | 'next'): Promise<{ on: number; of: number }> {
  return page.evaluate(
    ([map, circle]) => {
      const api = window.__eyewall!;
      const shown = api.ext['hud']()[map === 'mini' ? 'map' : 'fullMap'];
      const canvas = document.querySelector<HTMLCanvasElement>(map === 'mini' ? '.minimap-canvas' : '.fullmap-canvas')!;
      const w = canvas.width;
      const px = canvas.getContext('2d')!.getImageData(0, 0, w, canvas.height).data;
      const z = api.zone();
      const [cx, cz, r] = circle === 'eye' ? [z.x, z.z, z.radius] : [z.nextX, z.nextZ, z.nextRadius];
      const teal = (r: number, g: number, b: number): boolean => r < 110 && g > 180 && b > 150 && g > b;
      const yellow = (r: number, g: number, b: number): boolean => r > 215 && g > 165 && g < 235 && b < 150 && r - b > 90;
      const is = circle === 'eye' ? teal : yellow;
      const scale = w / shown.span;
      let on = 0;
      let of = 0;
      for (let a = 0; a < 360; a += 2) {
        const x = Math.round((cx + Math.cos((a * Math.PI) / 180) * r - shown.cx) * scale + w / 2);
        const y = Math.round((cz + Math.sin((a * Math.PI) / 180) * r - shown.cz) * scale + w / 2);
        if (x < 3 || y < 3 || x > w - 4 || y > canvas.height - 4) continue;
        of++;
        let hit = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const o = ((y + dy) * w + x + dx) * 4;
            if (is(px[o]!, px[o + 1]!, px[o + 2]!)) hit = true;
          }
        }
        if (hit) on++;
      }
      return { on, of };
    },
    [map, circle] as const,
  );
}

/** The yellow line on the corner map from the player toward the next eye: points along it, and how many are yellow. */
async function guideOnMap(page: Page): Promise<{ on: number; of: number }> {
  return page.evaluate(() => {
    const api = window.__eyewall!;
    const shown = api.ext['hud']().map;
    const canvas = document.querySelector<HTMLCanvasElement>('.minimap-canvas')!;
    const w = canvas.width;
    const px = canvas.getContext('2d')!.getImageData(0, 0, w, canvas.height).data;
    const z = api.zone();
    const p = api.player()!;
    const scale = w / shown.span;
    const sx = (p.x - shown.cx) * scale + w / 2;
    const sy = (p.z - shown.cz) * scale + w / 2;
    const far = Math.hypot(z.nextX - p.x, z.nextZ - p.z);
    const ux = (z.nextX - p.x) / far;
    const uy = (z.nextZ - p.z) / far;
    const length = (far - z.nextRadius) * scale;
    let on = 0;
    let of = 0;
    // Past the player's own marker, short of the far end.
    for (let d = 14; d < length - 4; d += 2) {
      const x = Math.round(sx + ux * d);
      const y = Math.round(sy + uy * d);
      if (x < 3 || y < 3 || x > w - 4 || y > canvas.height - 4) break;
      of++;
      let hit = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const o = ((y + dy) * w + x + dx) * 4;
          const r = px[o]!;
          const g = px[o + 1]!;
          const b = px[o + 2]!;
          if (r > 215 && g > 165 && g < 235 && b < 150 && r - b > 90) hit = true;
        }
      }
      if (hit) on++;
    }
    return { on, of };
  });
}

/** How many different colours a map canvas holds, coarsely: one means nothing was drawn. */
async function mapColours(page: Page, selector: string): Promise<number> {
  return page.evaluate((selector) => {
    const canvas = document.querySelector<HTMLCanvasElement>(selector)!;
    const px = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    const seen = new Set<number>();
    for (let i = 0; i < px.length; i += 4 * 7) seen.add(((px[i]! >> 4) << 8) | ((px[i + 1]! >> 4) << 4) | (px[i + 2]! >> 4));
    return seen.size;
  }, selector);
}

test.describe('match', () => {
  test('after Play the display counts 24 alive, the compass turns with the view and the maps show the bay and the eye', async ({ page }) => {
    test.setTimeout(240_000);
    const watch = watchConsole(page);
    await startRound(page);
    await expect(page.locator('.hud')).toHaveClass(/show/);

    // Everyone is aboard and nobody has scored.
    await expect(page.locator('.tally-alive')).toHaveText('24');
    await expect(page.locator('.tally-kills')).toHaveText('0');
    await expect(page.locator('.tally')).toBeVisible();
    // The storm's clock: the first of six closings, a minute and a half away.
    await expect(page.locator('.storm-phase')).toHaveText('Eye 1 of 6');
    await expect(page.locator('.storm-text')).toHaveText(/^Eye closes in 1:[0-3]\d$/);
    expect(Math.abs(toSeconds((await page.locator('.storm-text').textContent())!) - (await zone(page)).left)).toBeLessThanOrEqual(2);
    // Nobody is down, so there is nothing in the feed and no warning.
    await expect(page.locator('.feed-line')).toHaveCount(0);
    await expect(page.locator('.storm-warn')).toBeHidden();

    // The compass reads the bearing the view faces: yaw 0 is north, and turning right counts up.
    const shown = async (): Promise<number> => Number(await page.locator('.compass-deg').textContent());
    const facing = async (): Promise<number> => (((-(await player(page)).camYaw * 180) / Math.PI) % 360 + 360) % 360;
    expect(turn(await shown(), await facing())).toBeLessThanOrEqual(1);
    const before = await shown();
    await page.evaluate(() => window.__eyewall!.setFreeLook(true));
    await page.mouse.move(420, 360);
    await page.mouse.move(700, 360, { steps: 14 });
    await expect.poll(async () => turn(await shown(), before), { timeout: 20_000 }).toBeGreaterThan(20);
    const after = await shown();
    expect((after - before + 360) % 360, 'the view turned right, so the bearing went up').toBeLessThan(120);
    expect(turn(after, await facing())).toBeLessThanOrEqual(1);
    // The mark under the needle is the nearest one to that bearing, and the letters agree.
    const under = await page.evaluate(() => {
      const strip = document.querySelector('.compass')!.getBoundingClientRect();
      const mid = strip.left + strip.width / 2;
      let text = '';
      let gap = Infinity;
      for (const mark of document.querySelectorAll('.compass-mark')) {
        const r = mark.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < gap) {
          gap = d;
          text = mark.textContent ?? '';
        }
      }
      return { text, gap };
    });
    const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const nearest = (Math.round(after / 15) * 15) % 360;
    expect(under.text).toBe(nearest % 45 === 0 ? points[nearest / 45] : String(nearest));
    expect(under.gap).toBeLessThanOrEqual(23);
    await expect(page.locator('.compass-point')).toHaveText(points[Math.round(after / 45) % 8]!);

    // The map in the corner is drawn. From the air it shows the whole bay, with the circle the eye
    // will close to on it, and the seaplane's run.
    await expect(page.locator('.minimap-canvas')).toBeVisible();
    expect(await mapColours(page, '.minimap-canvas'), 'colours on the corner map').toBeGreaterThan(12);
    const corner = (await hud(page)).map;
    expect(corner.span).toBe(1280);
    expect(corner.route).toBe(true);
    const next = await circleOnMap(page, 'mini', 'next');
    expect(next.of, 'points of the next circle that are on the map').toBeGreaterThan(60);
    expect(next.on / next.of, 'of them, drawn in yellow dashes').toBeGreaterThan(0.3);

    // M opens the full chart: north up, every place named where it is.
    await expect(page.locator('.fullmap')).toBeHidden();
    await page.keyboard.press('KeyM');
    await expect(page.locator('.fullmap')).toBeVisible();
    const places = await page.evaluate(() => {
      const api = window.__eyewall!;
      const chart = document.querySelector('.fullmap-chart')!.getBoundingClientRect();
      const labels = [...document.querySelectorAll('.fullmap-chart .map-label')].map((l) => {
        const r = l.getBoundingClientRect();
        return { name: l.textContent, minor: l.classList.contains('minor'), x: (r.left + r.width / 2 - chart.left) / chart.width, y: (r.top + r.height / 2 - chart.top) / chart.height, bottom: (r.bottom - chart.top) / chart.height };
      });
      const layout = api.game.world.layout;
      const want = [...layout.pois, ...layout.islets].map((p) => ({ name: p.name, x: (p.x + 640) / 1280, y: (p.z + 640) / 1280 }));
      return { labels, want, width: chart.width };
    });
    expect(places.want.length).toBeGreaterThanOrEqual(13);
    expect(places.labels.map((l) => l.name).sort()).toEqual(places.want.map((p) => p.name).sort());
    for (const want of places.want) {
      const label = places.labels.find((l) => l.name === want.name)!;
      expect(Math.abs(label.x - want.x) * places.width, `${want.name}: east-west`).toBeLessThan(2);
      // District names sit on their place; small places are named just above theirs.
      if (label.minor) {
        expect(label.bottom, `${want.name}: above its spot`).toBeLessThan(want.y);
        expect(want.y - label.bottom, `${want.name}: just above`).toBeLessThan(0.04);
      } else expect(Math.abs(label.y - want.y) * places.width, `${want.name}: north-south`).toBeLessThan(2);
    }
    await expect.poll(async () => (await hud(page)).fullMap?.draws ?? 0).toBeGreaterThan(0);
    expect(await mapColours(page, '.fullmap-canvas'), 'colours on the full chart').toBeGreaterThan(12);
    const fullNext = await circleOnMap(page, 'full', 'next');
    expect(fullNext.of).toBeGreaterThan(60);
    expect(fullNext.on / fullNext.of).toBeGreaterThan(0.3);

    // Escape puts the chart away without pausing the round; M does the same.
    await page.keyboard.press('Escape');
    await expect(page.locator('.fullmap')).toBeHidden();
    await expect(page.locator('.pause')).toBeHidden();
    await page.keyboard.press('KeyM');
    await expect(page.locator('.fullmap')).toBeVisible();
    await page.keyboard.press('KeyM');
    await expect(page.locator('.fullmap')).toBeHidden();
    expectNoErrors(watch);
  });

  test('Escape stops the round behind a pause card; Resume carries on and Title leaves', async ({ page }) => {
    test.setTimeout(180_000);
    const watch = watchConsole(page);
    await startRound(page);
    const running = async (): Promise<number> => (await match(page)).time;
    const t0 = await running();
    await expect.poll(running, { timeout: 30_000 }).toBeGreaterThan(t0 + 0.3);

    await expect(page.locator('.pause')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await expect(page.locator('.pause-title')).toHaveText('Paused');
    // Resume first and Title last, with room between them for what other parts add.
    await expect(page.locator('.pause-actions > :first-child')).toHaveText('Resume');
    await expect(page.locator('.pause-actions > :last-child')).toHaveText('Title');
    await expect(page.locator('.pause-actions > .pause-slot')).toBeAttached();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeFocused();
    // The round stands still while the picture is still drawn.
    const held = await running();
    const frames = (await state(page)).frames;
    await page.waitForTimeout(700);
    expect(await running()).toBe(held);
    await expect.poll(async () => (await state(page)).frames, { timeout: 30_000 }).toBeGreaterThan(frames);
    await page.screenshot({ path: 'evidence/t11-pause.png' });

    // Resume, by the mouse.
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.locator('.pause')).toBeHidden();
    await expect.poll(running, { timeout: 30_000 }).toBeGreaterThan(held + 0.3);
    // And by the keyboard: Escape again, or Enter on the button that has the focus.
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('.pause')).toBeHidden();
    const again = await running();
    await expect.poll(running, { timeout: 30_000 }).toBeGreaterThan(again + 0.3);

    // Title leaves the round.
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Title' }).click();
    await expect.poll(async () => (await state(page)).phase).toBe('menu');
    await expect(page.locator('.title')).toBeVisible();
    await expect(page.locator('.pause')).toBeHidden();
    await expect(page.locator('.hud')).not.toHaveClass(/show/);
    expect((await match(page)).running).toBe(false);
    // And the next round runs: nothing is left paused.
    await page.locator('#play').click();
    await expect.poll(async () => (await player(page))?.state, { timeout: 30_000 }).toBe('plane');
    const fresh = await running();
    await expect.poll(running, { timeout: 30_000 }).toBeGreaterThan(fresh + 0.3);
    expect((await match(page)).alive).toBe(24);
    expectNoErrors(watch);
  });

  test('the eye closes in phases, the storm hurts outside it, and going down brings spectating, the loss screen and another round', async ({ page }) => {
    test.setTimeout(540_000);
    const watch = watchConsole(page);
    await startRound(page);

    // What the storm does, as the game reports it: each change of the eye, and each toll on the player.
    await page.evaluate(() => {
      const api = window.__eyewall!;
      const log = { zone: [] as string[], storm: [] as number[], other: 0 };
      (window as any).__t11 = log;
      api.game.events.on('zone', (e) => log.zone.push(`${e.phase}:${e.stage}`));
      api.game.events.on('hurt', ({ target, amount, info }) => {
        if (target !== api.game.player) return;
        if (info.cause === 'storm') log.storm.push(amount);
        else log.other += amount;
      });
    });
    const log = (): Promise<{ zone: string[]; storm: number[]; other: number }> => page.evaluate(() => (window as any).__t11);

    // The player comes down on the cay farthest from where the eye will settle. Nobody else lands
    // there, so whatever happens to them is the storm's doing.
    const cay = await page.evaluate(() => {
      const api = window.__eyewall!;
      const z = api.game.zone;
      const far = (p: { x: number; z: number }): number => Math.hypot(p.x - z.nextX, p.z - z.nextZ);
      const pick = [...api.game.world.layout.islets].sort((a, b) => far(b) - far(a))[0]!;
      api.skydive(pick.x, 95, pick.z);
      return { name: pick.name, x: pick.x, z: pick.z, r: pick.r, clear: far(pick) - z.nextRadius };
    });
    expect(cay.clear, `${cay.name} is outside the first closing`).toBeGreaterThan(60);
    expect(await forwardUntil(page, async () => (await player(page)).state === 'normal', 2, 60), 'the player landed').toBe(true);
    const landed = await player(page);
    expect(Math.hypot(landed.x - cay.x, landed.z - cay.z), `metres from the middle of ${cay.name}`).toBeLessThan(cay.r);
    expect(landed.health).toBe(100);

    // Waiting: the wall has not moved. The clock counts down, and the display says how far the next eye is.
    await resume(page);
    const waiting = await zone(page);
    expect(waiting.stage).toBe('hold');
    expect(waiting.phase).toBe(0);
    expect(waiting.radius).toBeGreaterThan(900);
    await expect(page.locator('.storm')).not.toHaveClass(/closing/);
    expect(Math.abs(toSeconds((await page.locator('.storm-text').textContent())!) - (await zone(page)).left)).toBeLessThanOrEqual(2);
    await expect(page.locator('.storm-warn')).toBeVisible();
    await expect(page.locator('.storm-warn')).not.toHaveClass(/out/);
    await expect(page.locator('.storm-warn-text')).toHaveText(/^\d+ m to the next eye$/);
    const ahead = Number.parseInt((await page.locator('.storm-warn-text').textContent())!, 10);
    expect(Math.abs(ahead - cay.clear), 'metres to the next eye').toBeLessThan(cay.r + 3);
    // On the ground the corner map closes in around the player, with a line toward the next eye.
    await expect.poll(async () => (await hud(page)).map.span, { timeout: 30_000 }).toBe(520);
    expect((await hud(page)).map.guide).toBe(true);
    const guide = await guideOnMap(page);
    expect(guide.of, 'points along the line to the next eye').toBeGreaterThan(20);
    expect(guide.on / guide.of, 'of them, yellow').toBeGreaterThan(0.8);

    // The first closing: the clock says so, and the wall comes in.
    expect(await forwardUntil(page, async () => (await zone(page)).stage === 'shrink', 3, 100), 'the eye began to close').toBe(true);
    await forward(page, 4);
    await resume(page);
    await expect(page.locator('.storm')).toHaveClass(/closing/);
    await expect(page.locator('.storm-text')).toHaveText(/^Closing 0:\d\d$/);
    const closing = await zone(page);
    expect(closing.radius).toBeLessThan(waiting.radius);
    expect(closing.radius).toBeGreaterThan(closing.nextRadius);
    await forward(page, 6);
    expect((await zone(page)).radius, 'the wall keeps coming').toBeLessThan(closing.radius - 5);

    // It passes over the cay. From then on the player loses health every second, and is told.
    const outside = async (): Promise<number> => {
      const [z, p] = [await zone(page), await player(page)];
      return Math.hypot(p.x - z.x, p.z - z.z) - z.radius;
    };
    expect(await forwardUntil(page, async () => (await outside()) > 3, 2, 70), 'the wall passed the player').toBe(true);
    const h0 = (await player(page)).health;
    const tolls0 = (await log()).storm.length;
    await forward(page, 8);
    const hit = await log();
    const h1 = (await player(page)).health;
    expect(hit.storm.length - tolls0, 'tolls in eight seconds outside').toBeGreaterThanOrEqual(7);
    expect(hit.storm.length - tolls0).toBeLessThanOrEqual(9);
    expect(hit.other, 'damage from anything but the storm').toBe(0);
    const rate = (await zone(page)).damage;
    expect(rate).toBe(1);
    expect(h0 - h1, 'health lost in eight seconds').toBe((hit.storm.length - tolls0) * rate);
    await resume(page);
    await expect(page.locator('.storm-warn')).toBeVisible();
    await expect(page.locator('.storm-warn')).toHaveClass(/out/);
    await expect(page.locator('.storm-warn-title')).toHaveText('In the storm');
    await expect(page.locator('.storm-warn-text')).toHaveText(/^\d+ m to the eye, losing 1 health a second$/);
    // The wall is still moving, so the words and the distance are read at the same moment.
    const told = await page.evaluate(() => {
      const api = window.__eyewall!;
      const z = api.zone();
      const p = api.player()!;
      return { text: document.querySelector('.storm-warn-text')!.textContent ?? '', out: Math.hypot(p.x - z.x, p.z - z.z) - z.radius };
    });
    expect(Math.abs(Number.parseInt(told.text, 10) - told.out), 'metres to the eye').toBeLessThan(4);
    // The health bar keeps up, and the air goes grey with rain.
    expect(Math.abs(Number(await page.locator('.bar:not(.bar-armor) .bar-num').textContent()) - (await player(page)).health)).toBeLessThanOrEqual(2);
    await expect.poll(async () => Number(await page.locator('.storm-tint').evaluate((n) => getComputedStyle(n).opacity)), { timeout: 30_000 }).toBeGreaterThan(0.3);
    await page.screenshot({ path: 'evidence/t11-storm.png' });

    // The second eye: the first closing is done, a smaller circle is announced, and both are on the chart.
    expect(await forwardUntil(page, async () => (await zone(page)).phase === 1, 3, 70), 'the first closing finished').toBe(true);
    const second = await zone(page);
    expect(second.stage).toBe('hold');
    expect(second.radius).toBe(360);
    expect(second.nextRadius).toBe(210);
    expect(Math.hypot(second.nextX - second.x, second.nextZ - second.z), 'the next circle lies inside this one').toBeLessThanOrEqual(150);
    await resume(page);
    await expect(page.locator('.storm-phase')).toHaveText('Eye 2 of 6');
    await expect(page.locator('.storm-text')).toHaveText(/^Eye closes in \d:\d\d$/);
    await page.keyboard.press('KeyM');
    await expect(page.locator('.fullmap')).toBeVisible();
    await expect.poll(async () => (await hud(page)).fullMap?.draws ?? 0).toBeGreaterThan(0);
    const wall = await circleOnMap(page, 'full', 'eye');
    expect(wall.of, 'points of the wall that are on the chart').toBeGreaterThan(90);
    expect(wall.on / wall.of, 'of them, drawn in teal').toBeGreaterThan(0.85);
    const inner = await circleOnMap(page, 'full', 'next');
    expect(inner.of).toBeGreaterThan(90);
    expect(inner.on / inner.of).toBeGreaterThan(0.3);
    await page.screenshot({ path: 'evidence/t11-map.png' });
    await page.keyboard.press('KeyM');
    await expect(page.locator('.fullmap')).toBeHidden();

    // The feed: rivals have been at each other since they landed, and each kill shows on the page as
    // it happens. So does the player's own end, when the storm finishes them: that line stands out.
    const escape = (text: string): RegExp => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    const lineOf = (victim: string) => page.locator('.feed-line').filter({ has: page.locator('.feed-victim', { hasText: escape(victim) }) });
    let counted = (await match(page)).feed.length;
    expect(counted, 'kills so far').toBeGreaterThan(0);
    let rival: Row | null = null;
    let mine: Row | null = null;
    for (let t = 0; t < 300 && !(rival && mine); t++) {
      await forward(page, 1);
      const m = await match(page);
      for (const line of m.feed.slice(counted) as Row[]) {
        const shown = lineOf(line.victim);
        await expect(shown, `${line.victim} is in the feed`).toHaveCount(1);
        await expect(shown.locator('.feed-head')).toHaveCount(line.headshot ? 1 : 0);
        if (line.victim === 'You') {
          mine = line;
          await expect(shown).toHaveClass(/mine/);
          await expect(shown.locator('.feed-killer')).toHaveText('The storm');
        } else {
          rival = line;
          await expect(shown).not.toHaveClass(/mine/);
          if (line.killer) await expect(shown.locator('.feed-killer')).toHaveText(line.killer);
        }
      }
      counted = m.feed.length;
      expect(await page.locator('.feed-line').count(), 'lines in the feed').toBeLessThanOrEqual(6);
      await expect(page.locator('.tally-alive')).toHaveText(String(m.alive));
    }
    expect(rival, 'a rival went down while we watched').not.toBeNull();
    expect(mine, 'the storm took the player').not.toBeNull();
    expect((await player(page)).alive).toBe(false);
    expect(mine!.cause).toBe('storm');
    expect(mine!.mine).toBe(true);
    const place = mine!.left + 1;
    expect(place).toBeGreaterThan(1);
    expect(place).toBeLessThanOrEqual(24);
    expect((await log()).other, 'damage from anything but the storm').toBe(0);
    // Lines do not pile up: a few seconds on, the rival's is gone.
    await forward(page, 8);
    await expect(lineOf(rival!.victim)).toHaveCount(0);

    // Out, but not gone: the display says where they finished, then the view moves to a rival.
    await resume(page);
    await expect(page.locator('.spectate')).toBeVisible();
    await expect(page.locator('.hud')).toHaveClass(/dead/);
    await expect(page.locator('.spectate.watching')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.spectate-kicker')).toHaveText('Spectating');
    const watching = async (): Promise<string> => (await page.locator('.spectate-name').textContent()) ?? '';
    /** Metres from the camera to a rival, or -1 when they are no longer standing. */
    const near = async (name: string): Promise<number> =>
      page.evaluate((name) => {
        const game = window.__eyewall!.game;
        const c = game.match.combatants.find((x) => x.name === name && !x.isPlayer);
        return c?.alive ? game.engine.camera.position.distanceTo(c.visual) : -1;
      }, name);
    const living = async (): Promise<number> => page.evaluate(() => window.__eyewall!.game.match.combatants.filter((c) => c.alive && !c.isPlayer).length);
    // The round is live while this looks on, so whoever is watched can go down at any moment and the
    // view moves on by itself: each check is of one moment, and is made again if the moment passed.
    await expect(async () => {
      const name = await watching();
      const d = await near(name);
      expect(d, `the camera is on ${name}, who is still standing`).toBeGreaterThan(0);
      expect(d).toBeLessThan(20);
    }).toPass({ timeout: 60_000 });
    await page.screenshot({ path: 'evidence/t11-spectate.png' });
    // D moves to the next rival still standing, A back again.
    if ((await living()) > 1) {
      await expect(async () => {
        const first = await watching();
        await page.keyboard.press('KeyD');
        await expect.poll(watching, { timeout: 8_000 }).not.toBe(first);
        const second = await watching();
        await expect.poll(() => near(second), { timeout: 8_000 }).toBeGreaterThan(0);
        expect(await near(second)).toBeLessThan(20);
        await page.keyboard.press('KeyA');
        await expect.poll(watching, { timeout: 8_000 }).toBe(first);
        expect(await near(first)).toBeGreaterThan(0);
      }).toPass({ timeout: 90_000 });
    }

    // Enter brings up how it went: eliminated, their place, their kills, how long they lasted.
    await expect(page.locator('.result')).toBeHidden();
    await page.keyboard.press('Enter');
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result')).toHaveClass(/loss/);
    await expect(page.locator('.result-title')).toHaveText('Eliminated');
    await expect(page.locator('.result-place')).toHaveText(`${place} of 24`);
    await expect(page.locator('.result-kills')).toHaveText('0');
    await expect(page.locator('.result-time')).toHaveText(clock(mine!.at));
    await expect(page.locator('.result-note')).toHaveText('The storm caught you outside the eye.');
    await expect(page.locator('.result button')).toHaveText(['Play again', 'Title']);
    await expect(page.getByRole('button', { name: 'Play again' })).toBeFocused();
    await expect(page.locator('.spectate')).toBeHidden();
    // Once the card has faded in.
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'evidence/t11-loss.png' });

    // The round goes on without them to its end, the eye closing phase after phase; the card then names the winner.
    let over: Row | null = null;
    for (let t = 0; t < 520 && !over; t += 10) {
      await forward(page, 10);
      over = (await match(page)).result;
    }
    expect(over, 'the round ended').not.toBeNull();
    expect(over!.won).toBe(false);
    expect(over!.place).toBe(place);
    const seen = (await log()).zone;
    expect(seen.slice(0, 4)).toEqual(['0:shrink', '1:hold', '1:shrink', '2:hold']);
    const last = await zone(page);
    expect(last.radius, 'the eye at the end of the round').toBeLessThanOrEqual(210);
    expect(last.damage).toBeGreaterThanOrEqual(2);
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result-note')).toHaveText(`The storm caught you outside the eye. ${over!.winner} won the round.`);
    await expect(page.locator('.result-place')).toHaveText(`${place} of 24`);

    // Play again, by the mouse: everyone is back aboard the seaplane.
    await resume(page);
    const round = (await match(page)).round;
    await page.getByRole('button', { name: 'Play again' }).click();
    await expect(page.locator('.result')).toBeHidden();
    await expect.poll(async () => (await player(page)).state, { timeout: 30_000 }).toBe('plane');
    const again = await match(page);
    expect(again.round).toBe(round + 1);
    expect(again.running).toBe(true);
    expect(again.alive).toBe(24);
    expect(again.result).toBeNull();
    const me = await player(page);
    expect(me.alive).toBe(true);
    expect(me.health).toBe(100);
    expect(me.altitude).toBeGreaterThan(300);
    await expect(page.locator('.tally-alive')).toHaveText('24');
    await expect(page.locator('.feed-line')).toHaveCount(0);
    await expect(page.locator('.hud')).not.toHaveClass(/dead/);
    await expect(page.locator('.storm-phase')).toHaveText('Eye 1 of 6');
    await expect(page.locator('.bar:not(.bar-armor) .bar-num')).toHaveText('100');
    expect((await zone(page)).radius).toBeGreaterThan(900);
    expectNoErrors(watch);
  });

  test('the last one standing gets the win screen; the keyboard starts another round or goes to the title', async ({ page }) => {
    test.setTimeout(300_000);
    const watch = watchConsole(page);
    await startRound(page);
    // The player comes down in the middle of Deco Row, on the ground before any rival has found a weapon.
    await page.evaluate(() => window.__eyewall!.skydive(-60, 95, 13));
    expect(await forwardUntil(page, async () => (await player(page)).state === 'normal', 2, 60), 'the player landed').toBe(true);
    await resume(page);
    await expect(page.locator('.minimap-canvas')).toBeVisible();
    await expect.poll(async () => (await hud(page)).map.span, { timeout: 30_000 }).toBe(520);
    // The name of the place has faded from the middle of the screen.
    await expect.poll(() => page.locator('.place').evaluate((n) => getComputedStyle(n).opacity), { timeout: 15_000 }).toBe('0');
    await page.screenshot({ path: 'evidence/t11-hud.png' });

    /**
     * The player outlasts everyone. A test cannot out-shoot twenty-three rivals in the time it has,
     * so each of them takes the player's rifle fire through the game's own damage call: the kills,
     * the feed, the count and the end of the round all follow from that as they would in play.
     */
    // Who is standing is read in the same step as the shots: rivals also fall to each other.
    const sweep = (): Promise<{ running: boolean; standing: boolean; alive: number; fell: number }> =>
      page.evaluate(() => {
        const game = window.__eyewall!.game;
        const me = game.player!;
        const before = { running: game.match.running, standing: me.alive, alive: game.match.alive };
        let fell = 0;
        if (me.alive) {
          for (const c of game.match.combatants) {
            if (c === me || !c.alive) continue;
            fell++;
            game.hurt(c, 999, { by: me, cause: 'bullet', weapon: 'rifle', headshot: fell % 2 === 0 });
          }
        }
        return { ...before, fell };
      });
    const first = await sweep();
    expect(first.running).toBe(true);
    expect(first.standing, 'the player is alive to win the round').toBe(true);
    expect(first.alive).toBeGreaterThan(1);
    expect(first.fell).toBe(first.alive - 1);
    const fell = first.fell;

    // The round is over and the player has it.
    const won = await match(page);
    expect(won.running).toBe(false);
    expect(won.alive).toBe(1);
    expect(won.result.won).toBe(true);
    expect(won.result.place).toBe(1);
    expect(won.result.winner).toBe('You');
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result')).toHaveClass(/win/);
    await expect(page.locator('.result-title')).toHaveText('Last one standing');
    await expect(page.locator('.result-place')).toHaveText('1 of 24');
    await expect(page.locator('.result-kills')).toHaveText(String(fell));
    await expect(page.locator('.result-time')).toHaveText(clock(won.result.survived));
    await expect(page.locator('.result-note')).toHaveText('You outlasted 23 rivals and the storm.');
    // Behind the card: one alive, the kills counted, the player's own lines in the feed marked.
    await expect(page.locator('.tally-alive')).toHaveText('1');
    await expect(page.locator('.tally-kills')).toHaveText(String(fell));
    await expect(page.locator('.feed-line.mine')).toHaveCount(Math.min(6, fell));
    const lastLine = page.locator('.feed-line').last();
    await expect(lastLine.locator('.feed-killer')).toHaveText('You');
    await expect(lastLine.locator('.feed-how')).toHaveText('Tradewind');
    await expect(lastLine.locator('.feed-victim')).toHaveText(won.feed[won.feed.length - 1].victim);
    expect(await page.locator('.feed-line .feed-head').count(), 'headshot marks').toBeGreaterThan(0);
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'evidence/t11-win.png' });

    // The world stops a few seconds later; the card stays, and the keyboard works it.
    await expect.poll(async () => (await state(page)).phase, { timeout: 60_000 }).toBe('ended');
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play again' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Title' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('button', { name: 'Play again' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.result')).toBeHidden();
    await expect.poll(async () => (await player(page)).state, { timeout: 30_000 }).toBe('plane');
    const next = await match(page);
    expect(next.running).toBe(true);
    expect(next.alive).toBe(24);
    expect(next.round).toBe(won.round + 1);
    await expect(page.locator('.tally-alive')).toHaveText('24');
    await expect(page.locator('.tally-kills')).toHaveText('0');

    // Win again, and this time leave: Title, by the keyboard.
    expect((await sweep()).fell).toBe(23);
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result-title')).toHaveText('Last one standing');
    await expect(page.getByRole('button', { name: 'Play again' })).toBeFocused();
    // A key still down from before the card came up does nothing; half a second on, keys count.
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Title' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await state(page)).phase).toBe('menu');
    await expect(page.locator('.title')).toBeVisible();
    await expect(page.locator('.result')).toBeHidden();
    expect((await match(page)).running).toBe(false);
    // The title's note describes the game as it is.
    await expect(page.locator('.title-note')).toContainText('23 rivals');
    await expect(page.locator('.title-note')).not.toContainText('Preview build');
    // And Play starts a round from there.
    await page.locator('#play').click();
    await expect.poll(async () => (await player(page)).state, { timeout: 30_000 }).toBe('plane');
    expect((await match(page)).alive).toBe(24);
    await expect(page.locator('.result')).toBeHidden();
    expectNoErrors(watch);
  });
});
