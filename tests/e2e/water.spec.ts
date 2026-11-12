import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, view, watchConsole } from './helpers';

type Rec = Record<string, any>;

// Headings: yaw 0 faces north (-Z) and a positive turn is to port.
const NORTH = 0;
const WEST = Math.PI / 2;
const EAST = -Math.PI / 2;
const DEG = 180 / Math.PI;

/** Smallest signed turn from one heading to another. Positive is to port (left). */
const turn = (from: number, to: number): number => Math.atan2(Math.sin(to - from), Math.cos(to - from));

/** One look at the game: the player, one craft, the water under it, the clock and the effect counters. */
interface Look {
  /** Game time, seconds. */
  time: number;
  player: Rec;
  craft: Rec;
  /** Height of the water surface where the craft is, metres. */
  sea: number;
  fx: Rec;
}

const look = (page: Page, id: number): Promise<Look> =>
  page.evaluate((i) => {
    const api = window.__eyewall!;
    const boats = api.ext.boats;
    const craft = boats.get(i);
    return { time: api.state().time as number, player: api.player()!, craft, sea: boats.surface(craft.x, craft.z), fx: api.fx() };
  }, id);

const weapon = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.weapon()!);

/** The craft of a kind moored nearest to a point, which must be the one the test expects there. */
async function mooredAt(page: Page, kind: 'boat' | 'jetski', x: number, z: number): Promise<Rec> {
  const c: Rec | null = await page.evaluate(([k, px, pz]) => window.__eyewall!.ext.boats.nearest(k, px, pz), [kind, x, z] as const);
  expect(c, `a ${kind} moored near ${x}, ${z}`).not.toBeNull();
  expect(Math.hypot(c!.x - x, c!.z - z), `the ${kind} near ${x}, ${z}`).toBeLessThan(3);
  expect(c!.dock, `a place to board ${kind} ${c!.id} from`).not.toBeNull();
  return c!;
}

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

/** Keep looking at a craft for a stretch of game time. The looks are the measurement; the caller judges them. */
async function observe(page: Page, id: number, seconds: number): Promise<Look[]> {
  const log = [await look(page, id)];
  const end = Date.now() + seconds * 1000 + 60_000;
  while (log[log.length - 1]!.time - log[0]!.time < seconds) {
    if (Date.now() > end) throw new Error('the game clock stopped');
    await page.waitForTimeout(30);
    log.push(await look(page, id));
  }
  return log;
}

/** Lowest, highest and spread of one reading over a run of looks. */
function span(log: Look[], pick: (l: Look) => number): { min: number; max: number; range: number; mean: number } {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const l of log) {
    const v = pick(l);
    min = Math.min(min, v);
    max = Math.max(max, v);
    sum += v;
  }
  return { min, max, range: max - min, mean: sum / Math.max(1, log.length) };
}

/** The keys held down right now, so a change of mind sends only the events that differ. */
class Keys {
  private readonly down = new Set<string>();

  constructor(private readonly page: Page) {}

  async hold(...want: string[]): Promise<void> {
    // Deleting from a Set while walking it is safe: the walk just never visits the removed key.
    for (const k of this.down) {
      if (want.includes(k)) continue;
      await this.page.keyboard.up(k);
      this.down.delete(k);
    }
    for (const k of want) {
      if (this.down.has(k)) continue;
      await this.page.keyboard.down(k);
      this.down.add(k);
    }
  }

  release(): Promise<void> {
    return this.hold();
  }
}

/** How far ahead the helm thinks, seconds: a hull keeps swinging after the helm comes off. */
const LEAD = 0.35;
/** Heading error that is not worth a touch of helm, radians. */
const BAND = 0.035;

/** Rate of turn between two looks, radians a second. */
const swing = (before: Look | null, now: Look): number => (before && now.time - before.time > 0.005 ? turn(before.craft.yaw, now.craft.yaw) / (now.time - before.time) : 0);

interface Mark {
  x: number;
  z: number;
  /** How close counts as there, metres. Default 10. */
  reach?: number;
  /** Ease the throttle above this speed, m/s. */
  pace?: number;
  boost?: boolean;
}

/**
 * Take a craft through marks the way a player does: look where the bow points, put the helm over or
 * ease it, look again. Every look goes in the log.
 */
