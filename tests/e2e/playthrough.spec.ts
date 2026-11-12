import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { canvasVariety, expectNoErrors, openGame, watchConsole } from './helpers';

type Row = Record<string, any>;

const player = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.player()!);
const match = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.match());
const shot = (page: Page, name: string): Promise<Buffer> => page.screenshot({ path: `evidence/playthrough/${name}.png` });

/** Read something until it satisfies a condition. Nothing here passes because time went by. */
async function until<T>(page: Page, read: () => Promise<T>, ok: (v: T) => boolean, what: string, ms = 60_000): Promise<T> {
  const end = Date.now() + ms;
  let v = await read();
  while (!ok(v)) {
    if (Date.now() > end) throw new Error(`timed out waiting for ${what}; last saw ${JSON.stringify(v)}`);
    await page.waitForTimeout(25);
    v = await read();
  }
  return v;
}

/** Game time, skipped: the round goes on at once instead of being waited for. Keys that are held stay held. */
const skip = (page: Page, seconds: number): Promise<void> => page.evaluate((s) => window.__eyewall!.fastForward(s), seconds);

/**
 * Put the player on the ground somewhere else in the city without ending the round. The sitting below
 * is one round; walking between its scenes would be most of the test and prove nothing new.
 */
async function goTo(page: Page, x: number, z: number, yaw: number): Promise<void> {
  await page.evaluate(
    ([px, pz, a]) => {
      const game = window.__eyewall!.game;
      const me = game.player!;
      me.vehicle?.exit(me);
      const y = game.physics.groundHeight(px!, 200, pz!, 400, game.world.field.heightAt(px!, pz!)) + 0.05;
      me.teleport(px!, y, pz!, a!);
      game.camera.yaw = a!;
      game.camera.pitch = -0.12;
      game.camera.snap();
    },
    [x, z, yaw] as const,
  );
  await until(page, () => player(page), (p) => p.grounded === true && p.state === 'normal', 'the player to stand on the ground');
}

/** Walk to a point with the movement keys, steering by where the player is each moment. */
async function walkTo(page: Page, x: number, z: number, tolerance = 0.3): Promise<void> {
  const keys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'AltLeft'] as const;
  const down = new Set<string>();
  const hold = async (code: string, on: boolean): Promise<void> => {
    if (on === down.has(code)) return;
    if (on) {
      down.add(code);
      await page.keyboard.down(code);
    } else {
      down.delete(code);
      await page.keyboard.up(code);
    }
  };
  const deadline = Date.now() + 40_000;
  try {
    for (;;) {
      const p = await player(page);
      const dx = x - p['x'];
      const dz = z - p['z'];
      const distance = Math.hypot(dx, dz);
      if (distance < tolerance) break;
      if (Date.now() > deadline) throw new Error(`could not walk to ${x.toFixed(1)}, ${z.toFixed(1)}: stopped ${distance.toFixed(2)} m short`);
      // Forward is (-sin yaw, -cos yaw); right is (cos yaw, -sin yaw).
      const yaw = p['camYaw'] as number;
      const forward = dx * -Math.sin(yaw) + dz * -Math.cos(yaw);
      const right = dx * Math.cos(yaw) + dz * -Math.sin(yaw);
      await hold('AltLeft', distance < 1.2);
      await hold('KeyW', forward > tolerance / 2);
      await hold('KeyS', forward < -tolerance / 2);
      await hold('KeyD', right > tolerance / 2);
      await hold('KeyA', right < -tolerance / 2);
      await page.waitForTimeout(20);
    }
  } finally {
    for (const code of keys) if (down.has(code)) await page.keyboard.up(code);
  }
}

