import { type Browser, type BrowserContext, expect, type Page, test } from '@playwright/test';
import { type ConsoleWatch, expectNoErrors, openGame, watchConsole } from './helpers';

type Rec = Record<string, any>;

/** Several games share one GPU here, so each window is small. */
const W = 640;
const H = 360;

interface Friend {
  ctx: BrowserContext;
  page: Page;
  watch: ConsoleWatch;
  pointer: { x: number; y: number };
}

async function friend(browser: Browser, query = ''): Promise<Friend> {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  const watch = watchConsole(page);
  await openGame(page, query);
  return { ctx, page, watch, pointer: { x: W / 2, y: H / 2 } };
}

const room = (p: Page): Promise<Rec | null> => p.evaluate(() => window.__eyewall!.ext['friends']());
const me = (p: Page): Promise<Rec> => p.evaluate(() => window.__eyewall!.player()!);
const match = (p: Page): Promise<Rec> => p.evaluate(() => window.__eyewall!.match());

/** Open the friends panel and create a room. Returns its code. */
async function createRoom(f: Friend, name: string): Promise<string> {
  await f.page.click('#friends');
  await f.page.fill('.friends-name', name);
  await f.page.click('.friends-create');
  const code = (await f.page.locator('.friends-code-big').textContent({ timeout: 20_000 }))!.trim();
  expect(code).toMatch(/^[A-Z]{4}$/);
  return code;
}

/** Open the invite link in a fresh browser and join under a name. */
async function joinByLink(browser: Browser, link: string, name: string): Promise<Friend> {
  const query = new URL(link).search.slice(1);
  const f = await friend(browser, query);
  await expect(f.page.locator('.friends-code')).toHaveValue(new URL(link).searchParams.get('room')!);
  await f.page.fill('.friends-name', name);
  await f.page.click('.friends-join');
  return f;
}

async function names(p: Page): Promise<string[]> {
  return p.locator('.friends-player-name').allTextContents();
}

/** The host starts the round; wait until every browser is in it and hears everyone else. */
async function startRound(host: Friend, guests: Friend[]): Promise<void> {
  await host.page.click('.friends-start');
  for (const f of [host, ...guests]) {
    await expect.poll(async () => (await room(f.page))?.running, { timeout: 30_000 }).toBe(true);
    await expect.poll(async () => (await room(f.page))!.bodies.every((b: Rec) => b.heard > 5), { timeout: 30_000 }).toBe(true);
    await f.page.evaluate(() => window.__eyewall!.setFreeLook(true));
    await f.page.mouse.move(W / 2 - 10, H / 2);
    await f.page.mouse.move(W / 2, H / 2);
    f.pointer = { x: W / 2, y: H / 2 };
  }
}

/** Turn one player's view with the mouse until the crosshair sits on a world point. */
async function aimAt(f: Friend, x: number, y: number, z: number, tolerance = 0.004): Promise<void> {
  const p = f.page;
  for (let i = 0; i < 60; i++) {
    const a = await p.evaluate(([px, py, pz]) => window.__eyewall!.aimAt(px!, py!, pz!), [x, y, z]);
    if (Math.abs(a.yaw) < tolerance && Math.abs(a.pitch) < tolerance) return;
    if (f.pointer.x < 140 || f.pointer.x > W - 140 || f.pointer.y < 70 || f.pointer.y > H - 70) {
      await p.evaluate(() => window.__eyewall!.setFreeLook(false));
      await p.mouse.move(W / 2, H / 2);
      await p.evaluate(() => window.__eyewall!.setFreeLook(true));
      await p.mouse.move(W / 2 - 1, H / 2);
      await p.mouse.move(W / 2, H / 2);
      f.pointer = { x: W / 2, y: H / 2 };
    }
    const step = (v: number): number => Math.max(-90, Math.min(90, v));
    const dx = Math.abs(a.dx) < 0.5 ? 0 : Math.round(step(a.dx)) || Math.sign(a.dx);
    const dy = Math.abs(a.dy) < 0.5 ? 0 : Math.round(step(a.dy)) || Math.sign(a.dy);
    if (dx === 0 && dy === 0) return;
    f.pointer.x += dx;
    f.pointer.y += dy;
    await p.mouse.move(f.pointer.x, f.pointer.y);
    await p.waitForTimeout(50);
  }
  throw new Error('could not bring the crosshair onto the target');
}

