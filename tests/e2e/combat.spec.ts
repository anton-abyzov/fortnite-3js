import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, watchConsole } from './helpers';

type Rec = Record<string, any>;

const player = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.player()!);
const weapon = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.weapon()!);
const fx = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.fx());
const hud = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.ext['hud']());
const rival = (page: Page, id: number): Promise<Rec> => page.evaluate((i) => window.__eyewall!.characters().find((c) => c.id === i)!, id);
const give = (page: Page, item: string, count: number, tier = 0): Promise<number> => page.evaluate(([i, n, t]) => window.__eyewall!.give(i as string, n as number, t as number), [item, count, tier] as const);

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

/** Turn the view by moving the mouse until the crosshair is on a point in the world. */
async function aimAt(page: Page, x: number, y: number, z: number, tolerance = 0.0012): Promise<void> {
  for (let i = 0; i < 40; i++) {
    const a = await page.evaluate(([px, py, pz]) => window.__eyewall!.aimAt(px!, py!, pz!), [x, y, z]);
    if (Math.abs(a.yaw) < tolerance && Math.abs(a.pitch) < tolerance) return;
    // Near an edge of the window: bring the pointer back to the middle without turning the view.
    if (pointer.x < 200 || pointer.x > 1080 || pointer.y < 150 || pointer.y > 570) {
      await page.evaluate(() => window.__eyewall!.setFreeLook(false));
      await page.mouse.move(640, 360);
      await freeLook(page);
    }
    const step = (v: number): number => Math.max(-160, Math.min(160, v));
    // Whole pixels only, and at least one while there is still an error to close.
    const dx = Math.abs(a.dx) < 0.5 ? 0 : Math.round(step(a.dx)) || Math.sign(a.dx);
    const dy = Math.abs(a.dy) < 0.5 ? 0 : Math.round(step(a.dy)) || Math.sign(a.dy);
    if (dx === 0 && dy === 0) return;
    pointer.x += dx;
    pointer.y += dy;
    await page.mouse.move(pointer.x, pointer.y);
    await page.waitForTimeout(60);
  }
  throw new Error('could not bring the crosshair onto the target');
}

/** One pull of the trigger. */
async function click(page: Page, hold = 60): Promise<void> {
  await page.mouse.down();
  await page.waitForTimeout(hold);
  await page.mouse.up();
}

async function select(page: Page, key: string, id: string): Promise<void> {
  await page.keyboard.press(key);
  await expect.poll(async () => (await weapon(page)).id, { timeout: 20_000 }).toBe(id);
  await expect.poll(async () => (await weapon(page)).drawing, { timeout: 20_000 }).toBe(false);
}

