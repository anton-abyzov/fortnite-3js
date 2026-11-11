import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, watchConsole } from './helpers';

type Player = Record<string, any>;

const player = (page: Page): Promise<Player> => page.evaluate(() => window.__eyewall!.player()!);

/** Smallest signed difference between two angles. */
const angle = (a: number, b: number): number => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/** Put the player on the Avenida del Sol roadway. Yaw pi/2 faces west along it. */
async function start(page: Page, x = -60, z = 6, yaw = Math.PI / 2): Promise<void> {
  await page.evaluate(([px, pz, py]) => window.__eyewall!.startAt(px!, pz!, py!), [x, z, yaw]);
  await page.waitForTimeout(350);
}

/** Headless browsers cannot drive a locked pointer, so the view follows plain mouse movement instead. */
async function freeLook(page: Page): Promise<void> {
  await page.evaluate(() => window.__eyewall!.setFreeLook(true));
  await page.waitForTimeout(150);
  await page.mouse.move(620, 360);
  await page.mouse.move(640, 360);
  await page.waitForTimeout(100);
}

/** Hold keys, let the gait settle, then measure it over a distance (so a slow machine measures the same thing). */
async function measure(page: Page, keys: string[], metres: number): Promise<Player> {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__eyewall!.resetMetrics());
  let p = await player(page);
  for (let i = 0; i < 150 && p.anim.travel < metres; i++) {
    await page.waitForTimeout(80);
    p = await player(page);
  }
  for (const k of keys) await page.keyboard.up(k);
  await page.waitForTimeout(450);
  return p;
}