/** Aim at another player's chest as this browser sees them, and pull the trigger once. */
async function shootAt(f: Friend, slot: number): Promise<void> {
  const b = (await room(f.page))!.bodies.find((x: Rec) => x.slot === slot);
  await aimAt(f, b.x, b.y + 1.25, b.z);
  await f.page.mouse.down();
  await f.page.waitForTimeout(70);
  await f.page.mouse.up();
}

async function close(...fs: Friend[]): Promise<void> {
  for (const f of fs) await f.ctx.close().catch(() => {});
}

test.describe('friends mode', () => {
  test.describe.configure({ timeout: 420_000 });

  test('room: create, invite link, join, full', async ({ browser }) => {
    const host = await friend(browser);
    const code = await createRoom(host, 'Marisol');
    const link = await host.page.locator('.friends-link').inputValue();
    expect(link).toContain(`room=${code}`);

    const guests: Friend[] = [];
    for (const name of ['Teo', 'Ines', 'Rafa']) {
      const t0 = Date.now();
      const g = await joinByLink(browser, link, name);
      guests.push(g);
      await expect.poll(() => names(host.page), { timeout: 10_000 }).toContain(name);
      await expect.poll(() => names(g.page), { timeout: 10_000 }).toContain('Marisol');
      console.log(`${name} in both lists after ${((Date.now() - t0) / 1000).toFixed(1)} s (from page load)`);
    }
    expect(await names(host.page)).toEqual(['Marisol', 'Teo', 'Ines', 'Rafa']);

    // A fifth player is turned away with a message.
    const fifth = await joinByLink(browser, link, 'Quinto');
    await expect(fifth.page.locator('.friends-error')).toContainText('full', { timeout: 15_000 });
    expect(await names(host.page)).toHaveLength(4);

    // Joining by typing the code works too, once a seat is free.
    await guests[2]!.page.click('.friends-leave');
    await expect.poll(() => names(host.page), { timeout: 10_000 }).not.toContain('Rafa');
    await fifth.page.fill('.friends-code', code);
    await fifth.page.click('.friends-join');
    await expect.poll(() => names(host.page), { timeout: 10_000 }).toContain('Quinto');

    const r = (await room(host.page))!;
    console.log('transports at the host:', r.transports.join(', '));

    // A guest who played a round and closed the room leaves nothing behind for single player.
    await host.page.click('.friends-start');
    await expect.poll(async () => (await room(guests[0]!.page))?.running, { timeout: 30_000 }).toBe(true);
    await host.page.keyboard.press('Escape');
    await host.page.click('.pause-back');
    await expect(guests[0]!.page.locator('.friends-error')).toContainText('closed', { timeout: 15_000 });
    const leftovers = await guests[0]!.page.evaluate(() =>
      window.__eyewall!.game.characters.filter((c) => c.remote).map((c) => ({ alive: c.alive, visible: c.rig.root.visible, state: c.state })),
    );
    expect(leftovers.length).toBeGreaterThan(0);
    for (const c of leftovers) expect(c).toEqual({ alive: false, visible: false, state: 'plane' });
    await guests[0]!.page.evaluate(() => window.__eyewall!.startAt(-60, 13, 0));
    expect((await match(guests[0]!.page)).running).toBe(false);
    expect(await guests[0]!.page.evaluate(() => window.__eyewall!.game.hurtGate === null && window.__eyewall!.game.roundHooks === null)).toBe(true);
    for (const f of [host, ...guests, fifth]) expectNoErrors(f.watch);
    await close(host, ...guests, fifth);
  });

  test('move: friends see each other move, shoot, hit and the same winner', async ({ browser }) => {
    const host = await friend(browser);
    await createRoom(host, 'Marisol');
    const link = await host.page.locator('.friends-link').inputValue();
    const guest = await joinByLink(browser, link, 'Teo');
    await expect.poll(() => names(host.page), { timeout: 10_000 }).toContain('Teo');
    await startRound(host, [guest]);

    // Both are on foot with the same kit, in each other's view.
    const hb = (await room(host.page))!.bodies;
    expect(hb).toHaveLength(1);
    expect(hb[0].name).toBe('Teo');
    expect(hb[0].weapon).toBe('rifle');
    expect((await room(guest.page))!.bodies[0].name).toBe('Marisol');

    // The guest backs away from the middle. While moving, the host's picture of them stays close behind.
    await guest.page.keyboard.down('KeyS');
    await guest.page.waitForTimeout(1200);
    const running: number[] = [];
    for (let i = 0; i < 6; i++) {
      const [mine, seen] = await Promise.all([me(guest.page), room(host.page)]);
      const b = seen!.bodies[0];
      running.push(Math.hypot(mine.x - b.x, mine.z - b.z));
      await guest.page.waitForTimeout(150);
    }
    await guest.page.keyboard.up('KeyS');
    console.log('gap while running, m:', running.map((d) => d.toFixed(2)).join(' '));
    expect(Math.max(...running)).toBeLessThan(4);
    await guest.page.waitForTimeout(800);
    const still = await me(guest.page);
    const seen = (await room(host.page))!.bodies[0];
    const gap = Math.hypot(still.x - seen.x, still.y - seen.y, still.z - seen.z);
    console.log(`gap after stopping: ${gap.toFixed(2)} m`);
    expect(gap).toBeLessThan(1.5);
    expect(Math.hypot(still.vx, still.vz)).toBeLessThan(0.5);
    // It moved at all.
    expect(Math.hypot(seen.x - hb[0].x, seen.z - hb[0].z)).toBeGreaterThan(2);

    // The guest shoots the host: the host decides, and both screens agree on the damage.
    const hostBefore = (await me(host.page)).health;
    for (let i = 0; i < 6 && (await me(host.page)).health === hostBefore; i++) {
      await shootAt(guest, 0);
      await host.page.waitForTimeout(400);
    }
    const hostAfter = (await me(host.page)).health;
    expect(hostAfter).toBeLessThan(hostBefore);
    await expect.poll(async () => (await room(guest.page))!.bodies[0].health, { timeout: 5000 }).toBe(hostAfter);
    expect((await room(host.page))!.shotsSeen, 'the guest’s tracers drawn on the host’s screen').toBeGreaterThan(0);
    console.log(`guest hit host: ${hostBefore} -> ${hostAfter}`);

    // The host shoots back until the guest is down.
    const guestBefore = (await me(guest.page)).health;
    for (let i = 0; i < 30 && (await me(guest.page)).alive; i++) {
      await shootAt(host, 1);
      await host.page.waitForTimeout(250);
    }
    const g = await me(guest.page);
    expect(g.alive).toBe(false);
    expect((await room(guest.page))!.shotsSeen, 'the host’s tracers drawn on the guest’s screen').toBeGreaterThan(0);
    expect((await room(host.page))!.bodies[0].alive).toBe(false);
    console.log(`host downed guest from ${guestBefore}`);

    // One left: both browsers call the same winner, and both kill feeds have the kill.
    for (const f of [host, guest]) {
      await expect.poll(async () => (await match(f.page)).result?.winner ?? null, { timeout: 15_000 }).not.toBeNull();
    }
    const hr = await match(host.page);
    const gr = await match(guest.page);
    expect(hr.result.won).toBe(true);
    expect(gr.result.won).toBe(false);
    expect(gr.result.winner).toBe('Marisol');
    expect(hr.feed.some((l: Rec) => l.victim === 'Teo' && l.killer === 'You')).toBe(true);
    expect(gr.feed.some((l: Rec) => l.victim === 'You' && l.killer === 'Marisol')).toBe(true);
    await expect(host.page.locator('.result-card')).toBeVisible({ timeout: 15_000 });
    await expect(guest.page.locator('.result-card')).toBeVisible({ timeout: 15_000 });
    expect((await room(host.page))!.refusedClaims).toBe(0);
    for (const f of [host, guest]) expectNoErrors(f.watch);
    await close(host, guest);
  });

  test('car: the driver’s car moves on the other screen and its seat is taken', async ({ browser }) => {
    const host = await friend(browser);
    await createRoom(host, 'Marisol');
    const link = await host.page.locator('.friends-link').inputValue();
    const guest = await joinByLink(browser, link, 'Teo');
    await expect.poll(() => names(host.page), { timeout: 10_000 }).toContain('Teo');
    await startRound(host, [guest]);

    // The host walks up to the nearest parked car and gets in.
    const start = await me(host.page);
    const parked: Rec = await host.page.evaluate(([x, z]) => window.__eyewall!.ext.cars.nearestParked(x, z), [start.x, start.z]);
    expect(parked).not.toBeNull();
    const yaw = parked.yaw as number;
    // Beside the driver's door (the car's left), facing it.
    const sx = parked.x - Math.cos(yaw) * 3;
    const sz = parked.z + Math.sin(yaw) * 3;
    await host.page.evaluate(([x, z, y]) => {
      const g = window.__eyewall!.game;
      const h = g.physics.groundHeight(x!, 200, z!, 400, 0);
      g.player!.teleport(x!, h + 0.05, z!, y);
      g.camera.yaw = y!;
    }, [sx, sz, Math.atan2(sx - parked.x, sz - parked.z)]);
    await expect.poll(async () => String((await me(host.page)).prompt), { timeout: 10_000 }).toMatch(/^Drive/);
    await host.page.keyboard.press('KeyE');
    await expect.poll(async () => (await me(host.page)).vehicle?.driver ?? false, { timeout: 10_000 }).toBe(true);
    await expect.poll(async () => (await room(guest.page))!.bodies[0].vehicle, { timeout: 10_000 }).toBeGreaterThanOrEqual(0);
    const vi = (await room(guest.page))!.bodies[0].vehicle as number;

    // Drive. The guest sees the car where the host has it.
    const carOnGuest = (): Promise<Rec> =>
      guest.page.evaluate((i) => {
        const v = window.__eyewall!.game.vehicles[i]!;
        return { x: v.position.x, y: v.position.y, z: v.position.z, remote: v.remoteDriven };
      }, vi);
    await host.page.keyboard.down('KeyW');
    await host.page.waitForTimeout(1500);
    const driving: number[] = [];
    for (let i = 0; i < 5; i++) {
      const [h, gcar] = await Promise.all([me(host.page), carOnGuest()]);
      driving.push(Math.hypot(h.vehicle.x - gcar.x, h.vehicle.z - gcar.z));
      await host.page.waitForTimeout(150);
    }
    await host.page.keyboard.up('KeyW');
    await host.page.keyboard.down('Space');
    await host.page.waitForTimeout(2000);
    await host.page.keyboard.up('Space');
    const h = await me(host.page);
    const gcar = await carOnGuest();
    const moved = Math.hypot(h.vehicle.x - parked.x, h.vehicle.z - parked.z);
    const gap = Math.hypot(h.vehicle.x - gcar.x, h.vehicle.z - gcar.z);
    console.log(`car moved ${moved.toFixed(1)} m; gap while driving ${driving.map((d) => d.toFixed(2)).join(' ')}; gap stopped ${gap.toFixed(2)} m`);
    expect(moved).toBeGreaterThan(4);
    expect(gcar.remote).toBe(true);
    expect(Math.max(...driving)).toBeLessThan(3);
    expect(gap).toBeLessThan(3);
    // The driver sits in it on the guest's screen too.
    const body = (await room(guest.page))!.bodies[0];
    expect(Math.hypot(body.x - gcar.x, body.z - gcar.z)).toBeLessThan(3);

    // The guest comes to the same car: the wheel is taken, so they can only ride.
    await guest.page.evaluate((i) => {
      const g = window.__eyewall!.game;
      const v = g.vehicles[i]!;
      // Beside the passenger door (the car's right), facing the car.
      const x = v.position.x + Math.cos(v.yaw) * 2.1;
      const z = v.position.z - Math.sin(v.yaw) * 2.1;
      const hgt = g.physics.groundHeight(x, v.position.y + 3, z, 10, 0);
      const yaw = Math.atan2(x - v.position.x, z - v.position.z);
      g.player!.teleport(x, hgt + 0.05, z, yaw);
      g.camera.yaw = yaw;
    }, vi);
    await expect.poll(async () => String((await me(guest.page)).prompt), { timeout: 10_000 }).not.toBe('');
    const offer = String((await me(guest.page)).prompt);
    console.log(`guest at the car is offered: ${offer}`);
    expect(offer).toMatch(/^Ride in/);
    await guest.page.keyboard.press('KeyE');
    await expect.poll(async () => (await me(guest.page)).vehicle?.seat ?? -1, { timeout: 10_000 }).toBeGreaterThan(0);
    expect((await me(guest.page)).vehicle.driver).toBe(false);
    // The host's browser agrees: the guest rides, the host still drives.
    await expect.poll(async () => (await room(host.page))!.bodies[0].seat, { timeout: 10_000 }).toBeGreaterThan(0);
    expect((await me(host.page)).vehicle.driver).toBe(true);
    for (const f of [host, guest]) expectNoErrors(f.watch);
    await close(host, guest);
  });

  test('rejoin: away, back with the same health, out after the grace, room closes with the host', async ({ browser }) => {
    const host = await friend(browser);
    await createRoom(host, 'Marisol');
    const link = await host.page.locator('.friends-link').inputValue();
    const guest = await joinByLink(browser, link, 'Teo');
    await expect.poll(() => names(host.page), { timeout: 10_000 }).toContain('Teo');
    await startRound(host, [guest]);

    // The host lands a hit, so the guest has something to come back with.
    for (let i = 0; i < 8 && (await me(guest.page)).health === 100; i++) {
      await shootAt(host, 1);
      await host.page.waitForTimeout(400);
    }
    const hurt = await me(guest.page);
    expect(hurt.health).toBeLessThan(100);
    expect(hurt.alive).toBe(true);

    // The guest closes the page: the host shows them away.
    await guest.page.close();
    await expect.poll(async () => (await room(host.page))!.players.find((p: Rec) => p.slot === 1)?.away, { timeout: 15_000 }).toBe(true);
    await expect(host.page.locator('.friends-tag')).toContainText('away: Teo');

    // Back through the same link in the same browser: the same round, the same health.
    const back = await guest.ctx.newPage();
    guest.page = back;
    guest.watch = watchConsole(back);
    await openGame(back, new URL(link).search.slice(1));
    await expect.poll(async () => (await room(back))?.running ?? false, { timeout: 30_000 }).toBe(true);
    const again = await me(back);
    expect(again.health).toBe(hurt.health);
    expect(Math.hypot(again.x - hurt.x, again.z - hurt.z)).toBeLessThan(1.5);
    await expect.poll(async () => (await room(host.page))!.players.find((p: Rec) => p.slot === 1)?.away, { timeout: 10_000 }).toBe(false);
    expect((await room(host.page))!.round).toBe((await room(back))!.round);

    // Gone for good: after the grace the guest is out, and the host is the last one standing.
    await back.close();
    await expect.poll(async () => (await room(host.page))!.players.length, { timeout: 50_000, intervals: [1000] }).toBe(1);
    await expect.poll(async () => (await match(host.page)).result?.won ?? null, { timeout: 15_000 }).toBe(true);

    // A new guest joins the room; when the host leaves, they are told the room closed.
    const late = await joinByLink(browser, link, 'Ines');
    await expect.poll(() => names(late.page), { timeout: 10_000 }).toContain('Marisol');
    await host.page.close();
    await expect(late.page.locator('.friends-error')).toContainText('closed', { timeout: 15_000 });
    expectNoErrors(late.watch);
    await close(host, guest, late);
  });
});
