import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, watchConsole } from './helpers';

type Row = Record<string, any>;

const player = (page: Page): Promise<Row> => page.evaluate(() => window.__eyewall!.player()!);

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

/** The player somewhere else on the ground, the round still running. */
async function goTo(page: Page, x: number, z: number, yaw: number): Promise<void> {
  await page.evaluate(
    ([px, pz, a]) => {
      const game = window.__eyewall!.game;
      const me = game.player!;
      me.vehicle?.exit(me);
      game.drop.release(me);
      const y = game.physics.groundHeight(px!, 200, pz!, 400, game.world.field.heightAt(px!, pz!)) + 0.05;
      me.teleport(px!, y, pz!, a!);
      game.camera.yaw = a!;
      game.camera.pitch = -0.12;
      game.camera.snap();
    },
    [x, z, yaw] as const,
  );
}

test.use({ viewport: { width: 1920, height: 1080 } });

test.describe('performance', () => {
  test('a full round at 1920x1080 on High averages 45 frames a second or more over a minute of play', async ({ page }) => {
    test.setTimeout(300_000);
    const watch = watchConsole(page);
    await openGame(page);
    const opened = await page.evaluate(() => window.__eyewall!.state());
    expect(opened['quality'], 'a fresh install starts on High').toBe('high');
    expect(await page.evaluate(() => [innerWidth, innerHeight])).toEqual([1920, 1080]);

    // A real round: twenty-four aboard, the doors open over the city.
    await page.locator('#play').click();
    await until(page, () => player(page), (p) => p?.state === 'plane', 'the player to be aboard');
    for (let i = 0; i < 240; i++) {
      const ready = await page.evaluate(() => {
        const api = window.__eyewall!;
        const p = api.player()!;
        return api.drop()['doorOpen'] === true && Math.abs(p['x']) < 260 && Math.abs(p['z']) < 300;
      });
      if (ready) break;
      await page.evaluate(() => window.__eyewall!.fastForward(0.25));
    }
    await page.evaluate(() => {
      const game = window.__eyewall!.game;
      const me = game.player!;
      // The minute is about drawing the game, not about surviving it: no single hit is a sniper round, and health tops up.
      setInterval(() => {
        if (me.alive) me.health = Math.max(me.health, 70);
      }, 50);
      const hurt = game.hurt.bind(game);
      game.hurt = (target, amount, info) => hurt(target, target === me ? Math.min(amount, 30) : amount, info);
    });
    // Let the frame rate settle after the skipped ride.
    await page.waitForTimeout(1500);
    const before = await page.evaluate(() => window.__eyewall!.state());
    expect(before['quality'], 'High when the minute starts').toBe('high');

    // ---- the measured minute ----
    type Probe = { __t0: number; __scales: number[]; __marks: [string, number, number][] };
    await page.evaluate(() => {
      const engine = window.__eyewall!.game.engine;
      const w = window as unknown as Probe;
      engine.frameTimes.length = 0;
      engine.recordFrames = true;
      w.__t0 = performance.now();
      w.__scales = [];
      w.__marks = [];
      // What the governor does with the resolution while the minute runs.
      setInterval(() => {
        if (engine.recordFrames) w.__scales.push(engine.renderScale);
      }, 250);
    });
    const elapsed = (): Promise<number> => page.evaluate(() => (performance.now() - (window as unknown as Probe).__t0) / 1000);
    const holdUntil = async (seconds: number): Promise<void> => {
      const left = seconds - (await elapsed());
      if (left > 0) await page.waitForTimeout(left * 1000);
    };
    /** Close a part of the minute: its name, when it ended and how many frames had been drawn by then. */
    const mark = (name: string): Promise<void> =>
      page.evaluate((n) => {
        const w = window as unknown as Probe;
        w.__marks.push([n, (performance.now() - w.__t0) / 1000, window.__eyewall!.game.engine.frameTimes.length]);
      }, name);

    // 0 to 20 s: out of the door, the dive, the canopy, the whole city in view with everyone falling into it.
    await page.keyboard.press('Space');
    await page.keyboard.down('KeyW');
    await holdUntil(7);
    await page.keyboard.press('Space');
    await holdUntil(20);
    await page.keyboard.up('KeyW');
    await mark('drop');
    const air = await player(page);
    expect(['freefall', 'chute', 'normal']).toContain(air.state);

    // 20 to 40 s: on foot across the plaza and down the avenue, sprinting, then the rifle.
    await goTo(page, -84, -34, -Math.PI / 2);
    await page.evaluate(() => {
      const api = window.__eyewall!;
      api.give('rifle', 1);
      api.give('ammo_medium', 150);
      api.setFreeLook(true);
    });
    await page.keyboard.press('Digit3');
    await page.keyboard.down('KeyW');
    await page.keyboard.down('ShiftLeft');
    await holdUntil(29);
    await page.keyboard.up('ShiftLeft');
    await page.mouse.move(960, 540);
    await page.mouse.down();
    await page.mouse.move(1100, 520, { steps: 30 });
    await holdUntil(33);
    await page.mouse.up();
    await page.keyboard.down('KeyD');
    await holdUntil(36);
    await page.keyboard.up('KeyD');
    await holdUntil(40);
    await page.keyboard.up('KeyW');
    await mark('on foot');
    const afoot = await player(page);
    expect(afoot.state).toBe('normal');
    expect(afoot.alive, 'alive after the plaza').toBe(true);

    // 40 to 60 s: a car down the beach road, flat out, then a handbrake turn.
    const parked: Row = await page.evaluate(() => window.__eyewall!.ext['cars'].nearestParked(319, 47, 'hatchback-sports'));
    await goTo(page, parked['x'] + 2.3, parked['z'], Math.PI / 2);
    await until(page, () => player(page), (p) => String(p.prompt).startsWith('Drive'), 'the Drive prompt', 15_000);
    await page.keyboard.press('KeyE');
    await until(page, () => player(page), (p) => p.vehicle !== null, 'the player to be at the wheel', 15_000);
    await page.keyboard.down('KeyW');
    await holdUntil(54);
    await page.keyboard.down('KeyA');
    await page.keyboard.down('Space');
    await holdUntil(57);
    await page.keyboard.up('Space');
    await page.keyboard.up('KeyA');
    await holdUntil(60.2);
    await page.keyboard.up('KeyW');
    await mark('driving');
    const drove = await player(page);
    expect(drove.vehicle, 'still at the wheel').not.toBeNull();

    const stats = await page.evaluate(() => {
      const api = window.__eyewall!;
      const engine = api.game.engine;
      engine.recordFrames = false;
      const seconds = (performance.now() - (window as unknown as { __t0: number }).__t0) / 1000;
      const times = engine.frameTimes.slice().sort((a, b) => a - b);
      const at = (q: number): number => times[Math.min(times.length - 1, Math.floor(times.length * q))]!;
      const s = api.state();
      const w = window as unknown as { __scales: number[]; __marks: [string, number, number][] };
      let t0 = 0;
      let f0 = 0;
      const parts: Record<string, number> = {};
      for (const [name, t, f] of w.__marks) {
        parts[name] = Number(((f - f0) / (t - t0)).toFixed(1));
        t0 = t;
        f0 = f;
      }
      return {
        parts,
        // One figure a second: frames drawn, and the share of the resolution in use.
        timeline: (() => {
          const perSecond: number[] = [];
          let t = 0;
          for (const ms of engine.frameTimes) {
            t += ms;
            const i = Math.floor(t / 1000);
            perSecond[i] = (perSecond[i] ?? 0) + 1;
          }
          return Array.from(perSecond, (n, i) => `${n ?? 0}@${(w.__scales[i * 4] ?? 0).toFixed(2)}`).join(' ');
        })(),
        renderScaleMin: Math.min(...w.__scales),
        renderScaleMean: Number((w.__scales.reduce((a, b) => a + b, 0) / w.__scales.length).toFixed(3)),
        calls: engine.renderer.info.render.calls,
        triangles: engine.renderer.info.render.triangles,
        seconds,
        frames: times.length,
        average: times.length / seconds,
        medianMs: at(0.5),
        p95Ms: at(0.95),
        p99Ms: at(0.99),
        worstMs: at(1),
        over50ms: times.filter((t) => t > 50).length,
        renderScale: s['renderScale'] as number,
        quality: s['quality'] as string,
        alive: api.match()['alive'] as number,
        renderer: s['renderer'] ?? null,
      };
    });
    mkdirSync('evidence', { recursive: true });
    writeFileSync('evidence/perf.json', `${JSON.stringify(stats, null, 2)}\n`);
    console.log(`perf: ${stats.average.toFixed(1)} fps average over ${stats.seconds.toFixed(1)} s (${stats.frames} frames), median ${stats.medianMs.toFixed(1)} ms, p95 ${stats.p95Ms.toFixed(1)} ms, p99 ${stats.p99Ms.toFixed(1)} ms, ${stats.over50ms} frames over 50 ms, render scale ${stats.renderScale.toFixed(2)} (lowest ${stats.renderScaleMin.toFixed(2)}, mean ${stats.renderScaleMean.toFixed(2)}); ${Object.entries(stats.parts).map(([k, v]) => `${k} ${v}`).join(', ')} fps; ${stats.calls} draw calls, ${stats.triangles} triangles in the last frame`);
    await page.screenshot({ path: 'evidence/perf.png' });

    expect(stats.seconds).toBeGreaterThanOrEqual(60);
    expect(stats.quality, 'still on High: the engine did not have to step the preset down').toBe('high');
    // The engine may trade resolution for frame rate on a busy GPU, but not most of it.
    expect(stats.renderScaleMean, 'share of the preset resolution drawn, mean over the minute').toBeGreaterThanOrEqual(0.7);
    expect(stats.alive, 'rivals were alive and busy during the minute').toBeGreaterThan(4);
    expect(stats.average, 'average frames a second over the minute').toBeGreaterThanOrEqual(45);
    // A minute that averages well but hitches is not smooth: nineteen frames in twenty are 33 ms or better.
    expect(stats.p95Ms, '95th percentile frame time, ms').toBeLessThanOrEqual(34);
    expectNoErrors(watch);
  });
});
