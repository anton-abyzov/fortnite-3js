import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, watchConsole } from './helpers';

type Rec = Record<string, any>;

const EAST = -Math.PI / 2;

const player = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.player()!);
const car = (page: Page, id: number): Promise<Rec> => page.evaluate((i) => window.__eyewall!.ext.cars.state(i), id);
const gameTime = (page: Page): Promise<number> => page.evaluate(() => window.__eyewall!.state().time as number);

/** Smallest signed difference between two angles. */
const turn = (from: number, to: number): number => Math.atan2(Math.sin(to - from), Math.cos(to - from));

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

/** Stand a few metres from a parked car's driver door, walk up to it and get in with E. */
async function walkUpAndGetIn(page: Page, x: number, z: number, model: string): Promise<Rec> {
  const parked: Rec = await page.evaluate(([px, pz, m]) => window.__eyewall!.ext.cars.nearestParked(px, pz, m), [x, z, model] as const);
  expect(parked, `a parked ${model} near ${x}, ${z}`).not.toBeNull();
  expect(parked.distance).toBeLessThan(4);
  expect(parked.asleep, 'parked cars sleep until someone touches them').toBe(true);
  // Both test cars face east, so the driver's door is on the north side. Start 6 m north of the car, facing it.
  expect(Math.abs(turn(parked.yaw, EAST))).toBeLessThan(0.05);
  await page.evaluate(([px, pz]) => window.__eyewall!.startAt(px!, pz!, Math.PI), [parked.x, parked.z - 6]);
  await until(page, () => player(page), (p) => p.grounded === true, 'the player to stand on the ground');
  await page.keyboard.down('KeyW');
  await until(page, () => player(page), (p) => String(p.prompt).startsWith('Drive'), 'the Drive prompt');
  await page.keyboard.up('KeyW');
  await page.keyboard.press('KeyE');
  const p = await until(page, () => player(page), (q) => q.vehicle !== null, 'the player to be seated');
  expect(p.vehicle.kind).toBe('car');
  expect(p.vehicle.driver).toBe(true);
  expect(p.vehicle.seat).toBe(0);
  expect(p.state).toBe('seated');
  return parked;
}

/** Where traffic belongs on a road of this width: the middle of the lane to the right of the centre line. */
function laneCentre(w: number): number {
  // Boulevards have a 2.6 m median and two lanes each way (traffic keeps to the inner one); streets
  // 12 m and wider have one lane each way inside a 2.4 m strip of kerb parking; lanes share the rest.
  if (w >= 18) return (1.3 + (1.3 + w / 2) / 2) / 2;
  if (w >= 12) return (w / 2 - 2.4) / 2;
  return w / 4;
}

