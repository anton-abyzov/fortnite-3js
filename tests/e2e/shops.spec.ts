import { expect, type Page, test } from '@playwright/test';
import { canvasVariety, expectNoErrors, openGame, watchConsole } from './helpers';

type Rec = Record<string, any>;

interface Point {
  x: number;
  z: number;
}

/** Something in a shop that the interact key uses, with the way to walk to it from the shop's aisle. */
interface Thing {
  kind: string;
  x: number;
  y: number;
  z: number;
  standX: number;
  standZ: number;
  outside: boolean;
  route: Point[];
}

interface Shop {
  id: number;
  type: string;
  name: string;
  door: { x: number; z: number; yaw: number };
  inside: { x: number; y: number; z: number };
  outside: { x: number; y: number; z: number };
  counter: { x: number; y: number; z: number };
  rect: { x0: number; z0: number; x1: number; z1: number };
  ceiling: number;
  doorWidth: number;
  furniture: Record<string, number>;
  interactables: Thing[];
}

const player = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.player()!);
const shopList = (page: Page): Promise<Shop[]> => page.evaluate(() => window.__eyewall!.ext['shops'].list() as Shop[]);
const where = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.ext['shops'].where() as Rec);
const panel = (page: Page): Promise<Rec | null> => page.evaluate(() => window.__eyewall!.ext['shops'].panel() as Rec | null);
const gameTime = (page: Page): Promise<number> => page.evaluate(() => window.__eyewall!.state()['time'] as number);

const MOVE_KEYS = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'AltLeft'] as const;

/**
 * Walk to a point on the ground with the movement keys, steering by where the player is each moment
 * (the view is never turned, so the keys keep their directions). Slows to a walk for the last metre.
 */
async function walkTo(page: Page, x: number, z: number, tolerance = 0.3): Promise<void> {
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
    for (const code of MOVE_KEYS) if (down.has(code)) await page.keyboard.up(code);
  }
  await expect.poll(async () => (await player(page))['speed'], { message: 'comes to a stop' }).toBeLessThan(0.1);
}

/** From the shop's aisle to the place to stand at a thing, and wait for it to offer itself. */
async function walkUpTo(page: Page, thing: Thing, offer: string): Promise<void> {
  for (const p of thing.route) await walkTo(page, p.x, p.z);
  await expect.poll(async () => (await player(page))['prompt'], { message: `the ${thing.kind} offers itself` }).toContain(offer);
}

/** Back the way we came, to the aisle. */
async function walkBack(page: Page, thing: Thing): Promise<void> {
  for (let i = thing.route.length - 2; i >= 0; i--) await walkTo(page, thing.route[i]!.x, thing.route[i]!.z);
}

/** Headless browsers cannot lock the pointer; without this the page would show its "click to play" card. */
async function start(page: Page): Promise<Shop[]> {
  await openGame(page);
  await page.evaluate(() => window.__eyewall!.setFreeLook(true));
  return shopList(page);
}

/** Put the player just inside a shop's door, facing in, as if they had walked in. */
async function enter(page: Page, shop: Shop): Promise<void> {
  expect(await page.evaluate((id) => window.__eyewall!.ext['shops'].enter(id) as boolean, shop.id)).toBe(true);
  await expect.poll(async () => (await where(page))['shop']).toBe(shop.id);
  await expect.poll(async () => (await player(page))['grounded']).toBe(true);
}

function pick(list: Shop[], type: string): Shop {
  const shop = list.find((s) => s.type === type);
  if (!shop) throw new Error(`no ${type} in the city`);
  return shop;
}

function thingOf(shop: Shop, kind: string, index = 0): Thing {
  const thing = shop.interactables.filter((t) => t.kind === kind)[index];
  if (!thing) throw new Error(`${shop.name} has no ${kind} #${index}`);
  return thing;
}