test.describe('locomotion', () => {
  test('walks, jogs, sprints and crouch-walks with planted feet and matched strides', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await start(page);

    // Each gait runs along the avenue: west when facing west, and a strafe to the left when facing north.
    const west = Math.PI / 2;
    const gaits: [string, string[], number, number][] = [
      ['walk', ['KeyW', 'AltLeft'], 1.55, west],
      ['jog', ['KeyW'], 4.7, west],
      ['sprint', ['KeyW', 'ShiftLeft'], 6.9, west],
      ['crouch', ['KeyW', 'ControlLeft'], 1.5, west],
      ['backpedal', ['KeyS'], 3.29, -west],
      ['strafe', ['KeyA'], 4.14, 0],
    ];
    const rates: Record<string, number> = {};
    for (const [name, keys, speed, yaw] of gaits) {
      await start(page, -60, 6, yaw);
      const metres = Math.max(4, speed * 1.5);
      const p = await measure(page, keys, metres);
      expect(p.speed, `${name} speed`).toBeGreaterThan(speed * 0.95);
      expect(p.speed, `${name} speed`).toBeLessThan(speed * 1.05);
      expect(p.anim.mode, name).toBe('ground');
      expect(p.grounded, name).toBe(true);
      expect(p.crouched, name).toBe(name === 'crouch');
      expect(p.anim.travel, `${name} travel`).toBeGreaterThanOrEqual(metres);
      // Stride matches ground speed: a planted foot stays where it was put down.
      expect(p.anim.slide / p.anim.travel, `${name} foot slide`).toBeLessThan(0.15);
      // Feet reach the ground they stand on.
      expect(p.anim.footErrorMax, `${name} foot height error`).toBeLessThan(0.06);
      rates[name] = p.anim.strideRate;
    }
    // Faster gaits take quicker steps, and no gait is played at a silly rate.
    expect(rates.sprint!).toBeGreaterThan(rates.jog!);
    expect(rates.jog!).toBeGreaterThan(rates.walk! * 0.95);
    for (const [name, rate] of Object.entries(rates)) {
      expect(rate, `${name} cadence in strides per second`).toBeGreaterThan(0.6);
      expect(rate, `${name} cadence in strides per second`).toBeLessThan(1.7);
    }
    await page.screenshot({ path: 'evidence/t04-locomotion.png' });
    expectNoErrors(watch);
  });

  test('legs follow the movement while the torso and head stay on the aim', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await start(page, -60, 6, 0);
    // Strafing right while aiming north: the legs run east, the chest still faces north.
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(900);
    // The shoulders swing with the arms, so the chest is judged on its average over a few strides.
    let chest = 0;
    let hips = 0;
    let head = 0;
    const samples = 40;
    let p = await player(page);
    for (let i = 0; i < samples; i++) {
      await page.waitForTimeout(40);
      p = await player(page);
      chest += angle(p.aimYaw, p.chestYaw) / samples;
      hips += angle(p.aimYaw, p.hipsYaw) / samples;
      head = Math.max(head, Math.abs(angle(p.aimYaw, p.headYaw)));
    }
    await page.keyboard.up('KeyD');
    const moveYaw = Math.atan2(-p.vx, -p.vz);
    expect(Math.abs(angle(p.aimYaw, moveYaw)), 'moving sideways to the aim').toBeGreaterThan(1.3);
    expect(Math.abs(angle(p.facing, p.aimYaw)), 'body squared to the aim').toBeLessThan(0.15);
    expect(Math.abs(p.anim.legWarp), 'legs turned toward travel').toBeGreaterThan(1.0);
    expect(Math.abs(angle(p.aimYaw + hips, moveYaw)), 'hips toward travel').toBeLessThan(0.6);
    expect(Math.abs(chest), 'chest on the aim').toBeLessThan(0.35);
    expect(Math.abs(chest - hips), 'torso twisted against the legs').toBeGreaterThan(0.8);
    expect(head, 'head on the aim').toBeLessThan(0.25);
    await page.waitForTimeout(450);

    // Standing still, a look to the side turns the head and not the feet.
    await freeLook(page);
    await start(page, -60, 6, 0);
    const before = await player(page);
    await page.mouse.move(840, 300, { steps: 10 });
    await page.waitForTimeout(700);
    const looked = await player(page);
    const turned = angle(before.camYaw, looked.camYaw);
    expect(Math.abs(turned), 'the view turned').toBeGreaterThan(0.3);
    expect(Math.abs(turned), 'but not far enough to shuffle the feet').toBeLessThan(0.9);
    expect(Math.abs(angle(before.facing, looked.facing)), 'feet stay put').toBeLessThan(0.02);
    expect(Math.abs(angle(looked.headYaw, looked.aimYaw)), 'head follows the aim').toBeLessThan(0.2);
    expect(looked.headPitch, 'head tilts with the aim').toBeGreaterThan(looked.aimPitch - 0.2);
    expect(looked.headPitch).toBeLessThan(looked.aimPitch + 0.2);
    // A look far to the side makes the feet shuffle round.
    await page.mouse.move(1240, 300, { steps: 16 });
    await page.waitForTimeout(1100);
    const far = await player(page);
    expect(Math.abs(angle(far.facing, far.aimYaw)), 'body turned to the new aim').toBeLessThan(0.2);
    expectNoErrors(watch);
  });

  test('leans into turns and into acceleration', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await freeLook(page);
    await start(page, -60, 6, Math.PI / 2);
    await page.keyboard.down('KeyW');
    // Setting off: the body pitches forward while it gathers speed.
    let pitch = 0;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(40);
      pitch = Math.max(pitch, (await player(page)).anim.leanPitch);
    }
    expect(pitch, 'forward lean while accelerating').toBeGreaterThan(0.03);
    await page.waitForTimeout(700);
    // Sweep the view right while running: the path curves right and the body rolls into it.
    let rollRight = 0;
    for (let i = 0; i < 12; i++) {
      await page.mouse.move(640 + (i + 1) * 30, 360);
      await page.waitForTimeout(33);
      rollRight = Math.max(rollRight, (await player(page)).anim.leanRoll);
    }
    let rollLeft = 0;
    for (let i = 0; i < 12; i++) {
      await page.mouse.move(1000 - (i + 1) * 30, 360);
      await page.waitForTimeout(33);
      rollLeft = Math.min(rollLeft, (await player(page)).anim.leanRoll);
    }
    await page.keyboard.up('KeyW');
    expect(rollRight, 'roll into a right turn').toBeGreaterThan(0.03);
    expect(rollLeft, 'roll into a left turn').toBeLessThan(-0.03);
    await page.waitForTimeout(900);
    const rest = await player(page);
    expect(Math.abs(rest.anim.leanRoll), 'upright again at rest').toBeLessThan(0.02);
    expectNoErrors(watch);
  });

  test('jumps, lands with a dip, and keeps its feet on kerbs and a bridge ramp', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    await start(page);
    const ground = (await player(page)).y;
    await page.keyboard.press('Space');
    let top = ground;
    let sawAir = false;
    let dip = 0;
    let settled = 0;
    for (let i = 0; i < 200 && settled < 12; i++) {
      await page.waitForTimeout(25);
      const p = await player(page);
      top = Math.max(top, p.y);
      if (p.anim.mode === 'air') sawAir = true;
      if (sawAir && p.grounded) {
        dip = Math.min(dip, p.anim.pelvis);
        settled++;
      }
    }
    const landed = await player(page);
    expect(sawAir, 'air pose during the jump').toBe(true);
    expect(top - ground, 'jump height').toBeGreaterThan(0.8);
    expect(top - ground, 'jump height').toBeLessThan(1.5);
    expect(landed.grounded).toBe(true);
    expect(Math.abs(landed.y - ground)).toBeLessThan(0.05);
    expect(dip, 'knees bend on landing').toBeLessThan(-0.03);

    // Across the planted median of the avenue: up a kerb and down again.
    await start(page, -60, 6, 0);
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(300);
    await page.evaluate(() => window.__eyewall!.resetMetrics());
    let high = 0;
    let kerb = await player(page);
    for (let i = 0; i < 120 && kerb.z > -3; i++) {
      await page.waitForTimeout(40);
      kerb = await player(page);
      high = Math.max(high, kerb.y);
    }
    await page.keyboard.up('KeyW');
    expect(high - ground, 'climbed the kerb').toBeGreaterThan(0.1);
    expect(kerb.z, 'crossed the median').toBeLessThan(0);
    expect(kerb.anim.footErrorMax, 'feet on the ground over a kerb').toBeLessThan(0.06);
    expect(kerb.anim.slide / kerb.anim.travel, 'no slide over a kerb').toBeLessThan(0.15);

    // Up the ramp of the Gran Via bridge.
    await start(page, -5, -130, 0);
    const foot = (await player(page)).y;
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__eyewall!.resetMetrics());
    let ramp = await player(page);
    for (let i = 0; i < 120 && ramp.y - foot < 1.7; i++) {
      await page.waitForTimeout(60);
      ramp = await player(page);
    }
    await page.keyboard.up('KeyW');
    expect(ramp.y - foot, 'climbed the ramp').toBeGreaterThan(1.6);
    expect(ramp.grounded).toBe(true);
    expect(ramp.anim.footErrorMax, 'feet on the ground on a slope').toBeLessThan(0.06);
    expect(ramp.anim.slide / ramp.anim.travel, 'no slide on a slope').toBeLessThan(0.15);
    await page.screenshot({ path: 'evidence/t04-bridge.png' });
    expectNoErrors(watch);
  });

  test('wades into the sea and swims', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // On the sand, facing east toward the ocean.
    await start(page, 392, 150, -Math.PI / 2);
    const dry = await player(page);
    expect(dry.swimming).toBe(false);
    await page.keyboard.down('KeyW');
    await page.keyboard.down('ShiftLeft');
    let p = dry;
    for (let i = 0; i < 60 && !p.swimming; i++) {
      await page.waitForTimeout(200);
      p = await player(page);
    }
    expect(p.swimming, 'swimming once out of depth').toBe(true);
    await page.waitForTimeout(1500);
    p = await player(page);
    expect(p.anim.mode).toBe('swim');
    expect(p.speed, 'swim speed').toBeGreaterThan(2);
    expect(p.speed).toBeLessThan(4);
    expect(p.waterDepth, 'floats with the head above water').toBeGreaterThan(0.9);
    expect(p.waterDepth).toBeLessThan(1.6);
    await page.screenshot({ path: 'evidence/t04-swim.png' });
    await page.keyboard.up('ShiftLeft');
    await page.keyboard.up('KeyW');
    // Back toward the beach: standing again in the shallows.
    await page.keyboard.down('KeyS');
    for (let i = 0; i < 80 && p.swimming; i++) {
      await page.waitForTimeout(200);
      p = await player(page);
    }
    await page.keyboard.up('KeyS');
    expect(p.swimming, 'stands up in the shallows').toBe(false);
    expectNoErrors(watch);
  });
});