test.describe('cars', () => {
  // Nothing below passes on a timer, so a loaded machine only makes these slower. Give it room.
  test.describe.configure({ timeout: 300_000 });

  test('parked cars are spread across the city, clear of the lanes and of each other', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    const { parked, segments } = await page.evaluate(() => {
      const api = window.__eyewall!;
      return {
        parked: api.ext.cars.parked() as Record<string, any>[],
        segments: api.game.world.layout.segments.map((s) => ({ axis: s.axis, c: s.c, a: s.a, b: s.b, w: s.w })),
      };
    });
    expect(parked.length).toBeGreaterThanOrEqual(24);
    expect(new Set(parked.map((c) => c.model)).size, 'different models').toBeGreaterThanOrEqual(5);
    for (const c of parked) {
      expect(c.asleep, `car ${c.id} asleep`).toBe(true);
      expect(c.y, `car ${c.id} stands on the ground`).toBeGreaterThan(1.9);
      expect(c.y, `car ${c.id} stands on the ground`).toBeLessThan(2.4);
      // On a road, a parked car keeps to the kerb: outside the lanes traffic drives in.
      for (const s of segments) {
        const along = s.axis === 'x' ? c.x : c.z;
        const across = Math.abs((s.axis === 'x' ? c.z : c.x) - s.c);
        if (along < s.a || along > s.b || across > s.w / 2) continue;
        expect(across, `car ${c.id} (${c.model}) at ${c.x.toFixed(1)}, ${c.z.toFixed(1)} is in a driving lane`).toBeGreaterThan(laneCentre(s.w) + 2.2);
      }
    }
    for (let i = 0; i < parked.length; i++) {
      for (let j = i + 1; j < parked.length; j++) {
        const d = Math.hypot(parked[i]!.x - parked[j]!.x, parked[i]!.z - parked[j]!.z);
        expect(d, `cars ${parked[i]!.id} and ${parked[j]!.id} overlap`).toBeGreaterThan(2.6);
      }
    }
    // Spread out: cars in every quarter of the map around the avenue.
    const quarters = new Set(parked.map((c) => `${c.x < -40 ? 'w' : 'e'}${c.z < 0 ? 'n' : 's'}`));
    expect(quarters.size).toBe(4);
    expectNoErrors(watch);
  });

  test('get in, pass 60 km/h, steer, brake, drift on the handbrake and get out', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // The Marlin GT on the port apron: 480 m of open concrete ahead of it.
    const parked = await walkUpAndGetIn(page, -294, 335, 'sedan-sports');
    const id = parked.id as number;
    const state = (): Promise<Rec> => car(page, id);

    // Accelerate.
    const t0 = await gameTime(page);
    await page.keyboard.down('KeyW');
    const fast = await until(page, state, (s) => s.speedKmh >= 60, '60 km/h');
    const t60 = (await gameTime(page)) - t0;
    expect(t60, 'seconds from rest to 60 km/h').toBeLessThan(5);
    expect(fast.gear).toBeGreaterThanOrEqual(1);
    expect(fast.rpm).toBeGreaterThan(0.2);
    expect(fast.rpm).toBeLessThanOrEqual(1.05);
    expect(Math.abs(turn(fast.yaw, EAST)), 'runs straight').toBeLessThan(0.05);
    // Keep going to a good speed, then brake to a stop. The apron runs straight ahead for 480 m.
    const from = await until(page, state, (s) => s.speedKmh >= 85, '85 km/h');
    await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyS');
    const braked = await until(page, state, (s) => s.speed < 1.5, 'the car to stop');
    await page.keyboard.up('KeyS');
    const distance = Math.hypot(braked.x - from.x, braked.z - from.z);
    const decel = (from.speed * from.speed) / (2 * distance);
    expect(decel, `braked from ${from.speedKmh.toFixed(0)} km/h in ${distance.toFixed(1)} m`).toBeGreaterThan(7);
    expect(decel).toBeLessThan(25);
    expect(Math.abs(turn(braked.yaw, EAST)), 'stops in a straight line').toBeLessThan(0.08);
    await until(page, state, (s) => Math.abs(s.speed) < 0.3, 'the car to stand still');

    // Back up to speed and out past the sheds, then the handbrake with the wheel over: the tail comes round.
    await page.keyboard.down('KeyW');
    const straight = await until(page, state, (s) => s.speedKmh >= 72 && s.x > -160, '72 km/h again, on the open part of the apron');
    await page.keyboard.up('KeyW');
    expect(Math.abs(straight.slip), 'gripping before the handbrake goes on').toBeLessThan(0.1);
    await page.evaluate((i) => window.__eyewall!.ext.cars.resetPeaks(i), id);
    await page.keyboard.down('Space');
    await page.keyboard.down('KeyD');
    // The car keeps the largest slip angle it has seen on any step, so this cannot miss the slide.
    const drift = await until(page, state, (s) => s.peaks.slip > 0.25, 'the rear to slide');
    expect(turn(straight.yaw, drift.yaw), 'the car is turning right').toBeLessThan(-0.05);
    await page.keyboard.up('KeyD');
    const stopped = await until(page, state, (s) => Math.abs(s.speed) < 0.2, 'the handbrake to stop the car');
    await page.keyboard.up('Space');
    expect(stopped.health, 'still in one piece').toBe(stopped.maxHealth);

    // Steering: pull away turning right, then swing the wheel left.
    await page.keyboard.down('KeyD');
    await page.keyboard.down('KeyW');
    const right = await until(page, state, (s) => turn(stopped.yaw, s.yaw) < -0.3, 'the car to turn right');
    await page.keyboard.up('KeyD');
    expect(right.steer, 'front wheels point right').toBeGreaterThan(0.05);
    expect(right.roll, 'the body leans out of the turn').toBeGreaterThan(0.004);
    await page.keyboard.down('KeyA');
    const left = await until(page, state, (s) => turn(right.yaw, s.yaw) > 0.15, 'the car to turn left');
    await page.keyboard.up('KeyA');
    await page.keyboard.up('KeyW');
    expect(left.steer, 'front wheels point left').toBeLessThan(-0.05);
    await page.keyboard.down('Space');
    await until(page, state, (s) => Math.abs(s.speed) < 0.2, 'the car to stop');
    await page.keyboard.up('Space');

    // Get out.
    await page.keyboard.press('KeyE');
    const out = await until(page, () => player(page), (p) => p.vehicle === null && p.grounded === true, 'the player to stand outside');
    const rest = await state();
    const away = Math.hypot(out.x - rest.x, out.z - rest.z);
    expect(away, 'beside the car, not inside it').toBeGreaterThan(rest.width / 2 + 0.3);
    expect(away).toBeLessThan(4.5);
    const ground = await page.evaluate(([x, z]) => window.__eyewall!.probe(x!, z!).ground, [out.x, out.z]);
    expect(Math.abs(out.y - ground), 'standing on the ground').toBeLessThan(0.2);
    expect(out.state).toBe('normal');
    expect(rest.seats[0]).toBeNull();
    expectNoErrors(watch);
  });

  test('suspension works over a kerb, wheel by wheel, and settles', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // The Pica RS on Isla Garza, parked against the south kerb with open pavement beside it.
    const parked = await walkUpAndGetIn(page, -594, 8.75, 'hatchback-sports');
    const id = parked.id as number;
    const state = (): Promise<Rec> => car(page, id);
    const still = await state();
    expect(Math.max(...still.suspension.map((v: number) => Math.abs(v))), 'level at rest').toBeLessThan(0.02);

    await page.evaluate((i) => window.__eyewall!.ext.cars.resetPeaks(i), id);

    // Pull away, turn right across the kerb at a walking pace, and stop on the pavement.
    const keys = { w: false, d: false };
    const hold = async (key: 'w' | 'd', code: string, on: boolean): Promise<void> => {
      if (keys[key] === on) return;
      keys[key] = on;
      if (on) await page.keyboard.down(code);
      else await page.keyboard.up(code);
    };
    const end = Date.now() + 120_000;
    let s = await state();
    let turning = false;
    while (!(s.z > 12.4 && s.y > 2.1)) {
      expect(Date.now(), `the car to reach the pavement; it is at ${s.x.toFixed(1)}, ${s.z.toFixed(1)}`).toBeLessThan(end);
      if (s.speed >= 3.5) turning = true;
      // Feather the throttle, as anyone would bumping up a kerb.
      await hold('w', 'KeyW', s.speed < (turning ? 2.6 : 3.6));
      await hold('d', 'KeyD', turning && turn(EAST, s.yaw) > -0.95);
      await page.waitForTimeout(20);
      s = await state();
    }
    await hold('w', 'KeyW', false);
    await hold('d', 'KeyD', false);
    await page.keyboard.down('KeyS');
    await until(page, state, (v) => v.speed < 0.4, 'the car to stop on the pavement');
    await page.keyboard.up('KeyS');

    // What the car itself recorded on every step of the climb.
    const seen = (await state()).peaks as { spread: number; wheels: number[] };
    // Each wheel met the 16 cm kerb at its own moment, so they were squashed by different amounts...
    expect(seen.spread, 'largest difference between two wheels, metres').toBeGreaterThan(0.05);
    for (let k = 0; k < 4; k++) expect(seen.wheels[k], `wheel ${k} was pushed up`).toBeGreaterThan(0.03);
    // ...and with all four on the pavement the car sits level again, 16 cm higher than it started.
    const settled = await until(page, state, (v) => Math.abs(v.speed) < 0.05 && Math.max(...v.suspension.map((x: number) => Math.abs(x))) < 0.012, 'the springs to settle');
    expect(settled.contacts).toEqual([true, true, true, true]);
    expect(settled.y - still.y).toBeGreaterThan(0.12);
    expect(settled.y - still.y).toBeLessThan(0.2);
    expect(settled.health, 'nothing was hit on the way').toBe(settled.maxHealth);
    expectNoErrors(watch);
  });

  test('a crash damages the car', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    const parked = await walkUpAndGetIn(page, -294, 335, 'sedan-sports');
    const id = parked.id as number;
    const state = (): Promise<Rec> => car(page, id);
    const fxBefore = await page.evaluate(() => window.__eyewall!.fx());
    // Up to town speed, then hard right into the wall of the shed beside the apron.
    await page.keyboard.down('KeyW');
    await until(page, state, (s) => s.speedKmh >= 45, '45 km/h');
    await page.keyboard.down('KeyD');
    const hit = await until(page, state, (s) => s.health < s.maxHealth, 'the car to hit the shed');
    await page.keyboard.up('KeyW');
    await page.keyboard.up('KeyD');
    expect(hit.lastImpact, 'change of speed in the crash, m/s').toBeGreaterThan(3);
    expect(hit.health).toBeGreaterThan(0);
    expect(hit.z, 'the wall held').toBeLessThan(347);
    const fxAfter = await page.evaluate(() => window.__eyewall!.fx());
    expect((fxAfter.spark ?? 0) - (fxBefore.spark ?? 0), 'sparks at the point of impact').toBeGreaterThan(0);
    // The driver is still at the wheel of a car that still drives.
    const p = await player(page);
    expect(p.vehicle?.kind).toBe('car');
    expectNoErrors(watch);
  });

  test('traffic keeps to its lanes, crosses junctions and stops for someone in the road', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // Start the round out of the way, on Isla Garza, which the traffic does not visit.
    await page.evaluate(() => window.__eyewall!.startAt(-594, 3, 0));
    const segments: Rec[] = await page.evaluate(() => window.__eyewall!.game.world.layout.segments.map((s) => ({ id: s.id, axis: s.axis, c: s.c, a: s.a, b: s.b, w: s.w })));
    const traffic = (): Promise<Rec[]> => page.evaluate(() => window.__eyewall!.ext.cars.traffic());

    const first = await traffic();
    expect(first.length).toBeGreaterThanOrEqual(10);
    expect(first.length).toBeLessThanOrEqual(14);

    // Watch the stream for a while: where each car is, and which junctions it goes through.
    const began = new Map<number, Rec>(first.map((c) => [c.id, c]));
    const travelled = new Map<number, number>();
    const last = new Map<number, Rec>(first.map((c) => [c.id, c]));
    const crossed = new Set<number>();
    const inJunction = new Map<number, number>();
    let worst = 0;
    let samples = 0;
    const t0 = await gameTime(page);
    const watching = Date.now() + 150_000;
    // Until every car has been seen moving and one has come out of a junction onto another road.
    while (!(crossed.size >= 1 && travelled.size >= first.length && [...travelled.values()].every((d) => d > 15) && samples > 40)) {
      expect(Date.now(), 'traffic to move and cross a junction').toBeLessThan(watching);
      await page.waitForTimeout(120);
      for (const c of await traffic()) {
        const before = last.get(c.id);
        if (before) travelled.set(c.id, (travelled.get(c.id) ?? 0) + Math.hypot(c.x - before.x, c.z - before.z));
        last.set(c.id, c);
        if (c.node >= 0) {
          inJunction.set(c.id, began.get(c.id)?.segment ?? -1);
          continue;
        }
        // Out of a junction on a different road from the one it came in by: it crossed.
        if (inJunction.has(c.id)) {
          if (c.segment !== inJunction.get(c.id)) crossed.add(c.id);
          inJunction.delete(c.id);
          began.set(c.id, c);
        }
        // On a road: how far from the middle of the right-hand lane, worked out from the map alone.
        const s = segments.find((k) => k.id === c.segment)!;
        const along = s.axis === 'x' ? c.x : c.z;
        if (along < s.a + 12 || along > s.b - 12) continue;
        const heading = s.axis === 'x' ? -Math.sin(c.yaw) : -Math.cos(c.yaw);
        // Right-hand traffic: eastbound keeps south of the centre line, southbound keeps west of it.
        const side = s.axis === 'x' ? Math.sign(heading) : -Math.sign(heading);
        const off = Math.abs((s.axis === 'x' ? c.z : c.x) - (s.c + side * laneCentre(s.w)));
        worst = Math.max(worst, off);
        samples++;
        expect(off, `car ${c.id} (${c.model}) at ${c.x.toFixed(1)}, ${c.z.toFixed(1)} on ${c.road} is ${off.toFixed(2)} m from its lane`).toBeLessThan(1.5);
      }
    }
    expect((await gameTime(page)) - t0).toBeGreaterThan(1);
    expect(worst).toBeLessThan(1.5);
    expect(crossed.size, 'cars that crossed a junction').toBeGreaterThanOrEqual(1);
    for (const c of await traffic()) expect(c.health, `car ${c.id} has not hit anything`).toBeGreaterThan(0);

    // Stand in the lane 30 m ahead of a car that has a long clear run, and wait for it to stop.
    const pick: Rec = await until(
      page,
      () =>
        page.evaluate(() => {
          const api = window.__eyewall!;
          const segs = api.game.world.layout.segments;
          for (const c of api.ext.cars.traffic() as Record<string, any>[]) {
            if (c.node >= 0 || c.speed < 7) continue;
            const s = segs[c.segment]!;
            const fx = -Math.sin(c.yaw);
            const fz = -Math.cos(c.yaw);
            const along = s.axis === 'x' ? c.x : c.z;
            const ahead = (s.axis === 'x' ? fx : fz) > 0 ? s.b - along : along - s.a;
            if (ahead < 70) continue;
            const x = c.x + fx * 30;
            const z = c.z + fz * 30;
            api.startAt(x, z, c.yaw + Math.PI);
            return { id: c.id as number, x, z, health: c.health as number };
          }
          return null;
        }) as Promise<Rec | null>,
      (v) => v !== null,
      'a traffic car with a long clear run',
      120_000,
    ).then((v) => v!);
    const me = await until(page, () => player(page), (p) => p.grounded === true, 'the player to stand in the road');
    const hp = me.health as number;
    const theCar = (): Promise<Rec> => car(page, pick.id);
    const gap = (c: Rec, p: Rec): number => Math.hypot(c.x - p.x, c.z - p.z) - c.length / 2;
    let closest = Infinity;
    const waited = await until(
      page,
      async () => {
        const [c, p] = [await theCar(), await player(page)];
        closest = Math.min(closest, gap(c, p));
        return { c, p };
      },
      (v) => v.c.speed < 0.05,
      'the car to stop for the player',
      120_000,
    );
    expect(waited.c.mode, 'still a traffic car: it braked, it was not knocked off its lane').toBe('traffic');
    expect(closest, 'closest the bumper came to the player, metres').toBeGreaterThan(0.6);
    expect(closest, 'it stopped because of the player, not somewhere up the road').toBeLessThan(12);
    expect(waited.p.health).toBe(hp);
    expect(waited.c.health).toBe(pick.health);
    expect(Math.hypot(waited.p.x - pick.x, waited.p.z - pick.z), 'the player was not pushed').toBeLessThan(0.3);
    // It stays stopped while they stand there.
    await page.waitForTimeout(1200);
    const later = await theCar();
    expect(later.speed).toBeLessThan(0.05);
    expect(gap(later, await player(page))).toBeGreaterThan(0.6);
    expectNoErrors(watch);
  });
});