test.describe('shops', () => {
  test('every shop has a furnished room, and the player walks in, buys at the counter and is refused without the cash', async ({ page }) => {
    test.setTimeout(300_000);
    const watch = watchConsole(page);
    const list = await start(page);

    // A room behind every shopfront in the city, of every trade, each with its furniture.
    const census = await page.evaluate(() => window.__eyewall!.census());
    expect(list.length).toBe(census['shops']);
    expect(list.length).toBeGreaterThanOrEqual(12);
    expect(new Set(list.map((s) => s.type)).size).toBe(6);
    for (const s of list) {
      const pieces = Object.values(s.furniture).reduce((a, b) => a + b, 0);
      expect(pieces, `${s.name} is furnished`).toBeGreaterThanOrEqual(15);
      expect(s.furniture['counter'], `${s.name} has a counter`).toBe(1);
      expect(s.furniture['poster'] ?? 0, `${s.name} has posters`).toBeGreaterThanOrEqual(2);
      expect(s.interactables.filter((t) => t.kind !== 'counter').length, `${s.name} has things to use`).toBeGreaterThanOrEqual(2);
    }
    const kinds = new Set(list.flatMap((s) => s.interactables.map((t) => t.kind)));
    for (const kind of ['counter', 'fridge', 'seat', 'jukebox', 'booth', 'vending']) expect(kinds, `some shop has a ${kind}`).toContain(kind);

    // On the sidewalk in front of the door, facing it.
    const shop = pick(list, 'ammo');
    await page.evaluate((s) => window.__eyewall!.startAt(s.outside.x, s.outside.z, s.door.yaw), shop);
    await expect.poll(async () => (await player(page))['grounded']).toBe(true);
    const outside = await player(page);
    expect((await page.evaluate(([x, z]) => window.__eyewall!.probe(x!, z!), [outside['x'], outside['z']]))['type']).toBe('sidewalk');
    expect((await where(page))['shop']).toBeNull();
    expect((await where(page))['ceiling'], 'open sky over the sidewalk').toBeNull();

    // Hold forward: through the doorway, which has no step and never shuts on anyone.
    await page.keyboard.down('KeyW');
    await expect.poll(async () => (await where(page))['shop'], { message: 'walks in through the door' }).toBe(shop.id);
    await page.keyboard.up('KeyW');
    const inside = await player(page);
    expect(inside['x']).toBeGreaterThan(shop.rect.x0);
    expect(inside['x']).toBeLessThan(shop.rect.x1);
    expect(inside['z']).toBeGreaterThan(shop.rect.z0);
    expect(inside['z']).toBeLessThan(shop.rect.z1);
    // Same floor as the sidewalk, and a ceiling overhead with room for the camera.
    expect(Math.abs(inside['y'] - outside['y'])).toBeLessThan(0.08);
    const here = await where(page);
    expect(here['ceiling']).toBeGreaterThan(3);
    expect(here['ceiling']).toBeLessThan(4.5);
    expect(here['door'], 'the door stood open').toBeGreaterThan(0.5);
    expect(here['bells'], 'the bell rang').toBeGreaterThanOrEqual(1);

    // A look round from the middle of the room.
    const counter = thingOf(shop, 'counter');
    await walkTo(page, counter.route[0]!.x, counter.route[0]!.z);
    expect(await canvasVariety(page)).toBeGreaterThan(0.2);
    await page.screenshot({ path: 'evidence/t09-interior.png' });

    // To the counter: the interact key opens the list.
    await walkUpTo(page, counter, 'Shop at');
    await page.keyboard.press('KeyE');
    await expect.poll(() => panel(page)).not.toBeNull();
    await expect(page.locator('.shop-panel.show')).toBeVisible();
    await expect(page.locator('.shop-name')).toHaveText(shop.name);
    const before = await player(page);
    await expect(page.locator('.shop-cash')).toHaveText(`$${before['cash']}`);
    await expect(page.locator('.shop-row')).toHaveCount(10);
    // The page does not call an open counter a pause.
    await expect(page.locator('.pause')).toBeHidden();

    // Buy with a number key.
    await page.keyboard.press('Digit1');
    await expect.poll(async () => (await player(page))['cash']).toBe(before['cash'] - 120);
    expect((await player(page))['items']['pistol']).toBe(1);
    await expect(page.locator('.shop-cash')).toHaveText(`$${before['cash'] - 120}`);
    await expect(page.locator('.shop-message')).toContainText('Sold');

    // Buy with a click.
    await page.locator('.shop-row[data-item="ammo_light"]').click();
    await expect.poll(async () => (await player(page))['cash']).toBe(before['cash'] - 150);
    expect((await player(page))['items']['ammo_light']).toBe(36);

    // Too little cash for the long rifle: refused, and nothing changes hands.
    const cash = (await player(page))['cash'] as number;
    expect(cash).toBeLessThan(520);
    await page.keyboard.press('Digit5');
    await expect.poll(async () => (await panel(page))?.['refused']).toBe(true);
    await expect(page.locator('.shop-message.refused')).toContainText('Not enough cash');
    expect((await player(page))['cash']).toBe(cash);
    expect((await player(page))['items']['sniper']).toBeUndefined();
    // And a second sidearm is refused too: there is no room for it.
    await page.keyboard.press('Digit1');
    await expect(page.locator('.shop-message.refused')).toContainText('already carry');
    expect((await player(page))['cash']).toBe(cash);

    // While the list is open the player stays put.
    const stood = await player(page);
    const t0 = await gameTime(page);
    await page.keyboard.down('KeyS');
    await expect.poll(() => gameTime(page)).toBeGreaterThan(t0 + 0.6);
    await page.keyboard.up('KeyS');
    const held = await player(page);
    expect(Math.hypot(held['x'] - stood['x'], held['z'] - stood['z'])).toBeLessThan(0.02);

    // The interact key closes it and gives the controls back.
    await page.keyboard.press('KeyE');
    await expect.poll(() => panel(page)).toBeNull();
    await expect(page.locator('.shop-panel')).toBeHidden();
    await page.keyboard.down('KeyS');
    await expect.poll(async () => {
      const p = await player(page);
      return Math.hypot(p['x'] - stood['x'], p['z'] - stood['z']);
    }).toBeGreaterThan(0.8);
    await page.keyboard.up('KeyS');

    // Escape closes it as well.
    await walkUpTo(page, { ...counter, route: counter.route.slice(-1) }, 'Shop at');
    await page.keyboard.press('KeyE');
    await expect.poll(() => panel(page)).not.toBeNull();
    await page.keyboard.press('Escape');
    await expect.poll(() => panel(page)).toBeNull();

    // Back down the aisle and out of the door onto the sidewalk.
    await walkBack(page, counter);
    await walkTo(page, shop.outside.x, shop.outside.z);
    expect((await where(page))['shop']).toBeNull();
    const out = await player(page);
    expect((await page.evaluate(([x, z]) => window.__eyewall!.probe(x!, z!), [out['x'], out['z']]))['type']).toBe('sidewalk');
    expectNoErrors(watch);
  });

  test('in a cafe the player drinks from the fridge when hurt, sits on a stool and plays the jukebox', async ({ page }) => {
    test.setTimeout(300_000);
    const watch = watchConsole(page);
    const list = await start(page);
    const cafe = pick(list, 'cafe');
    await enter(page, cafe);

    // Hurt, then a cold drink from the fridge: health comes back, once.
    await page.evaluate(() => {
      const game = window.__eyewall!.game;
      game.hurt(game.player!, 45, { by: null, cause: 'fall' });
    });
    expect((await player(page))['health']).toBe(55);
    const fridge = thingOf(cafe, 'fridge');
    await walkUpTo(page, fridge, 'cold drink');
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await player(page))['health']).toBe(80);
    // The fridge is empty for a while.
    await expect.poll(async () => (await player(page))['prompt']).not.toContain('cold drink');
    await walkBack(page, fridge);

    // A stool at the bar: sit, and any movement key stands up again.
    const stool = thingOf(cafe, 'seat', 2);
    await walkUpTo(page, stool, 'Sit down');
    const standing = await player(page);
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await player(page))['state']).toBe('seated');
    const seated = await player(page);
    expect(seated['prompt']).toBe('Stand up');
    expect(seated['y'] - standing['y'], 'sits above the floor, on the stool').toBeGreaterThan(0.2);
    expect(Math.hypot(seated['x'] - stool.x, seated['z'] - stool.z)).toBeLessThan(0.5);
    await page.keyboard.down('KeyW');
    await expect.poll(async () => (await player(page))['state']).toBe('normal');
    await page.keyboard.up('KeyW');
    await walkTo(page, stool.standX, stool.standZ);
    await walkBack(page, stool);

    // The jukebox takes a few dollars and puts on a different song each time.
    const jukebox = thingOf(cafe, 'jukebox');
    await walkUpTo(page, jukebox, 'jukebox');
    const cash = (await player(page))['cash'] as number;
    const playing = (): Promise<Rec | null> => page.evaluate(() => window.__eyewall!.ext['shops'].jukebox() as Rec | null);
    expect(await playing()).toBeNull();
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await playing())?.['plays']).toBe(1);
    const first = (await playing())!;
    expect(first['shop']).toBe(cafe.id);
    expect(first['track']).toBeTruthy();
    expect((await player(page))['cash']).toBe(cash - 5);
    await expect(page.locator('.shop-note.show')).toContainText(first['track'] as string);
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await playing())?.['plays']).toBe(2);
    expect((await playing())!['track']).not.toBe(first['track']);
    expect((await player(page))['cash']).toBe(cash - 10);
    expectNoErrors(watch);
  });

  test('in a surf shop the player changes outfit in a booth, then buys a cola from the machine outside', async ({ page }) => {
    test.setTimeout(300_000);
    const watch = watchConsole(page);
    const list = await start(page);
    const surf = pick(list, 'surf');
    await enter(page, surf);
    const outfit = (): Promise<string> => page.evaluate(() => window.__eyewall!.ext['shops'].outfitKey() as string);

    // The changing booth: a new set of clothes each time.
    const booth = thingOf(surf, 'booth');
    await walkUpTo(page, booth, 'Change outfit');
    const worn = await outfit();
    expect(worn).not.toBe('');
    await page.keyboard.press('KeyE');
    await expect.poll(outfit).not.toBe(worn);
    const second = await outfit();
    await page.keyboard.press('KeyE');
    await expect.poll(outfit).not.toBe(second);
    await page.screenshot({ path: 'evidence/t09-booth.png' });
    await walkBack(page, booth);

    // Out of the door to the drinks machine on the sidewalk: cash for a can.
    const machine = surf.interactables.find((t) => t.kind === 'vending' && t.outside);
    expect(machine, 'the surf shop has a drinks machine outside').toBeTruthy();
    await walkUpTo(page, machine!, 'Buy a');
    expect((await where(page))['shop'], 'back out on the sidewalk').toBeNull();
    const before = await player(page);
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await player(page))['items']['cola'] ?? 0).toBe((before['items']['cola'] ?? 0) + 1);
    expect((await player(page))['cash']).toBe(before['cash'] - 20);
    expectNoErrors(watch);
  });
});
