import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, watchConsole } from './helpers';

type Player = Record<string, any>;

const player = (page: Page): Promise<Player> => page.evaluate(() => window.__eyewall!.player()!);
const drop = (page: Page): Promise<Record<string, any>> => page.evaluate(() => window.__eyewall!.drop());

/** Press Play on the title screen with the seaplane drop chosen (it is the default). */
async function board(page: Page): Promise<void> {
  await expect(page.locator('.chip.on .chip-name')).toHaveText('Seaplane drop');
  await page.locator('#play').click();
  await expect.poll(async () => (await player(page))?.state, { timeout: 30_000 }).toBe('plane');
}

/** Wait for the doors and jump with the action key. */
async function jump(page: Page): Promise<void> {
  await expect.poll(async () => (await player(page)).prompt, { timeout: 60_000 }).toBe('Jump');
  await page.keyboard.press('Space');
  await expect.poll(async () => (await player(page)).state, { timeout: 20_000 }).toBe('freefall');
}

/** Wait until the player is back on their own feet (or swimming). */
async function landed(page: Page): Promise<Player> {
  await expect.poll(async () => (await player(page)).state, { timeout: 150_000, intervals: [500] }).toBe('normal');
  await page.waitForTimeout(600);
  return player(page);
}

test.describe('seaplane drop', () => {
  test('boards the seaplane, jumps, steers the fall, opens the parachute and lands alive', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await board(page);

    // Aboard: high over the bay, moving, and not yet allowed out.
    const aboard = await player(page);
    expect(aboard.altitude, 'cruising height').toBeGreaterThan(300);
    const a = await drop(page);
    expect(a.flying).toBe(true);
    expect(a.stage).toBe('aboard');
    await expect.poll(async () => (await drop(page)).travelled, { timeout: 30_000 }).toBeGreaterThan(a.travelled + 60);
    await page.screenshot({ path: 'evidence/t05-aboard.png' });

    await jump(page);
    await expect(page.locator('.altimeter')).toHaveClass(/show/);

    // Steering: holding D pushes the body toward the right of the view.
    const before = await player(page);
    const rx = Math.cos(before.camYaw);
    const rz = -Math.sin(before.camYaw);
    const sideways = before.vx * rx + before.vz * rz;
    await page.keyboard.down('KeyD');
    await expect
      .poll(
        async () => {
          const p = await player(page);
          return p.vx * rx + p.vz * rz - sideways;
        },
        { timeout: 30_000, intervals: [50] },
      )
      .toBeGreaterThan(10);
    await page.keyboard.up('KeyD');

    // Diving: holding W falls faster than the spread position ever does.
    await page.keyboard.down('KeyW');
    await expect.poll(async () => -(await player(page)).vy, { timeout: 30_000, intervals: [50] }).toBeGreaterThan(58);
    await page.keyboard.up('KeyW');
    await page.screenshot({ path: 'evidence/t05-freefall.png' });

    // Open by hand, well above where it would open by itself.
    const high = await player(page);
    expect(high.state).toBe('freefall');
    expect(high.altitude, 'still high when opening by hand').toBeGreaterThan(110);
    await page.keyboard.press('Space');
    await expect.poll(async () => (await player(page)).state, { timeout: 20_000 }).toBe('chute');
    await expect.poll(async () => -(await player(page)).vy, { timeout: 30_000 }).toBeLessThan(9.5);
    await page.screenshot({ path: 'evidence/t05-canopy.png' });

    // Under canopy the same keys steer, slower.
    await page.keyboard.down('KeyW');
    await expect.poll(async () => (await player(page)).speed, { timeout: 30_000 }).toBeGreaterThan(9);
    await page.keyboard.up('KeyW');

    const down = await landed(page);
    expect(down.alive).toBe(true);
    expect(down.health).toBe(100);
    expect(down.grounded || down.swimming, 'on the ground or in the water').toBe(true);
    expect(Math.abs(down.altitude), 'standing on what is below').toBeLessThan(2);
    expect((await drop(page)).stage).toBe('ground');
    await expect(page.locator('.altimeter')).not.toHaveClass(/show/);
    await page.screenshot({ path: 'evidence/t05-landed.png' });
    expectNoErrors(watch);
  });

  test('the parachute opens by itself and nobody rides the seaplane home', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await board(page);
    await jump(page);

    // Hands off the keys: it opens with room to stop.
    await expect.poll(async () => (await player(page)).state, { timeout: 60_000, intervals: [100] }).toBe('chute');
    const opened = await player(page);
    expect(opened.altitude, 'opened by itself').toBeGreaterThan(50);
    expect(opened.altitude).toBeLessThan(130);
    const down = await landed(page);
    expect(down.alive).toBe(true);
    expect(down.health).toBe(100);

    // A second round, never touching the keys: the end of the door window puts the player out.
    await page.evaluate(() => window.__eyewall!.startMatch());
    await expect.poll(async () => (await player(page)).state, { timeout: 20_000 }).toBe('plane');
    await expect.poll(async () => (await player(page)).state, { timeout: 90_000, intervals: [500] }).not.toBe('plane');
    const out = await drop(page);
    expect(out.travelled, 'stayed aboard to the end of the window').toBeGreaterThan(900);
    const again = await landed(page);
    expect(again.alive).toBe(true);
    expectNoErrors(watch);
  });

  test('lands on a rooftop, on a street and in the water', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    const places: { name: string; x: number; z: number; water: boolean }[] = [
      // The tower at the heart of Flamingo Heights, Avenida del Sol, and the open ocean.
      { name: 'rooftop', x: -60, z: -330, water: false },
      { name: 'street', x: -60, z: 6, water: false },
      { name: 'ocean', x: 520, z: 150, water: true },
    ];
    for (const place of places) {
      const below = await page.evaluate(([x, z]) => window.__eyewall!.probe(x!, z!), [place.x, place.z]);
      const surface = place.water ? 0 : below.ground;
      await page.evaluate(([x, z, y]) => window.__eyewall!.skydive(x!, y!, z!), [place.x, place.z, surface + 170]);
      await expect.poll(async () => (await player(page)).state, { timeout: 20_000 }).toBe('freefall');
      const down = await landed(page);
      expect(down.alive, `${place.name}: alive`).toBe(true);
      expect(down.health, `${place.name}: unhurt`).toBe(100);
      expect(Math.hypot(down.x - place.x, down.z - place.z), `${place.name}: came straight down`).toBeLessThan(6);
      if (place.water) {
        expect(down.swimming, 'swimming after a water landing').toBe(true);
      } else {
        expect(down.grounded, `${place.name}: standing`).toBe(true);
        expect(Math.abs(down.y - surface), `${place.name}: on the surface`).toBeLessThan(0.4);
      }
      if (place.name === 'rooftop') {
        expect(down.y, 'well above the street').toBeGreaterThan(20);
        await page.screenshot({ path: 'evidence/t05-rooftop.png' });
      }
    }
    expectNoErrors(watch);
  });
});