async function sail(page: Page, keys: Keys, id: number, marks: Mark[], log: Look[], each?: (l: Look) => Promise<void>): Promise<void> {
  let before: Look | null = null;
  for (const mark of marks) {
    const reach = mark.reach ?? 10;
    const end = Date.now() + 120_000;
    for (;;) {
      const now = await look(page, id);
      log.push(now);
      const c = now.craft;
      const dx = mark.x - c.x;
      const dz = mark.z - c.z;
      const gap = Math.hypot(dx, dz);
      // Metres of the gap that still lie ahead of the bow. A mark slid past close by is as good as reached.
      const ahead = -Math.sin(c.yaw) * dx - Math.cos(c.yaw) * dz;
      if (gap < reach || (ahead < 0 && gap < reach * 3)) break;
      if (Date.now() > end) throw new Error(`craft ${id} never reached the mark at ${mark.x}, ${mark.z}; last saw ${JSON.stringify(c)}`);
      const error = turn(c.yaw, Math.atan2(-dx, -dz)) - swing(before, now) * LEAD;
      const held: string[] = [];
      if (mark.pace === undefined || c.speed < mark.pace) held.push('KeyW');
      if (mark.boost) held.push('ShiftLeft');
      if (error > BAND) held.push('KeyA');
      else if (error < -BAND) held.push('KeyD');
      await keys.hold(...held);
      if (each) await each(now);
      before = now;
      await page.waitForTimeout(20);
    }
  }
}

/**
 * Back out of a berth until `clear`, then swing the bow round to a heading under sternway and stop.
 * Going astern the helm works the other way about.
 */
async function backOut(page: Page, keys: Keys, id: number, clear: (c: Rec) => boolean, heading: number, log: Look[]): Promise<void> {
  await keys.hold('KeyS');
  let before: Look | null = null;
  const end = Date.now() + 60_000;
  for (;;) {
    const now = await look(page, id);
    log.push(now);
    if (Date.now() > end) throw new Error(`craft ${id} never backed out; last saw ${JSON.stringify(now.craft)}`);
    const off = turn(now.craft.yaw, heading);
    if (clear(now.craft)) {
      if (Math.abs(off) < 0.1) break;
      const error = off - swing(before, now) * LEAD;
      // A little sternway is all the helm needs, and it keeps the swing inside a narrow canal.
      const held = [error > 0 ? 'KeyD' : 'KeyA'];
      if (now.craft.speed > -1.8) held.push('KeyS');
      await keys.hold(...held);
    }
    before = now;
    await page.waitForTimeout(20);
  }
  await stop(page, keys, id);
}

/** Throttle shut and the brake on until the craft has all but lost its way. */
async function stop(page: Page, keys: Keys, id: number, below = 0.8): Promise<Look> {
  await keys.hold('Space');
  const l = await until(page, () => look(page, id), (v) => Math.abs(v.craft.speed) < below, `craft ${id} to stop`);
  await keys.release();
  return l;
}

/**
 * Save a still for the evidence folder. Now and then a headless capture lands between two frames and
 * comes back with an empty canvas (a few kilobytes of HUD on a flat page), so look again when it does.
 */
async function still(page: Page, path: string): Promise<void> {
  for (let i = 0; i < 5; i++) {
    const png = await page.screenshot({ path });
    if (png.length > 150_000) return;
    await page.waitForTimeout(100);
  }
}

/** Put a measured figure in the report and in the run's output, so a pass shows what it passed with. */
const note = (text: string): void => {
  test.info().annotations.push({ type: 'measured', description: text });
  console.log(`    ${text}`);
};

