import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, watchConsole } from './helpers';

type Row = Record<string, any>;

const player = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.player()!);
const bots = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.bots());
const match = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.match());

/**
 * Run the game forward without drawing it. A whole round is five minutes of play: simulated, it
 * takes well under a minute, and the result does not depend on how fast this machine draws.
 */
async function forward(page: Page, seconds: number): Promise<void> {
  await page.evaluate((s) => {
    const api = window.__eyewall!;
    api.game.engine.stop();
    api.game.engine.renderEnabled = false;
    api.fastForward(s);
  }, seconds);
}

test.describe('bots', () => {
  test('a round plays itself out to one survivor while the player does nothing', async ({ page }) => {
    test.setTimeout(240_000);
    const watch = watchConsole(page);
    await openGame(page);
    await page.locator('#play').click();
    await expect.poll(async () => (await player(page))?.state, { timeout: 30_000 }).toBe('plane');

    // Everyone is aboard: twenty-three rivals and the player.
    const start = await match(page);
    expect(start.running).toBe(true);
    expect(start.alive).toBe(24);
    expect((await bots(page)).count).toBe(23);

    // A minute in: they have all jumped and come down on their feet, on dry ground.
    await forward(page, 62);
    const early = await bots(page);
    const landed = early.bots.filter((b: Row) => b.landed);
    expect(landed.length, 'bots that have landed').toBe(23);
    const swimmers = early.bots.filter((b: Row) => b.alive && b.swimming);
    expect(swimmers.length, 'bots still in the water a minute in').toBeLessThanOrEqual(1);
    // They went for the loot: boxes are open and some of them are armed.
    const opened = early.bots.reduce((n: number, b: Row) => n + b.opened, 0);
    expect(opened, 'boxes opened in the first minute').toBeGreaterThanOrEqual(8);
    expect(early.bots.filter((b: Row) => b.alive && b.armed).length, 'armed bots').toBeGreaterThanOrEqual(5);
    // The round is not over in its first minute.
    expect((await match(page)).alive, 'alive after a minute').toBeGreaterThanOrEqual(12);

    // After the first circle has closed: they have moved through the city, fought each other and patched up,
    // and whoever is left is inside the eye.
    await forward(page, 100);
    const mid = await bots(page);
    const far = mid.bots.filter((b: Row) => b.travelled > 150).length;
    expect(far, 'bots that covered more than 150 m').toBeGreaterThanOrEqual(12);
    expect(mid.bots.reduce((n: number, b: Row) => n + b.shots, 0) + 0, 'shots fired').toBeGreaterThan(60);
    expect(mid.bots.reduce((n: number, b: Row) => n + b.kills, 0), 'kills between bots').toBeGreaterThanOrEqual(4);
    expect(mid.bots.reduce((n: number, b: Row) => n + b.heals, 0), 'heals and armor used').toBeGreaterThanOrEqual(3);
    const zone = await page.evaluate(() => window.__eyewall!.zone());
    expect(zone.phase, 'the eye has started to close').toBeGreaterThanOrEqual(1);
    const living = mid.bots.filter((b: Row) => b.alive);
    expect(living.length).toBeGreaterThanOrEqual(2);
    expect(living.filter((b: Row) => !b.inEye).length, 'living bots outside the eye').toBeLessThanOrEqual(1);

    // To the end. The player never touched a key: the storm takes them, and one bot is left standing.
    let result: Row | null = null;
    for (let t = 0; t < 560 && !result; t += 20) {
      await forward(page, 20);
      result = (await match(page)).result;
    }
    expect(result, 'the round ended').not.toBeNull();
    expect(result!.total).toBe(24);
    expect(result!.won).toBe(false);
    expect(result!.place, "the idle player's place").toBeGreaterThan(1);
    expect(result!.time, 'length of the round in seconds').toBeLessThan(600);
    const end = await bots(page);
    const left = end.bots.filter((b: Row) => b.alive);
    expect(left.length, 'survivors').toBe(1);
    expect(left[0].name).toBe(result!.winner);
    expect((await match(page)).alive).toBe(1);
    expectNoErrors(watch);
  });

  test('armed bots find the player, shoot, and can be shot', async ({ page }) => {
    test.setTimeout(180_000);
    const watch = watchConsole(page);
    await openGame(page);
    // An open stretch of street, the player armed, three armed rivals put down a short way off.
    await page.evaluate(() => {
      const api = window.__eyewall!;
      api.startAt(-60, 13);
      api.give('rifle', 1);
      api.give('ammo_medium', 120);
    });
    const held = (): Promise<string | null> => page.evaluate(() => window.__eyewall!.weapon()?.id ?? null);
    if ((await held()) !== 'rifle') await page.keyboard.press('Digit3');
    await expect.poll(held, { timeout: 20_000 }).toBe('rifle');
    const ids = await page.evaluate(() =>
      window.__eyewall!.deployBots(3, -60, 13, 26, [
        ['rifle', 1],
        ['ammo_medium', 90],
        ['bandage', 3],
      ]),
    );
    expect(ids.length).toBe(3);
    expect((await player(page)).health).toBe(100);

    // They notice, close in or hold, and open fire: the player loses health to their bullets.
    await expect
      .poll(
        async () => {
          const b = await bots(page);
          return b.bots.filter((x: Row) => x.alive && (x.mode === 'fight' || x.mode === 'chase')).length;
        },
        { timeout: 40_000, intervals: [500] },
      )
      .toBeGreaterThanOrEqual(1);
    await expect.poll(async () => (await player(page)).health, { timeout: 60_000, intervals: [200] }).toBeLessThan(100);
    // Three rifles finish an idle player in seconds. The rest of the check is about the rivals, so
    // from here the player is kept on their feet.
    await page.evaluate(() => {
      const me = window.__eyewall!.game.player!;
      setInterval(() => {
        if (me.alive) me.health = Math.max(me.health, 80);
      }, 50);
    });
    expect((await player(page)).alive, 'the player is still standing').toBe(true);
    const shooting = await bots(page);
    expect(shooting.bots.reduce((n: number, b: Row) => n + b.shots, 0), 'shots fired at the player').toBeGreaterThan(0);

    // And the player can shoot back: the rifle out, the trigger held, the mouse following the nearest rival.
    const id = await page.evaluate(() => {
      const game = window.__eyewall!.game;
      const me = game.player!;
      let best = -1;
      let bestD = Infinity;
      for (const b of game.bots.list) {
        if (!b.c.alive || b.c.state !== 'normal') continue;
        const d = b.c.position.distanceTo(me.position);
        if (d < bestD) {
          bestD = d;
          best = b.c.id;
        }
      }
      return best;
    });
    expect(id, 'a living rival').toBeGreaterThanOrEqual(0);
    await page.evaluate(() => window.__eyewall!.setFreeLook(true));
    const pointer = { x: 640, y: 360 };
    await page.mouse.move(620, 360);
    await page.mouse.move(640, 360);
    const total = (r: Row): number => r.health + r.armor;
    const rival = (): Promise<Row> => page.evaluate((i) => window.__eyewall!.characters().find((c) => c.id === i)!, id);
    const before = total(await rival());
    await page.mouse.down();
    let hit = false;
    for (let i = 0; i < 500 && !hit; i++) {
      const a = await page.evaluate((i) => {
        const api = window.__eyewall!;
        const c = api.game.characters.find((x) => x.id === i)!;
        return api.aimAt(c.position.x, c.position.y + 1.1, c.position.z);
      }, id);
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
      await page.waitForTimeout(50);
      hit = total(await rival()) < before;
    }
    await page.mouse.up();
    expect(hit, "the rival lost health to the player's rifle").toBe(true);
    expectNoErrors(watch);
  });
});
