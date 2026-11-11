import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const ARTIFACT_DIR = join(process.cwd(), 'artifacts', 'screenshots');

test.describe('Sunbreak: Biscayne - Full E2E Gameplay, Physics, Vehicles, Shops & GPU Path Tracer', () => {
  test('boots cleanly, drops via canopy, enters shops, drives cars/jetskis/boats, fights bots, and path-traces GI', async ({
    page,
  }) => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });

    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForFunction(() => window.__SUNBREAK__?.getSnapshot().ready === true, undefined, {
      timeout: 30000,
    });

    // 1. Verify initial Aircraft Flight phase & capture briefing screenshot
    let snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.phase).toBe('aircraft');
    expect(snap.aliveBots).toBe(18);
    expect(snap.playerPos.y).toBeGreaterThan(130);

    // Click "Drop Into Biscayne" -> transitions to freefall!
    await page.getByTestId('start-drop-btn').click();
    await page.evaluate(() => window.__SUNBREAK__!.stepFrames(15));
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.phase).toBe('freefall');
    await page.screenshot({ path: join(ARTIFACT_DIR, '01-miami-freefall-drop.png') });

    // 2. Deploy steerable ram-air canopy & capture canopy glide over canals & Atlantic beach
    await page.keyboard.press('Space');
    await page.evaluate(() => window.__SUNBREAK__!.stepFrames(25, { right: 0.4, forward: 1 }));
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.phase).toBe('canopy');
    await page.screenshot({ path: join(ARTIFACT_DIR, '02-ram-air-canopy-glide.png') });

    // 3. Land on Ocean Blvd, sprint with biomechanical foot IK, then walk through open doorway into Surf Shop!
    const sprintSnap = await page.evaluate(() => {
      window.__SUNBREAK__!.teleportPlayer(35.0, 2.3, 10.0, 'grounded', 0);
      window.__SUNBREAK__!.stepFrames(35, { forward: 1, sprint: true });
      return window.__SUNBREAK__!.getSnapshot();
    });
    expect(sprintSnap.phase).toBe('grounded');
    expect(sprintSnap.gaitCadenceHz).toBeGreaterThan(2.2);

    await page.evaluate(() => {
      window.__SUNBREAK__!.teleportPlayer(28.5, 2.3, -22.0, 'grounded', Math.PI * 0.5);
      window.__SUNBREAK__!.stepFrames(50, { forward: 1 });
    });
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.phase).toBe('grounded');
    expect(snap.currentShopId).toBe('surf_tactical');

    // Ring shop register / collect weapon inside shop
    const interactedId = await page.evaluate(() => {
      window.__SUNBREAK__!.teleportPlayer(19.1, 2.3, -22.0, 'grounded', Math.PI * 0.5);
      window.__SUNBREAK__!.stepFrames(5);
      return window.__SUNBREAK__!.interactNow();
    });
    expect(interactedId).not.toBeNull();
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.shield).toBeGreaterThan(50);
    await page.screenshot({ path: join(ARTIFACT_DIR, '03-enterable-miami-shop-interior.png') });

    // 4. Board Miami Convertible Sports Car & drive up onto Bayside Causeway Bridge over canal!
    const boardedCar = await page.evaluate(() => {
      const ok = window.__SUNBREAK__!.boardVehicleById('car_bayside_causeway');
      // Car starts at X = -45.5, Z = 38.0 facing East (+X) right in front of Bayside Bridge ramp!
      window.__SUNBREAK__!.stepFrames(150, { forward: 1, sprint: true });
      return ok;
    });
    expect(boardedCar).toBe(true);
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.activeVehicleKind).toBe('convertible');
    expect(snap.activeVehicleSpeedKmh).toBeGreaterThan(25);
    expect(snap.playerPos.y).toBeGreaterThan(4.2); // Climbed onto elevated bridge deck!
    await page.screenshot({ path: join(ARTIFACT_DIR, '04-convertible-car-canal-bridge.png') });

    await page.evaluate(() => window.__SUNBREAK__!.exitVehicle());

    // 5. Ride Biscayne Jet Ski & Center-Console Speedboat across canals & Atlantic Ocean
    await page.evaluate(() => {
      window.__SUNBREAK__!.boardVehicleById('jetski_bayside_marina');
      window.__SUNBREAK__!.stepFrames(85, { forward: 1, right: 0.25, sprint: true });
    });
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.activeVehicleKind).toBe('jetski');
    expect(snap.activeVehicleSpeedKmh).toBeGreaterThan(24);
    await page.screenshot({ path: join(ARTIFACT_DIR, '05-jetski-intracoastal-canal.png') });

    await page.evaluate(() => {
      window.__SUNBREAK__!.exitVehicle();
      window.__SUNBREAK__!.boardVehicleById('speedboat_atlantic_offshore');
      window.__SUNBREAK__!.stepFrames(85, { forward: 1 });
    });
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.activeVehicleKind).toBe('speedboat');
    expect(snap.activeVehicleSpeedKmh).toBeGreaterThan(16);
    await page.screenshot({ path: join(ARTIFACT_DIR, '06-speedboat-atlantic-ocean.png') });
    await page.evaluate(() => window.__SUNBREAK__!.exitVehicle());

    // 6. Verify Combat & Autonomous Bot Elimination
    const combatOutcome = await page.evaluate(() => {
      const g = window.__SUNBREAK__!;
      g.equipWeapon('marksman');
      g.stepFrames(240); // Allow drop bots to descend under canopy
      const botPos = g.getFirstAliveBotPosition();
      if (!botPos) {
        return { hits: 0, kills: 0, snap: g.getSnapshot() };
      }
      // Teleport within clear line of sight 12m from the bot
      g.teleportPlayer(botPos.x, botPos.y, botPos.z + 12, 'grounded', 0);
      let hits = 0;
      let kills = 0;
      for (let i = 0; i < 4; i++) {
        const curBot = g.getFirstAliveBotPosition() ?? botPos;
        const r = g.fireOnceAtWorldPoint(curBot.x, curBot.y + 1.2, curBot.z);
        if (r.hitTarget) hits++;
        if (r.eliminatedTarget) {
          kills++;
          break;
        }
      }
      return { hits, kills, snap: g.getSnapshot() };
    });
    expect(combatOutcome.snap.activeWeapon).toBe('marksman');
    expect(combatOutcome.hits).toBeGreaterThanOrEqual(1);
    expect(combatOutcome.kills).toBeGreaterThanOrEqual(1);

    // 7. Time-of-Day Cycle (Dawn -> Noon -> Vice Sunset -> Night) + Live BVH GPU Path-Tracing GI!
    await page.evaluate(() => {
      window.__SUNBREAK__!.teleportPlayer(31, 4.2, -8, 'grounded', -0.55);
      window.__SUNBREAK__!.setTimePreset('sunset');
      window.__SUNBREAK__!.stepFrames(6);
    });
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.timeHours).toBeCloseTo(18.35, 1);
    await page.screenshot({ path: join(ARTIFACT_DIR, '07-miami-sunset-realtime.png') });

    // Activate WebGLPathTracer BVH multi-bounce global illumination and accumulate >= 16 progressive samples!
    await page.evaluate(() => {
      window.__SUNBREAK__!.setRenderMode('pathtraced');
    });
    await page.waitForFunction(
      () => (window.__SUNBREAK__?.getSnapshot().pathTracerSamples ?? 0) >= 16,
      undefined,
      { timeout: 20000 },
    );
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.renderMode).toBe('pathtraced');
    expect(snap.pathTracerSamples).toBeGreaterThanOrEqual(16);
    await page.screenshot({ path: join(ARTIFACT_DIR, '08-miami-sunset-bvh-pathtraced-gi.png') });

    // Return seamlessly to 60Hz real-time mode
    await page.evaluate(() => {
      window.__SUNBREAK__!.setRenderMode('realtime');
      window.__SUNBREAK__!.stepFrames(5);
    });
    snap = await page.evaluate(() => window.__SUNBREAK__!.getSnapshot());
    expect(snap.renderMode).toBe('realtime');

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