test.describe('boats and jet skis', () => {
  // Nothing below passes on a timer, so a loaded machine only makes these slower. Give it room.
  test.describe.configure({ timeout: 300_000 });

  test('moored craft bob and roll at their berths, less in the canal than out on the marina', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);

    const all: Rec[] = await page.evaluate(() => window.__eyewall!.ext.boats.list());
    const boats = all.filter((c) => c.kind === 'boat');
    const skis = all.filter((c) => c.kind === 'jetski');
    expect(boats.length, 'speedboats').toBeGreaterThanOrEqual(15);
    expect(skis.length, 'jet skis').toBeGreaterThanOrEqual(20);
    expect(new Set(boats.map((c) => c.model)).size, 'different boat models').toBeGreaterThanOrEqual(4);
    for (const c of all) {
      for (const key of ['id', 'x', 'y', 'z', 'yaw', 'pitch', 'roll', 'speed', 'planing']) expect(Number.isFinite(c[key]), `craft ${c.id} ${key}`).toBe(true);
      expect(typeof c.occupied).toBe('boolean');
      expect(typeof c.asleep).toBe('boolean');
    }
    // They are spread over the map: the marina, both canals, the creek and the ocean pier.
    expect(all.filter((c) => c.x < -320 && c.x > -375).length, 'craft at the marina').toBeGreaterThanOrEqual(20);
    expect(all.filter((c) => c.x > -320 && c.x < 185 && Math.abs(Math.abs(c.z) - 155) < 16).length, 'craft in the canals').toBeGreaterThanOrEqual(6);
    expect(all.filter((c) => c.x > 185 && c.x < 240).length, 'craft in the creek').toBeGreaterThanOrEqual(4);
    expect(all.filter((c) => c.x > 400).length, 'craft at the ocean pier').toBeGreaterThanOrEqual(1);

    // The outer end of a marina pier, open to the bay: a launch on one side and a jet ski on the other.
    const launch = await mooredAt(page, 'boat', -363, 64.6);
    const ski = await mooredAt(page, 'jetski', -363, 73.6);
    const canalBoat = await mooredAt(page, 'boat', -145.7, -166.2);
    await page.evaluate(([x, z]) => window.__eyewall!.startAt(x!, z!, Math.PI), [launch.dock.x, launch.dock.z]);
    await until(page, () => look(page, launch.id), (l) => l.player.grounded === true && l.craft.asleep === false, 'the launch to wake as the player stands by it');
    expect((await look(page, canalBoat.id)).craft.asleep, 'a craft far across the city is asleep').toBe(true);

    const [onLaunch, onSki] = await Promise.all([observe(page, launch.id, 9), observe(page, ski.id, 9)]);
    const bob = span(onLaunch, (l) => l.craft.y);
    const roll = span(onLaunch, (l) => l.craft.roll * DEG);
    const pitch = span(onLaunch, (l) => l.craft.pitch * DEG);
    const skiRoll = span(onSki, (l) => l.craft.roll * DEG);
    const float = span(onLaunch, (l) => l.craft.y - l.sea);
    const drift = span(onLaunch, (l) => Math.hypot(l.craft.x - launch.x, l.craft.z - launch.z));
    note(`marina launch: bob ${bob.range.toFixed(2)} m, roll ${roll.min.toFixed(1)}..${roll.max.toFixed(1)} deg, pitch ${pitch.min.toFixed(1)}..${pitch.max.toFixed(1)} deg, drift ${drift.max.toFixed(2)} m; jet ski roll ${skiRoll.min.toFixed(1)}..${skiRoll.max.toFixed(1)} deg`);
    expect(bob.range, 'the launch rises and falls with the waves').toBeGreaterThan(0.08);
    expect(roll.range, 'the launch rolls').toBeGreaterThan(2);
    expect(pitch.range, 'the launch pitches').toBeGreaterThan(0.8);
    expect(skiRoll.range, 'the jet ski rolls').toBeGreaterThan(3);
    // It floats: the hull stays at the surface, never under it and never in the air.
    expect(float.min, 'hull against the surface').toBeGreaterThan(-0.45);
    expect(float.max, 'hull against the surface').toBeLessThan(0.45);
    // Tied up: it moves on its lines and goes nowhere.
    expect(drift.max, 'drift from the berth').toBeLessThan(0.6);
    expect(Math.abs(roll.min), 'stays upright').toBeLessThan(25);
    expect(Math.abs(roll.max), 'stays upright').toBeLessThan(25);

    await view(page, [-379, 6.5, 84], [-356, 0.4, 66], 10);
    await still(page, 'evidence/t08-marina-moorings.png');
    await page.evaluate(() => window.__eyewall!.releaseView());

    // The same watch in the canal, from the steps the boat is tied beside.
    await page.evaluate(([x, z]) => window.__eyewall!.startAt(x!, z!, 0), [canalBoat.dock.x, canalBoat.dock.z]);
    await until(page, () => look(page, canalBoat.id), (l) => l.player.grounded === true && l.craft.asleep === false, 'the canal boat to wake');
    const inCanal = await observe(page, canalBoat.id, 9);
    const canalBob = span(inCanal, (l) => l.craft.y);
    const canalRoll = span(inCanal, (l) => l.craft.roll * DEG);
    const canalDrift = span(inCanal, (l) => Math.hypot(l.craft.x - canalBoat.x, l.craft.z - canalBoat.z));
    note(`canal launch: bob ${canalBob.range.toFixed(3)} m, roll ${canalRoll.min.toFixed(1)}..${canalRoll.max.toFixed(1)} deg, drift ${canalDrift.max.toFixed(2)} m`);
    expect(canalBob.range, 'still moves on the water').toBeGreaterThan(0.01);
    expect(canalBob.range, 'the canal is calmer than the open marina').toBeLessThan(bob.range * 0.6);
    expect(canalRoll.range, 'the canal is calmer than the open marina').toBeLessThan(roll.range);
    expect(canalDrift.max, 'drift from the berth').toBeLessThan(0.4);
    // The marina launch, a long way off now, goes back to sleep at its berth.
    const asleep = await until(page, () => look(page, launch.id), (l) => l.craft.asleep === true, 'the far launch to go to sleep');
    expect(Math.hypot(asleep.craft.x - launch.x, asleep.craft.z - launch.z)).toBeLessThan(0.6);
    expectNoErrors(watch);
  });

  test('takes a skiff from the canal steps down the canal, up the creek and out onto the ocean swell', async ({ page }) => {
    const watch = watchConsole(page);
    const keys = new Keys(page);
    await openGame(page);
    const skiff = await mooredAt(page, 'boat', 49.5, -167);
    const id = skiff.id;

    // In the canal, a few strokes off the steps the skiff is tied beside.
    await page.evaluate(([x, z]) => window.__eyewall!.startAt(x!, z!, 0), [skiff.dock.x, -153]);
    await until(page, () => look(page, id), (l) => l.player.swimming === true && l.player.y > -1.8, 'the player to come up swimming');
    await keys.hold('KeyW');
    const stroke = await until(page, () => look(page, id), (l) => l.player.swimming === true && l.player.speed > 1.8, 'a swimming stroke');
    expect(stroke.player.anim.mode).toBe('swim');
    // Feet find the steps, and the player walks up out of the water to where the skiff can be boarded.
    const dry = await until(page, () => look(page, id), (l) => l.player.swimming === false && l.player.grounded === true && l.player.y > 0.15 && String(l.player.prompt).startsWith('Board'), 'the player to climb the steps to the skiff');
    await keys.release();
    expect(dry.player.prompt).toBe('Board skiff');
    expect(dry.player.vehicle).toBeNull();
    const rest = (await observe(page, id, 1.5)).map((l) => l.craft.y - l.sea);
    const restY = rest.reduce((a, b) => a + b, 0) / rest.length;
    await still(page, 'evidence/t08-canal-steps.png');
    const start = await look(page, id);

    await page.keyboard.press('KeyE');
    const aboard = await until(page, () => look(page, id), (l) => l.player.vehicle !== null && l.craft.occupied === true, 'the player to be aboard');
    expect(aboard.player.vehicle.kind).toBe('boat');
    expect(aboard.player.vehicle.driver).toBe(true);
    expect(aboard.player.vehicle.seat).toBe(0);
    expect(aboard.player.state).toBe('seated');
    expect(aboard.player.prompt).toBe('Get out');

    // Astern off the wall, bow swung round to the east.
    const log: Look[] = [];
    await backOut(page, keys, id, (c) => c.z > -161.5, EAST, log);
    expect(span(log, (l) => l.craft.speed).min, 'goes astern').toBeLessThan(-1.5);
    expect(Math.abs(turn(log[log.length - 1]!.craft.yaw, EAST)), 'bow to the east').toBeLessThan(0.35);

    // Down the canal on the plane.
    const canal: Look[] = [];
    await sail(page, keys, id, [{ x: 105, z: -155, reach: 8 }], canal);
    await keys.hold('KeyW');
    await still(page, 'evidence/t08-canal-planing.png');
    await sail(page, keys, id, [{ x: 150, z: -155, reach: 8 }], canal);
    const hump = span(canal.filter((l) => l.craft.speed > 2 && l.craft.speed < 12), (l) => l.craft.pitch * DEG);
    const fast = canal.filter((l) => l.craft.speed > 14);
    expect(fast.length, 'looks at speed in the canal').toBeGreaterThan(5);
    const trim = span(fast, (l) => l.craft.pitch * DEG);
    const lift = span(fast, (l) => l.craft.y - l.sea);
    const canalRoll = span(fast, (l) => Math.abs(l.craft.roll) * DEG);
    const canalPitch = span(fast, (l) => l.craft.pitch * DEG);
    const canalHeave = span(fast, (l) => l.craft.y);
    const canalTop = span(canal, (l) => l.craft.speed).max;
    note(`canal: top ${canalTop.toFixed(1)} m/s, bow up ${hump.max.toFixed(1)} deg over the hump then ${trim.mean.toFixed(1)} deg, rides ${(lift.mean - restY).toFixed(2)} m higher, roll ${canalRoll.mean.toFixed(1)} deg on average and ${canalRoll.max.toFixed(1)} at most`);
    expect(canalTop, 'speed in the canal').toBeGreaterThan(14);
    expect(span(canal, (l) => l.craft.planing).max, 'planing').toBeGreaterThan(0.85);
    expect(span(canal, (l) => l.craft.rpm).max, 'engine revs').toBeGreaterThan(0.7);
    expect(hump.max, 'the bow rises as the hull climbs onto the plane').toBeGreaterThan(3);
    expect(trim.mean, 'and settles once it is planing').toBeLessThan(hump.max - 1);
    expect(lift.mean - restY, 'the hull rides higher on the plane').toBeGreaterThan(0.08);
    // Flat water: the hull runs level but for the lean of a course correction.
    expect(canalRoll.mean, 'level on flat water').toBeLessThan(3);
    expect(canalRoll.max, 'level on flat water').toBeLessThan(15);

    // Ease off for the corner under the bridge, round into the creek, then flat out with the boost.
    const corner: Look[] = [];
    await sail(
      page,
      keys,
      id,
      [
        { x: 196, z: -155, reach: 4, pace: 10 },
        { x: 214, z: -190, reach: 8, pace: 10 },
        { x: 212, z: -245, reach: 12 },
      ],
      corner,
    );
    const lean = span(corner, (l) => l.craft.roll * DEG);
    note(`corner into the creek: roll ${lean.min.toFixed(1)}..${lean.max.toFixed(1)} deg`);
    expect(lean.min, 'banks into the turn to port').toBeLessThan(-2.5);
    const creek: Look[] = [];
    await sail(page, keys, id, [{ x: 212, z: -330, boost: true }], creek);
    await keys.hold('KeyW', 'ShiftLeft');
    await page.evaluate(() => window.__eyewall!.chase(7.5, 1.9, -4.5));
    await page.waitForTimeout(120);
    await still(page, 'evidence/t08-creek-boost.png');
    await page.evaluate(() => window.__eyewall!.chase());
    await sail(page, keys, id, [{ x: 212, z: -440, boost: true }, { x: 212, z: -535, boost: true }], creek);
    const creekTop = span(creek, (l) => l.craft.speed).max;
    note(`creek with the boost: top ${creekTop.toFixed(1)} m/s`);
    expect(creekTop, 'boosted speed').toBeGreaterThan(canalTop + 0.8);
    expect(creekTop, 'a speedboat, not a rocket').toBeLessThan(22.5);

    // Round the north end of the barrier island and out onto the open ocean.
    await sail(
      page,
      keys,
      id,
      [
        { x: 252, z: -620, reach: 12 },
        { x: 330, z: -630, reach: 14 },
        { x: 410, z: -630, reach: 14 },
        { x: 470, z: -598, reach: 12 },
      ],
      [],
    );
    const ocean: Look[] = [];
    await sail(page, keys, id, [{ x: 494, z: -520, reach: 12 }], ocean);
    await keys.hold('KeyW');
    await still(page, 'evidence/t08-ocean-swell.png');
    await sail(page, keys, id, [{ x: 494, z: -420, reach: 12 }], ocean);
    const swell = span(ocean, (l) => l.craft.pitch * DEG);
    const heave = span(ocean, (l) => l.craft.y);
    const oceanRoll = span(ocean, (l) => Math.abs(l.craft.roll) * DEG);
    const oceanSpeed = span(ocean, (l) => l.craft.speed);
    note(`ocean: pitch ${swell.min.toFixed(1)}..${swell.max.toFixed(1)} deg, heave ${heave.range.toFixed(2)} m (canal ${canalHeave.range.toFixed(2)} m), roll under ${oceanRoll.max.toFixed(1)} deg, speed ${oceanSpeed.min.toFixed(1)}..${oceanSpeed.max.toFixed(1)} m/s`);
    expect(swell.range, 'the hull pitches over the swell').toBeGreaterThan(5);
    expect(swell.range, 'far more than on the canal').toBeGreaterThan(canalPitch.range * 1.5);
    expect(heave.range, 'and rises and falls with it').toBeGreaterThan(0.4);
    expect(heave.range, 'far more than on the canal').toBeGreaterThan(canalHeave.range * 2);
    expect(oceanRoll.max, 'stays upright').toBeLessThan(40);
    expect(oceanSpeed.mean, 'keeps its speed in a seaway').toBeGreaterThan(10);

    // The wake and the spray it threw on the way.
    const end = await look(page, id);
    expect(end.fx.wake - start.fx.wake, 'wake bursts').toBeGreaterThan(60);
    expect(end.fx.spray - start.fx.spray, 'spray bursts').toBeGreaterThan(20);
    expect(end.craft.health, 'the hull came through whole').toBeGreaterThan(0);

    // Stop out there and go over the side: deep water, so the player swims.
    await stop(page, keys, id, 1.5);
    await page.keyboard.press('KeyE');
    const over = await until(page, () => look(page, id), (l) => l.player.vehicle === null && l.player.swimming === true && l.craft.occupied === false, 'the player to be swimming beside the skiff');
    expect(over.player.state).toBe('normal');
    expect(Math.hypot(over.player.x - over.craft.x, over.player.z - over.craft.z), 'beside the hull').toBeLessThan(5);
    // From the water beside the hull the way back aboard is on offer.
    await until(page, () => look(page, id), (l) => String(l.player.prompt).startsWith('Board'), 'the offer to climb back aboard from the water', 10_000);
    await keys.hold('KeyW');
    const away = await until(page, () => look(page, id), (l) => Math.hypot(l.player.x - over.player.x, l.player.z - over.player.z) > 3, 'the player to swim off');
    await keys.release();
    expect(away.player.swimming).toBe(true);
    expect(away.player.anim.mode).toBe('swim');
    await still(page, 'evidence/t08-ocean-overboard.png');
    expectNoErrors(watch);
  });

  test('swims to a jet ski, rides it out on the bay leaning into a hard turn, and steps off onto the pier', async ({ page }) => {
    const watch = watchConsole(page);
    const keys = new Keys(page);
    await openGame(page);
    const ski = await mooredAt(page, 'jetski', -341, 66.5);
    const id = ski.id;
    const pier = { x0: -372, x1: -320, z0: 68.4, z1: 71.6, y: 1.15 };

    // On the pier with a pistol in hand and a second gun to switch to.
    await page.evaluate(([x, z]) => window.__eyewall!.startAt(x!, z!, 0), [ski.x - 1.9, 70]);
    await until(page, () => look(page, id), (l) => l.player.grounded === true, 'the player to stand on the pier');
    await page.evaluate(() => {
      window.__eyewall!.give('pistol');
      window.__eyewall!.give('smg');
    });
    await until(page, () => weapon(page), (w) => w.id === 'pistol' && w.drawing === false, 'the pistol to be drawn');

    // Off the edge beside the ski, and aboard from the water.
    await keys.hold('KeyW');
    await until(page, () => look(page, id), (l) => l.player.swimming === true, 'the player to drop into the water');
    await keys.release();
    const wet = await until(page, () => look(page, id), (l) => l.player.swimming === true && String(l.player.prompt).startsWith('Ride'), 'the Ride prompt from the water');
    expect(wet.player.prompt).toBe('Ride jet ski');
    const start = wet;
    await page.keyboard.press('KeyE');
    const aboard = await until(page, () => look(page, id), (l) => l.player.vehicle !== null && l.craft.occupied === true, 'the player to be on the ski');
    expect(aboard.player.vehicle.kind).toBe('jetski');
    expect(aboard.player.vehicle.driver).toBe(true);
    expect(aboard.player.state).toBe('seated');
    expect(aboard.player.swimming).toBe(false);

    // The number keys do nothing from the saddle.
    await page.keyboard.press('Digit2');

    // Astern out of the berth, bow swung round to the west, towards the bay.
    const log: Look[] = [];
    await backOut(page, keys, id, (c) => c.z < 61, WEST, log);
    expect(span(log, (l) => l.craft.speed).min, 'goes astern').toBeLessThan(-1.5);

    // Flat out from a standstill.
    const from = await look(page, id);
    await keys.hold('KeyW');
    const dash: Look[] = [];
    await sail(page, keys, id, [{ x: -398, z: 52, reach: 8 }], dash);
    const at15 = dash.find((l) => l.craft.speed > 15);
    expect(at15, 'the ski passes 15 m/s on the way out of the marina').toBeDefined();
    note(`jet ski: 0 to 15 m/s in ${(at15!.time - from.time).toFixed(2)} s`);
    expect(at15!.time - from.time, 'seconds to 15 m/s').toBeLessThan(4.6);
    expect(at15!.craft.planing, 'planing').toBeGreaterThan(0.85);

    // South down the bay with the boost.
    const run: Look[] = [];
    await sail(
      page,
      keys,
      id,
      [
        { x: -410, z: 120, reach: 12, boost: true },
        { x: -410, z: 225, reach: 12, boost: true },
      ],
      run,
    );
    const top = span(run, (l) => l.craft.speed).max;
    note(`jet ski: top ${top.toFixed(1)} m/s with the boost`);
    expect(top, 'quicker than a speedboat').toBeGreaterThan(19.5);
    expect(top, 'a jet ski, not a rocket').toBeLessThan(26.5);

    // Hard round to port and back up the bay: the ski lies over into the turn.
    const round: Look[] = [];
    let pictured = false;
    await sail(page, keys, id, [{ x: -384, z: 160, reach: 14 }], round, async (l) => {
      if (pictured || l.craft.roll * DEG > -18) return;
      pictured = true;
      await still(page, 'evidence/t08-jetski-lean.png');
    });
    const lean = span(round, (l) => l.craft.roll * DEG);
    const through = span(round, (l) => l.craft.speed);
    note(`jet ski turn: roll down to ${lean.min.toFixed(1)} deg, slowest ${through.min.toFixed(1)} m/s`);
    expect(lean.min, 'leans to port in a turn to port').toBeLessThan(-15);
    expect(lean.min, 'without going over').toBeGreaterThan(-60);
    expect(through.min, 'carries speed through the turn').toBeGreaterThan(5);
    expect(Math.abs(turn(round[round.length - 1]!.craft.yaw, NORTH)), 'came about').toBeLessThan(0.9);

    // Up to the end of the pier it came from, gently, and step off.
    await sail(
      page,
      keys,
      id,
      [
        { x: -392, z: 104, reach: 8, pace: 9 },
        { x: -391, z: 80, reach: 4, pace: 5 },
        { x: -381, z: 70, reach: 2.5, pace: 3 },
        { x: pier.x0 - 2.6, z: 70, reach: 0.4, pace: 1.6 },
      ],
      [],
    );
    const stopped = await stop(page, keys, id, 0.6);
    expect(pier.x0 - stopped.craft.x, 'metres off the pier head').toBeLessThan(4);
    expect((await weapon(page)).id, 'the number key was ignored in the saddle').toBe('pistol');
    await page.keyboard.press('KeyE');
    const ashore = await until(page, () => look(page, id), (l) => l.player.vehicle === null && l.player.grounded === true, 'the player to stand after getting off');
    expect(ashore.player.swimming).toBe(false);
    expect(ashore.player.x, 'on the pier').toBeGreaterThan(pier.x0 - 0.2);
    expect(ashore.player.x, 'on the pier').toBeLessThan(pier.x1);
    expect(ashore.player.z, 'on the pier').toBeGreaterThan(pier.z0 - 0.2);
    expect(ashore.player.z, 'on the pier').toBeLessThan(pier.z1 + 0.2);
    expect(Math.abs(ashore.player.y - pier.y), 'on the pier deck').toBeLessThan(0.25);
    expect(ashore.craft.occupied).toBe(false);
    await still(page, 'evidence/t08-jetski-ashore.png');
    // Back on foot the number keys work again.
    await page.keyboard.press('Digit2');
    await until(page, () => weapon(page), (w) => w.id === 'smg', 'the second gun to come out');

    const end = await look(page, id);
    expect(end.fx.wake - start.fx.wake, 'wake bursts').toBeGreaterThan(30);
    expect(end.fx.spray - start.fx.spray, 'spray bursts').toBeGreaterThan(10);
    expectNoErrors(watch);
  });
});