test.describe('playthrough', () => {
  test('one sitting: drop in, loot, win a fight, drive, ride a jet ski, shop, lose to the storm and play again', async ({ page }) => {
    test.setTimeout(600_000);
    mkdirSync('evidence/playthrough', { recursive: true });
    const watch = watchConsole(page);
    await openGame(page);
    await expect(page.locator('#play')).toBeVisible();
    await shot(page, '01-title');

    // ---- Play: aboard the seaplane with twenty-three rivals ----
    await page.locator('#play').click();
    await until(page, () => player(page), (p) => p?.state === 'plane', 'the player to be aboard');
    const start = await match(page);
    expect(start.running).toBe(true);
    expect(start.alive).toBe(24);
    await expect(page.locator('.hud')).toHaveClass(/show/);
    await expect(page.locator('.tally-alive')).toHaveText('24');
    // The player is not hunted down while the sitting visits the rest of the game; the storm at the end is let through.
    await page.evaluate(() => {
      const w = window as unknown as { __keep: boolean };
      w.__keep = true;
      const me = window.__eyewall!.game.player!;
      setInterval(() => {
        if (w.__keep && me.alive) me.health = Math.max(me.health, 70);
      }, 50);
    });
    // Ride until the doors are open and the city is underneath.
    for (let i = 0; i < 240; i++) {
      const ready = await page.evaluate(() => {
        const api = window.__eyewall!;
        const p = api.player()!;
        return api.drop()['doorOpen'] === true && Math.abs(p['x']) < 260 && Math.abs(p['z']) < 300;
      });
      if (ready) break;
      await skip(page, 0.25);
    }
    expect((await page.evaluate(() => window.__eyewall!.drop()))['doorOpen'], 'the doors opened over the city').toBe(true);
    await shot(page, '02-aboard');

    // ---- the drop: Space jumps, W dives, Space opens the canopy, and the ground arrives ----
    await page.keyboard.press('Space');
    const falling = await until(page, () => player(page), (p) => p.state === 'freefall', 'the jump');
    expect(falling.altitude).toBeGreaterThan(150);
    await page.keyboard.down('KeyW');
    await until(page, () => player(page), (p) => p.altitude < falling.altitude - 25, 'the dive to lose height');
    expect(await canvasVariety(page)).toBeGreaterThan(0.2);
    await shot(page, '03-freefall');
    await page.keyboard.press('Space');
    await until(page, () => player(page), (p) => p.state === 'chute', 'the canopy to open');
    await page.waitForTimeout(600);
    await shot(page, '04-canopy');
    await page.keyboard.up('KeyW');
    // The canopy takes most of a minute to come down.
    for (let i = 0; i < 240 && (await player(page)).state !== 'normal'; i++) await skip(page, 0.5);
    const landed = await player(page);
    expect(landed.state, 'came down').toBe('normal');
    expect(landed.alive).toBe(true);
    expect(landed.health, 'the landing did not hurt').toBeGreaterThanOrEqual(70);
    await shot(page, '05-landed');

    // ---- loot: a box on the street opens with E, and what falls out is picked up with E ----
    const box = await page.evaluate(() => {
      const api = window.__eyewall!;
      let best: Record<string, any> | null = null;
      let bestD = Infinity;
      for (const c of api.loot().containers) {
        if (c['roof'] || c['opened'] || c['kind'] === 'ammo') continue;
        const front = api.nav(c['x'], c['z'] + 2.8)['kind'];
        if (front === 'blocked' || front === 'water') continue;
        const d = Math.hypot(c['x'] + 60, c['z'] - 13);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      return best;
    });
    expect(box, 'an unopened box on the street').not.toBeNull();
    await goTo(page, box!['x'], box!['z'] + 2.8, 0);
    const carried = (p: Row): number => Object.values(p['items'] as Record<string, number>).reduce((a, b) => a + b, 0);
    const before = carried(await player(page));
    await page.keyboard.down('KeyW');
    await until(page, () => player(page), (p) => String(p.prompt).length > 0, 'the box to offer itself', 15_000);
    await page.keyboard.up('KeyW');
    await page.keyboard.press('KeyE');
    await until(page, () => page.evaluate((id) => window.__eyewall!.loot().containers.find((c) => c['id'] === id)!['opened'] as boolean, box!['id']), (o) => o, 'the box to open');
    // Whatever it held, up to five things.
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(450);
      if (String((await player(page)).prompt).length === 0) break;
      await page.keyboard.press('KeyE');
    }
    const looted = await player(page);
    expect(carried(looted), 'things carried after the box').toBeGreaterThan(before);
    await shot(page, '06-looted');

    // ---- a fight: a rival a dozen strides off, the rifle out, the mouse on them, the trigger held ----
    await goTo(page, -84, -34, -Math.PI / 2);
    await page.evaluate(() => {
      const api = window.__eyewall!;
      api.give('rifle', 1);
      api.give('ammo_medium', 120);
      api.setFreeLook(true);
    });
    const held = (): Promise<string | null> => page.evaluate(() => window.__eyewall!.weapon()?.['id'] ?? null);
    if ((await held()) !== 'rifle') await page.keyboard.press('Digit3');
    await expect.poll(held, { timeout: 20_000 }).toBe('rifle');
    // One of the rivals of this round, wherever they got to, met here already hurt.
    const rivalId = await page.evaluate(() => {
      const game = window.__eyewall!.game;
      const bot = game.bots.list.find((b) => b.c.alive && b.c.state === 'normal');
      if (!bot) return -1;
      const y = game.physics.groundHeight(-71, 200, -34, 400, game.world.field.heightAt(-71, -34)) + 0.05;
      bot.c.teleport(-71, y, -34, Math.PI / 2);
      bot.c.health = 45;
      bot.c.armor = 0;
      return bot.c.id;
    });
    expect(rivalId, 'a living rival on the ground').toBeGreaterThanOrEqual(0);
    const aliveBefore = (await match(page)).alive as number;
    const rival = (): Promise<Row> => page.evaluate((i) => window.__eyewall!.characters().find((c) => c['id'] === i)!, rivalId);
    const pointer = { x: 640, y: 360 };
    await page.mouse.move(620, 360);
    await page.mouse.move(640, 360);
    await page.mouse.down();
    let down = false;
    for (let i = 0; i < 700 && !down; i++) {
      const a = await page.evaluate((id) => {
        const api = window.__eyewall!;
        const c = api.game.characters.find((x) => x.id === id)!;
        return api.aimAt(c.position.x, c.position.y + 1.1, c.position.z);
      }, rivalId);
      if (pointer.x < 200 || pointer.x > 1080 || pointer.y < 150 || pointer.y > 570) {
        await page.evaluate(() => window.__eyewall!.setFreeLook(false));
        await page.mouse.move(640, 360);
        await page.evaluate(() => window.__eyewall!.setFreeLook(true));
        pointer.x = 640;
        pointer.y = 360;
      }
      const step = (v: number): number => Math.round(Math.max(-160, Math.min(160, v)));
      pointer.x += step(a.dx);
      pointer.y += step(a.dy);
      await page.mouse.move(pointer.x, pointer.y);
      await page.waitForTimeout(40);
      if (i === 2) await shot(page, '07-fight');
      down = (await rival())['alive'] === false;
    }
    await page.mouse.up();
    expect(down, "the rival went down to the player's rifle").toBe(true);
    expect((await match(page)).alive).toBeLessThan(aliveBefore);
    await expect(page.locator('.tally-kills')).toHaveText('1');
    await expect(page.locator('.feed-line').filter({ hasText: 'You' }).first()).toBeVisible();
    await shot(page, '08-kill');

    // ---- a car: E at the driver's door, W down the beach road, the handbrake, E to get out ----
    const parked: Row = await page.evaluate(() => window.__eyewall!.ext['cars'].nearestParked(319, 47, 'hatchback-sports'));
    expect(parked, 'a parked hot hatch on Ocean Parade').not.toBeNull();
    await goTo(page, parked['x'] + 2.3, parked['z'], Math.PI / 2);
    await until(page, () => player(page), (p) => String(p.prompt).startsWith('Drive'), 'the Drive prompt', 15_000);
    await page.keyboard.press('KeyE');
    const seated = await until(page, () => player(page), (p) => p.vehicle !== null, 'the player to be at the wheel');
    expect(seated.vehicle.kind).toBe('car');
    expect(seated.vehicle.driver).toBe(true);
    await page.keyboard.down('KeyW');
    const moving = await until(page, () => player(page), (p) => p.vehicle?.speed > 9 && Math.hypot(p.x - seated.x, p.z - seated.z) > 25, 'the car to get up to speed', 30_000);
    expect(moving.state).toBe('seated');
    await shot(page, '09-driving');
    await page.keyboard.up('KeyW');
    await page.keyboard.down('Space');
    await until(page, () => player(page), (p) => Math.abs(p.vehicle?.speed ?? 0) < 0.6, 'the car to stop', 30_000);
    await page.keyboard.up('Space');
    await page.keyboard.press('KeyE');
    await until(page, () => player(page), (p) => p.vehicle === null && p.state === 'normal', 'the driver to get out');

    // ---- a jet ski: swim to it, E to ride, W and Shift across the swell ----
    const ski: Row = await page.evaluate(() => {
      const game = window.__eyewall!.game;
      const s = window.__eyewall!.ext['boats'].nearest('jetski', 440, 0);
      game.player!.teleport(s.x + Math.cos(s.yaw) * 1.5, -1.1, s.z - Math.sin(s.yaw) * 1.5, s.yaw);
      return s;
    });
    await until(page, () => player(page), (p) => String(p.prompt).startsWith('Ride'), 'the Ride prompt from the water', 20_000);
    await page.keyboard.press('KeyE');
    const riding = await until(page, () => player(page), (p) => p.vehicle !== null, 'the player to be on the jet ski');
    expect(riding.vehicle.name).toContain('jet ski');
    // Clear of the pier it was tied to, pointed at open water.
    await page.evaluate((id) => {
      const craft = window.__eyewall!.ext['boats'].craft(id);
      const yaw = Math.PI;
      craft.body.setTranslation({ x: 560, y: 0.3, z: 60 }, true);
      craft.body.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }, true);
      craft.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      craft.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      craft.buoyancy.reset();
      const game = window.__eyewall!.game;
      game.camera.yaw = yaw;
      game.camera.snap();
    }, ski['id']);
    await page.keyboard.down('KeyW');
    await page.keyboard.down('ShiftLeft');
    const skimming = await until(page, () => player(page), (p) => p.vehicle?.speed > 8 && p.z > 100, 'the jet ski to get going', 40_000);
    expect(skimming.y, 'it rides on the water, not under it').toBeGreaterThan(-0.6);
    await shot(page, '10-jetski');
    await page.keyboard.up('ShiftLeft');
    await page.keyboard.up('KeyW');

    // ---- a shop: in through the door, to the counter, a pistol for cash ----
    const shop: Row = await page.evaluate(() => (window.__eyewall!.ext['shops'].list() as Record<string, any>[]).find((s) => s['type'] === 'ammo')!);
    expect(shop, 'a gun shop in the city').toBeTruthy();
    await page.evaluate(() => {
      const me = window.__eyewall!.game.player!;
      me.vehicle?.exit(me);
    });
    expect(await page.evaluate((id) => window.__eyewall!.ext['shops'].enter(id) as boolean, shop['id'])).toBe(true);
    await until(page, () => page.evaluate(() => window.__eyewall!.ext['shops'].where()['shop'] as number | null), (s) => s === shop['id'], 'the player to be in the shop');
    await until(page, () => player(page), (p) => p.grounded === true, 'the player to stand in the shop');
    const counter = (shop['interactables'] as Row[]).find((t) => t['kind'] === 'counter')!;
    for (const p of counter['route'] as { x: number; z: number }[]) await walkTo(page, p.x, p.z);
    await until(page, () => player(page), (p) => String(p.prompt).includes('Shop at'), 'the counter to offer itself', 15_000);
    await page.keyboard.press('KeyE');
    await expect(page.locator('.shop-panel.show')).toBeVisible();
    const cash = (await player(page))['cash'] as number;
    const pistols = ((await player(page))['items']['pistol'] as number | undefined) ?? 0;
    await page.keyboard.press('Digit1');
    await expect.poll(async () => (await player(page))['cash']).toBeLessThan(cash);
    expect((await player(page))['items']['pistol']).toBe(pistols + 1);
    await shot(page, '11-shop');
    await page.keyboard.press('Escape');
    await expect(page.locator('.shop-panel.show')).toBeHidden();

    // ---- the storm: the player stays out in it, goes down, and the round ends without them ----
    await page.evaluate(() => {
      (window as unknown as { __keep: boolean }).__keep = false;
    });
    let result: Row | null = null;
    for (let t = 0; t < 620 && !result; t += 10) {
      await page.evaluate(() => {
        const api = window.__eyewall!;
        api.game.engine.stop();
        api.game.engine.renderEnabled = false;
        api.fastForward(10);
      });
      result = (await match(page)).result;
    }
    expect(result, 'the round ended').not.toBeNull();
    expect(result!['total']).toBe(24);
    expect(result!['won']).toBe(false);
    // Back at the display's own pace, for the card and the button.
    await page.evaluate(() => {
      const engine = window.__eyewall!.game.engine as any;
      engine.renderEnabled = true;
      engine.start(engine.handlers);
    });
    await expect(page.locator('.result')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.result')).toHaveClass(/loss/);
    await expect(page.locator('.result-kills')).toHaveText('1');
    await page.waitForTimeout(700);
    await shot(page, '12-result');

    // ---- and again ----
    const round = (await match(page)).round as number;
    await page.getByRole('button', { name: 'Play again' }).click();
    await expect(page.locator('.result')).toBeHidden();
    await until(page, () => player(page), (p) => p?.state === 'plane', 'the next round to board', 30_000);
    const again = await match(page);
    expect(again.round).toBe(round + 1);
    expect(again.alive).toBe(24);
    await shot(page, '13-again');
    expectNoErrors(watch);
  });
});