test.describe('weapons, combat and loot', () => {
  test('opens a container, takes the weapon and ammunition, and the display shows them', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // Walk up to a container that has open, level ground to its south.
    const box = await page.evaluate(() => {
      const api = window.__eyewall!;
      const all = api.loot().containers.filter((c) => !c['roof']);
      all.sort((a, b) => Math.hypot(a['x'] + 60, a['z'] - 13) - Math.hypot(b['x'] + 60, b['z'] - 13));
      const level = (c: Record<string, any>): boolean => [1, 2, 3, 4, 5, 6].every((k) => Math.abs(api.probe(c['x'], c['z'] + k).ground - c['y']) < 0.2);
      const c = all.find(level)!;
      // Start a few steps south of it, facing it (yaw 0 faces north).
      api.startAt(c['x'], c['z'] + 5, 0);
      return c;
    });
    await freeLook(page);
    expect((await weapon(page)).id, 'starts unarmed').toBeNull();
    expect((await hud(page))['weapon']).toBe('Unarmed');

    await page.keyboard.down('KeyW');
    await expect.poll(async () => (await player(page)).prompt, { timeout: 30_000, intervals: [50] }).toMatch(/^Open (cooler|duffel bag)$/);
    await page.keyboard.up('KeyW');
    await page.screenshot({ path: 'evidence/t06-container.png' });
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await page.evaluate((id) => window.__eyewall!.loot().containers.find((c) => c['id'] === id)!['opened'], box['id'])) as boolean, { timeout: 20_000 }).toBe(true);

    // The contents hop out at the player's feet and are picked up.
    await expect.poll(async () => (await weapon(page)).id, { timeout: 30_000 }).not.toBeNull();
    const w = await weapon(page);
    expect(w.mag, 'a fresh weapon comes loaded').toBe(w.magSize);
    await expect.poll(async () => (await weapon(page)).reserve, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect.poll(async () => (await player(page)).cash, { timeout: 30_000 }).toBeGreaterThan(300);

    const shown = await hud(page);
    expect(shown['visible']).toBe(true);
    expect(shown['crosshair']).toBe(true);
    expect(shown['slots']).toContain(w.id);
    expect(shown['active']).toBe(w.id);
    expect(shown['mag']).toBe(w.magSize);
    expect(shown['toasts'].length, 'pickups are announced').toBeGreaterThan(0);
    await page.screenshot({ path: 'evidence/t06-looted.png' });

    // Loose items on the ground are taken by walking over them.
    const loose = await page.evaluate(() => {
      const api = window.__eyewall!;
      const level = (q: Record<string, any>): boolean => [1, 2, 3, 4].every((k) => Math.abs(api.probe(q['x'], q['z'] + k).ground - q['y']) < 0.2);
      const p = api.loot().pickups.filter((x) => String(x['item']).startsWith('ammo_') && x['y'] < 4 && level(x))[0]!;
      api.startAt(p['x'], p['z'] + 3, 0);
      return p;
    });
    const before = (await player(page)).items[loose['item']] ?? 0;
    await page.keyboard.down('KeyW');
    await expect.poll(async () => (await player(page)).items[loose['item']] ?? 0, { timeout: 30_000, intervals: [50] }).toBeGreaterThan(before);
    await page.keyboard.up('KeyW');
    expectNoErrors(watch);
  });

  test('five weapon classes fire with recoil, spread, tracers and impacts, reload and switch', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // On the Avenida del Sol sidewalk facing west, with a building front to shoot at on the right.
    await page.evaluate(() => window.__eyewall!.startAt(-60, 13, Math.PI / 2));
    await freeLook(page);
    for (const [item, count] of [
      ['pistol', 1],
      ['ammo_light', 240],
      ['smg', 1],
      ['rifle', 1],
      ['ammo_medium', 180],
      ['shotgun', 1],
      ['ammo_shells', 50],
      ['sniper', 1],
      ['ammo_heavy', 32],
    ] as const) {
      await give(page, item, count);
    }
    await expect.poll(async () => (await weapon(page)).carried.length).toBe(5);
    // The pavement ten metres ahead: something solid for every shot to land on.
    const p = await player(page);
    const ground = { x: p.x - 10, y: p.y, z: p.z };
    await aimAt(page, ground.x, ground.y, ground.z, 0.01);

    // Sidearm: one shot per pull however long the trigger is held, and the view kicks up and stays up a little.
    await select(page, 'Digit1', 'pistol');
    let w = await weapon(page);
    let f = await fx(page);
    const pitch = (await player(page)).camPitch;
    await click(page, 600);
    await expect.poll(async () => (await weapon(page)).shots, { timeout: 20_000 }).toBe(w.shots + 1);
    await page.waitForTimeout(400);
    expect((await weapon(page)).shots, 'semi-automatic').toBe(w.shots + 1);
    expect((await weapon(page)).mag).toBe(w.mag - 1);
    expect((await weapon(page)).lastHit).toBe('world');
    expect((await player(page)).camPitch, 'recoil lifts the view').toBeGreaterThan(pitch + 0.002);
    let g = await fx(page);
    expect(g['tracers'], 'a tracer').toBe(f['tracers'] + 1);
    expect(g['muzzle'], 'a muzzle flash').toBe(f['muzzle'] + 1);
    expect(g['impact'], 'dust where it landed').toBe(f['impact'] + 1);
    expect(g['decals'], 'a mark where it landed').toBe(f['decals'] + 1);

    // Submachine gun: automatic, and the cone opens as the burst goes on.
    await select(page, 'Digit2', 'smg');
    w = await weapon(page);
    await page.mouse.down();
    await expect.poll(async () => (await weapon(page)).shots, { timeout: 20_000, intervals: [30] }).toBeGreaterThanOrEqual(w.shots + 5);
    const hot = await weapon(page);
    await page.mouse.up();
    expect(hot.bloom, 'spread grows in a burst').toBeGreaterThan(0.005);
    expect(hot.spread).toBeGreaterThan(w.spread);
    await expect.poll(async () => (await weapon(page)).bloom, { timeout: 20_000 }).toBe(0);

    // Rifle: automatic too. Then reload it.
    await select(page, 'Digit3', 'rifle');
    w = await weapon(page);
    await page.mouse.down();
    await expect.poll(async () => (await weapon(page)).shots, { timeout: 20_000, intervals: [30] }).toBeGreaterThanOrEqual(w.shots + 4);
    await page.mouse.up();
    await page.waitForTimeout(250);
    const used = await weapon(page);
    expect(used.mag).toBeLessThan(used.magSize);
    await page.keyboard.press('KeyR');
    await expect.poll(async () => (await weapon(page)).reloading, { timeout: 20_000, intervals: [30] }).toBe(true);
    expect((await hud(page))['bar']).toBe('Reloading');
    await expect.poll(async () => (await weapon(page)).reloading, { timeout: 30_000 }).toBe(false);
    const full = await weapon(page);
    expect(full.mag).toBe(full.magSize);
    expect(full.reserve).toBe(used.reserve - (used.magSize - used.mag));

    // Shotgun: nine pellets a shot.
    await select(page, 'Digit4', 'shotgun');
    f = await fx(page);
    w = await weapon(page);
    await click(page);
    await expect.poll(async () => (await weapon(page)).shots, { timeout: 20_000 }).toBe(w.shots + 1);
    g = await fx(page);
    expect(g['tracers'] - f['tracers'], 'pellets').toBe(9);

    // Long rifle: wild from the hip, exact through the optic, which closes the view right in.
    await select(page, 'Digit5', 'sniper');
    w = await weapon(page);
    expect(w.spread, 'from the hip').toBeGreaterThan(0.05);
    await page.mouse.down({ button: 'right' });
    await expect.poll(async () => (await weapon(page)).aiming, { timeout: 20_000 }).toBeGreaterThan(0.98);
    await expect.poll(async () => (await weapon(page)).fov, { timeout: 20_000 }).toBeLessThan(20);
    expect((await weapon(page)).spread, 'aimed').toBeLessThan(0.002);
    await page.screenshot({ path: 'evidence/t06-scope.png' });
    await click(page);
    await expect.poll(async () => (await weapon(page)).shots, { timeout: 20_000 }).toBe(w.shots + 1);
    await page.mouse.up({ button: 'right' });

    // The wheel steps through what is carried.
    await page.mouse.wheel(0, 100);
    await expect.poll(async () => (await weapon(page)).id, { timeout: 20_000 }).toBe('pistol');
    expect((await hud(page))['active']).toBe('pistol');
    expectNoErrors(watch);
  });

  test('rivals are eliminated, headshots hurt more, and grenades and medicine work', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await page.evaluate(() => window.__eyewall!.startAt(-60, 13, Math.PI / 2));
    await freeLook(page);
    await give(page, 'rifle', 1);
    await give(page, 'ammo_medium', 180);
    await give(page, 'grenade', 2);
    // Two rivals up the sidewalk, facing the player. The first carries things to leave behind.
    const [a, b] = await page.evaluate(() => {
      const api = window.__eyewall!;
      const first = api.spawnTarget(-78, 13, -Math.PI / 2);
      const second = api.spawnTarget(-74, 16.5, -Math.PI / 2);
      const c = api.game.characters.find((x) => x.id === first)!;
      api.game.grant(c, 'pistol', 1, 2);
      api.game.grant(c, 'ammo_light', 36);
      c.cash = 55;
      return [first, second];
    });
    await select(page, 'Digit3', 'rifle');
    await page.mouse.down({ button: 'right' });
    await expect.poll(async () => (await weapon(page)).aiming, { timeout: 20_000 }).toBeGreaterThan(0.98);

    // A shot to the chest.
    let t = await rival(page, a!);
    await aimAt(page, t.x, t.y + 1.15, t.z);
    await click(page);
    await expect.poll(async () => (await rival(page, a!)).health, { timeout: 20_000 }).toBeLessThan(100);
    await page.waitForTimeout(300);
    const body = 100 - (await rival(page, a!)).health;
    expect((await weapon(page)).lastHeadshot).toBe(false);
    expect((await fx(page))['blood']).toBeGreaterThan(0);

    // A shot to the head does more.
    t = await rival(page, a!);
    await aimAt(page, t.x, t.eye + 0.05, t.z);
    await click(page);
    await expect.poll(async () => (await rival(page, a!)).health, { timeout: 20_000 }).toBeLessThan(100 - body - 1);
    await page.waitForTimeout(300);
    const head = 100 - body - (await rival(page, a!)).health;
    expect((await weapon(page)).lastHeadshot, 'counted as a headshot').toBe(true);
    expect(head, `head ${head} against body ${body}`).toBeGreaterThan(body * 1.4);
    await page.screenshot({ path: 'evidence/t06-firefight.png' });

    // Finish the job.
    const loot = (await page.evaluate(() => window.__eyewall!.loot().pickups.length)) as number;
    for (let i = 0; i < 6 && (await rival(page, a!)).alive; i++) {
      t = await rival(page, a!);
      await aimAt(page, t.x, t.y + 1.15, t.z);
      await click(page);
      await page.waitForTimeout(250);
    }
    expect((await rival(page, a!)).alive, 'eliminated').toBe(false);
    await page.mouse.up({ button: 'right' });
    expect((await page.evaluate(() => window.__eyewall!.characters()[0]!['kills'])) as number).toBe(1);
    expect((await hud(page))['toasts'].join(' ')).toContain('Eliminated');
    expect((await page.evaluate(() => window.__eyewall!.loot().pickups.length)) as number, 'the fallen leave their things').toBeGreaterThanOrEqual(loot + 3);

    // A frag thrown at the second rival's feet.
    t = await rival(page, b!);
    await aimAt(page, t.x, t.y + 0.4, t.z, 0.01);
    await page.keyboard.press('KeyG');
    await expect.poll(async () => (await weapon(page)).grenades, { timeout: 20_000, intervals: [30] }).toBe(1);
    await expect.poll(async () => (await fx(page))['explosion'], { timeout: 30_000 }).toBe(1);
    await expect.poll(async () => (await rival(page, b!)).health, { timeout: 20_000 }).toBeLessThan(100);
    expect((await player(page)).items['grenade']).toBe(1);

    // Hurt, then patched up; then a drink for armor.
    await give(page, 'medkit', 1);
    await give(page, 'cola', 2);
    await page.evaluate(() => {
      const g = window.__eyewall!.game;
      g.hurt(g.player!, 70, { by: null, cause: 'fall' });
    });
    expect((await player(page)).health).toBe(30);
    await page.keyboard.press('KeyQ');
    await expect.poll(async () => (await weapon(page)).using, { timeout: 20_000, intervals: [30] }).toBe('medkit');
    expect((await hud(page))['bar']).toBe('Using Medkit');
    await expect.poll(async () => (await player(page)).health, { timeout: 30_000 }).toBe(100);
    await page.keyboard.press('KeyX');
    await expect.poll(async () => (await player(page)).armor, { timeout: 30_000 }).toBe(25);
    expect((await player(page)).items['cola']).toBe(1);
    expectNoErrors(watch);
  });
});
